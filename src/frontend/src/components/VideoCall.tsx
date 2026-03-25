import { Button } from "@/components/ui/button";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

const ICE_SERVERS = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

interface RemoteStream {
  stream: MediaStream;
  name: string;
}

interface Participant {
  principal: Principal;
  name: string;
}

function VideoTile({
  stream,
  name,
  muted = false,
  mirror = false,
}: {
  stream: MediaStream | null;
  name: string;
  muted?: boolean;
  mirror?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div
      className="relative rounded-2xl overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: "oklch(0.12 0.03 213)", aspectRatio: "16/9" }}
    >
      {stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={muted}
          className="w-full h-full object-cover"
          style={mirror ? { transform: "scaleX(-1)" } : undefined}
        />
      ) : (
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
            style={{
              backgroundColor: "oklch(0.35 0.08 213)",
              color: "oklch(0.97 0.015 80)",
            }}
          >
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      )}
      <div
        className="absolute bottom-2 left-2 px-2 py-0.5 rounded-lg text-xs font-medium"
        style={{ backgroundColor: "oklch(0 0 0 / 0.55)", color: "white" }}
      >
        {name}
      </div>
    </div>
  );
}

export default function VideoCall() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();

  const [inRoom, setInRoom] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, RemoteStream>>(
    new Map(),
  );
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [cameraError, setCameraError] = useState(false);
  const [roomFull, setRoomFull] = useState(false);

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const participantPollRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const signalPollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const knownPeersRef = useRef<Set<string>>(new Set());

  const createPeerConnection = useCallback(
    (peerPrincipalStr: string, peerName: string) => {
      const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

      pc.onicecandidate = async (event) => {
        if (event.candidate && actor) {
          const peers = peerConnectionsRef.current;
          const entry = [...peers.entries()].find(
            ([k]) => k === peerPrincipalStr,
          );
          if (!entry) return;
          try {
            const target = participants.find(
              (p) => p.principal.toString() === peerPrincipalStr,
            );
            if (target) {
              await (actor as any).sendSignal(
                target.principal,
                "candidate",
                JSON.stringify(event.candidate),
              );
            }
          } catch (_) {
            // ignore
          }
        }
      };

      pc.ontrack = (event) => {
        const stream = event.streams[0];
        setRemoteStreams((prev) => {
          const next = new Map(prev);
          next.set(peerPrincipalStr, { stream, name: peerName });
          return next;
        });
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "failed" ||
          pc.connectionState === "disconnected"
        ) {
          peerConnectionsRef.current.delete(peerPrincipalStr);
          setRemoteStreams((prev) => {
            const next = new Map(prev);
            next.delete(peerPrincipalStr);
            return next;
          });
        }
      };

      if (localStreamRef.current) {
        for (const track of localStreamRef.current.getTracks()) {
          pc.addTrack(track, localStreamRef.current);
        }
      }

      peerConnectionsRef.current.set(peerPrincipalStr, pc);
      return pc;
    },
    [actor, participants],
  );

  const drainAndProcess = useCallback(async () => {
    if (!actor || !myPrincipal) return;
    try {
      const signals = await (actor as any).drainSignals();
      for (const signal of signals) {
        const fromStr = signal.from.toString();
        if (fromStr === myPrincipal.toString()) continue;

        if (signal.signalType === "offer") {
          let pc = peerConnectionsRef.current.get(fromStr);
          if (!pc) {
            pc = createPeerConnection(fromStr, signal.fromName);
          }
          await pc.setRemoteDescription(JSON.parse(signal.data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await (actor as any).sendSignal(
            signal.from,
            "answer",
            JSON.stringify(answer),
          );
        } else if (signal.signalType === "answer") {
          const pc = peerConnectionsRef.current.get(fromStr);
          if (pc && pc.signalingState !== "stable") {
            await pc.setRemoteDescription(JSON.parse(signal.data));
          }
        } else if (signal.signalType === "candidate") {
          const pc = peerConnectionsRef.current.get(fromStr);
          if (pc?.remoteDescription) {
            await pc.addIceCandidate(JSON.parse(signal.data));
          }
        } else if (signal.signalType === "bye") {
          const pc = peerConnectionsRef.current.get(fromStr);
          if (pc) {
            pc.close();
            peerConnectionsRef.current.delete(fromStr);
          }
          setRemoteStreams((prev) => {
            const next = new Map(prev);
            next.delete(fromStr);
            return next;
          });
          knownPeersRef.current.delete(fromStr);
        }
      }
    } catch (_) {
      // ignore polling errors
    }
  }, [actor, myPrincipal, createPeerConnection]);

  const pollParticipants = useCallback(async () => {
    if (!actor || !myPrincipal) return;
    try {
      const ps = await (actor as any).getVideoRoomParticipants();
      setParticipants(ps);

      for (const p of ps) {
        const pStr = p.principal.toString();
        if (pStr === myPrincipal.toString()) continue;
        if (!knownPeersRef.current.has(pStr)) {
          knownPeersRef.current.add(pStr);
          const pc = createPeerConnection(pStr, p.name);
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          await (actor as any).sendSignal(
            p.principal,
            "offer",
            JSON.stringify(offer),
          );
        }
      }

      const activeSet = new Set(ps.map((p) => p.principal.toString()));
      for (const known of [...knownPeersRef.current]) {
        if (!activeSet.has(known)) {
          const pc = peerConnectionsRef.current.get(known);
          if (pc) {
            pc.close();
            peerConnectionsRef.current.delete(known);
          }
          setRemoteStreams((prev) => {
            const next = new Map(prev);
            next.delete(known);
            return next;
          });
          knownPeersRef.current.delete(known);
        }
      }
    } catch (_) {
      // ignore
    }
  }, [actor, myPrincipal, createPeerConnection]);

  const joinRoom = useCallback(async () => {
    if (!actor) return;
    setCameraError(false);

    try {
      const ps = await (actor as any).getVideoRoomParticipants();
      if (ps.length >= 6) {
        setRoomFull(true);
        return;
      }
      setRoomFull(false);
    } catch (_) {
      // ignore
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
    } catch (_) {
      setCameraError(true);
      return;
    }

    localStreamRef.current = stream;
    setLocalStream(stream);
    await (actor as any).joinVideoRoom();
    setInRoom(true);

    heartbeatRef.current = setInterval(() => {
      (actor as any).joinVideoRoom().catch(() => {});
    }, 10000);
    participantPollRef.current = setInterval(pollParticipants, 3000);
    signalPollRef.current = setInterval(drainAndProcess, 2000);
    pollParticipants();
  }, [actor, pollParticipants, drainAndProcess]);

  const leaveRoom = useCallback(async () => {
    if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    if (participantPollRef.current) clearInterval(participantPollRef.current);
    if (signalPollRef.current) clearInterval(signalPollRef.current);

    if (actor) {
      for (const [pStr] of peerConnectionsRef.current) {
        const pObj = participants.find((p) => p.principal.toString() === pStr);
        if (pObj) {
          (actor as any).sendSignal(pObj.principal, "bye", "").catch(() => {});
        }
      }
      (actor as any).leaveVideoRoom().catch(() => {});
    }

    if (localStreamRef.current) {
      for (const track of localStreamRef.current.getTracks()) track.stop();
    }
    for (const [, pc] of peerConnectionsRef.current) {
      pc.close();
    }
    peerConnectionsRef.current.clear();
    knownPeersRef.current.clear();

    setLocalStream(null);
    localStreamRef.current = null;
    setRemoteStreams(new Map());
    setParticipants([]);
    setInRoom(false);
    setAudioEnabled(true);
    setVideoEnabled(true);
  }, [actor, participants]);

  const toggleAudio = useCallback(() => {
    if (!localStreamRef.current) return;
    const track = localStreamRef.current.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setAudioEnabled(track.enabled);
    }
  }, []);

  const toggleVideo = useCallback(() => {
    if (!localStreamRef.current) return;
    const track = localStreamRef.current.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setVideoEnabled(track.enabled);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      if (participantPollRef.current) clearInterval(participantPollRef.current);
      if (signalPollRef.current) clearInterval(signalPollRef.current);
      if (localStreamRef.current) {
        for (const track of localStreamRef.current.getTracks()) track.stop();
      }
      for (const [, pc] of peerConnectionsRef.current) {
        pc.close();
      }
      if (actor) (actor as any).leaveVideoRoom().catch(() => {});
    };
  }, [actor]);

  const remoteEntries = [...remoteStreams.entries()];
  const totalTiles = 1 + remoteEntries.length;
  const gridCols = totalTiles <= 1 ? 1 : totalTiles <= 4 ? 2 : 3;

  if (!inRoom) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center gap-6 w-full max-w-md"
        >
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center shadow-lg"
            style={{ backgroundColor: "oklch(0.22 0.05 213)" }}
          >
            <Video className="w-9 h-9 text-white" />
          </div>

          <div className="text-center">
            <h2
              className="text-2xl font-bold mb-1"
              style={{ color: "oklch(0.22 0.05 213)" }}
            >
              Family Video Room
            </h2>
            <p className="text-sm" style={{ color: "oklch(0.50 0.03 213)" }}>
              See and hear each other in real time
            </p>
          </div>

          {participants.length > 0 && (
            <div
              className="w-full rounded-2xl p-4 border"
              style={{
                backgroundColor: "oklch(0.97 0.015 80)",
                borderColor: "oklch(0.88 0.03 75)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <Users
                  className="w-4 h-4"
                  style={{ color: "oklch(0.65 0.115 28)" }}
                />
                <span
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.22 0.05 213)" }}
                >
                  Currently in room ({participants.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {participants.map((p) => (
                  <span
                    key={p.principal.toString()}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: "oklch(0.22 0.05 213 / 0.1)",
                      color: "oklch(0.22 0.05 213)",
                    }}
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {cameraError && (
            <div
              className="w-full rounded-xl p-3 text-sm text-center"
              style={{
                backgroundColor: "oklch(0.96 0.04 25)",
                color: "oklch(0.40 0.15 25)",
              }}
              data-ocid="video.error_state"
            >
              Camera or microphone access was denied. Please allow permissions
              and try again.
            </div>
          )}

          {roomFull && (
            <div
              className="w-full rounded-xl p-3 text-sm text-center"
              style={{
                backgroundColor: "oklch(0.96 0.06 60)",
                color: "oklch(0.45 0.12 50)",
              }}
              data-ocid="video.error_state"
            >
              The room is full (max 6 participants). Try again later.
            </div>
          )}

          <Button
            onClick={joinRoom}
            data-ocid="video.primary_button"
            size="lg"
            className="w-full rounded-2xl font-semibold text-base h-12 text-white shadow-md"
            style={{ backgroundColor: "oklch(0.22 0.05 213)" }}
          >
            <Video className="w-5 h-5 mr-2" />
            Join Video Room
          </Button>

          <p
            className="text-xs text-center"
            style={{ color: "oklch(0.60 0.03 213)" }}
          >
            Up to 6 participants supported for smooth calls
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{ backgroundColor: "oklch(0.10 0.03 213)", minHeight: 0 }}
    >
      <div className="flex-1 overflow-auto p-3">
        <AnimatePresence>
          {remoteEntries.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center h-24"
            >
              <p className="text-sm" style={{ color: "oklch(0.60 0.04 213)" }}>
                Waiting for family members to join...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
          }}
        >
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <VideoTile
              stream={localStream}
              name="You"
              muted={true}
              mirror={true}
            />
          </motion.div>

          {remoteEntries.map(([pStr, { stream, name }]) => (
            <motion.div
              key={pStr}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <VideoTile stream={stream} name={name} />
            </motion.div>
          ))}
        </div>
      </div>

      <div
        className="flex items-center justify-center gap-3 p-4 border-t"
        style={{ borderColor: "oklch(0.20 0.04 213)" }}
      >
        <button
          type="button"
          onClick={toggleAudio}
          data-ocid="video.toggle"
          aria-label={audioEnabled ? "Mute microphone" : "Unmute microphone"}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
          style={{
            backgroundColor: audioEnabled
              ? "oklch(0.28 0.05 213)"
              : "oklch(0.65 0.115 28)",
          }}
        >
          {audioEnabled ? (
            <Mic className="w-5 h-5 text-white" />
          ) : (
            <MicOff className="w-5 h-5 text-white" />
          )}
        </button>

        <button
          type="button"
          onClick={toggleVideo}
          data-ocid="video.toggle"
          aria-label={videoEnabled ? "Turn off camera" : "Turn on camera"}
          className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
          style={{
            backgroundColor: videoEnabled
              ? "oklch(0.28 0.05 213)"
              : "oklch(0.65 0.115 28)",
          }}
        >
          {videoEnabled ? (
            <Camera className="w-5 h-5 text-white" />
          ) : (
            <CameraOff className="w-5 h-5 text-white" />
          )}
        </button>

        <button
          type="button"
          onClick={leaveRoom}
          data-ocid="video.delete_button"
          aria-label="Leave video room"
          className="w-14 h-12 rounded-full flex items-center justify-center transition-colors"
          style={{ backgroundColor: "oklch(0.55 0.20 25)" }}
        >
          <PhoneOff className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
}
