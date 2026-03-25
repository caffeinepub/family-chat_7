import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { MessageCircle, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useMessages, usePostMessage } from "../hooks/useQueries";

const CHAT_SKELETONS = ["a", "b", "c", "d", "e"];

function formatTime(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "numeric",
  }).format(new Date(ms));
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "oklch(0.65 0.115 28)",
  "oklch(0.22 0.05 213)",
  "oklch(0.55 0.10 150)",
  "oklch(0.60 0.12 280)",
  "oklch(0.65 0.12 60)",
];

function getAvatarColor(name: string): string {
  let hash = 0;
  for (const char of name)
    hash = (hash * 31 + char.charCodeAt(0)) % AVATAR_COLORS.length;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function ChatTab() {
  const [text, setText] = useState("");
  const { data: messages, isLoading } = useMessages();
  const postMessage = usePostMessage();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Non-photo messages only
  const chatMessages =
    messages?.filter((m) => !m.text.startsWith("[PHOTO]:")) ?? [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setText("");
    try {
      await postMessage.mutateAsync(trimmed);
    } catch {
      toast.error("Failed to send message. Please try again.");
      setText(trimmed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-4 space-y-3">
        {CHAT_SKELETONS.map((id) => (
          <div key={id} className="flex items-start gap-3">
            <Skeleton className="w-8 h-8 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-10 w-3/4 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {chatMessages.length === 0 ? (
          <div
            data-ocid="chat.empty_state"
            className="flex flex-col items-center justify-center h-64 text-center space-y-3"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "oklch(0.65 0.115 28 / 0.1)" }}
            >
              <MessageCircle
                className="w-8 h-8"
                style={{ color: "oklch(0.65 0.115 28)" }}
              />
            </div>
            <p
              className="font-semibold"
              style={{ color: "oklch(0.22 0.05 213)" }}
            >
              No messages yet
            </p>
            <p className="text-sm" style={{ color: "oklch(0.50 0.04 213)" }}>
              Be the first to say hello to the family! 👋
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {chatMessages.map((msg, i) => (
              <div
                key={msg.id.toString()}
                data-ocid={`chat.item.${i + 1}`}
                className="flex items-start gap-3"
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback
                    className="text-white text-xs font-semibold"
                    style={{ backgroundColor: getAvatarColor(msg.senderName) }}
                  >
                    {getInitials(msg.senderName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: "oklch(0.22 0.05 213)" }}
                    >
                      {msg.senderName}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.60 0.03 213)" }}
                    >
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                  <div
                    className="rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm leading-relaxed"
                    style={{
                      backgroundColor: "white",
                      color: "oklch(0.25 0.04 213)",
                      boxShadow: "0 1px 3px oklch(0 0 0 / 0.08)",
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      <div
        className="p-4 border-t"
        style={{
          borderColor: "oklch(0.88 0.03 75)",
          backgroundColor: "oklch(0.97 0.015 75)",
        }}
      >
        <div className="flex gap-2">
          <Input
            data-ocid="chat.input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-full"
            disabled={postMessage.isPending}
          />
          <Button
            data-ocid="chat.primary_button"
            onClick={handleSend}
            disabled={!text.trim() || postMessage.isPending}
            size="icon"
            className="rounded-full text-white flex-shrink-0"
            style={{ backgroundColor: "oklch(0.65 0.115 28)" }}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
