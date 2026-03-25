import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HttpAgent } from "@icp-sdk/core/agent";
import { Image as ImageIcon, Loader2, Upload } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { loadConfig } from "../config";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useMessages, usePostMessage } from "../hooks/useQueries";
import { StorageClient } from "../utils/StorageClient";

const PHOTO_PREFIX = "[PHOTO]:";
const GALLERY_SKELETONS = ["a", "b", "c", "d", "e", "f"];

function PhotoCard({ hash, url }: { hash: string; url: string }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <div
      className="aspect-square rounded-2xl overflow-hidden relative"
      style={{ backgroundColor: "oklch(0.90 0.03 75)" }}
    >
      {!loaded && <Skeleton className="absolute inset-0" />}
      <img
        src={url}
        alt={`Shared by family member ${hash.slice(-8)}`}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        loading="lazy"
      />
    </div>
  );
}

export default function GalleryTab() {
  const [uploading, setUploading] = useState(false);
  const [photoUrls, setPhotoUrls] = useState<Map<string, string>>(new Map());
  const { data: messages, isLoading } = useMessages();
  const postMessage = usePostMessage();
  const { identity } = useInternetIdentity();

  const photoMessages =
    messages?.filter((m) => m.text.startsWith(PHOTO_PREFIX)) ?? [];

  const getOrLoadUrl = useCallback(
    async (hash: string): Promise<string> => {
      if (photoUrls.has(hash)) return photoUrls.get(hash)!;
      const config = await loadConfig();
      const agent = new HttpAgent({
        host: config.backend_host,
        identity: identity ?? undefined,
      });
      const client = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const url = await client.getDirectURL(hash);
      setPhotoUrls((prev) => new Map(prev).set(hash, url));
      return url;
    },
    [photoUrls, identity],
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const config = await loadConfig();
      const agent = new HttpAgent({
        host: config.backend_host,
        identity: identity ?? undefined,
      });
      const client = new StorageClient(
        config.bucket_name,
        config.storage_gateway_url,
        config.backend_canister_id,
        config.project_id,
        agent,
      );
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await client.putFile(bytes);
      await postMessage.mutateAsync(`${PHOTO_PREFIX}${hash}`);
      toast.success("Shared with the family! 📸");
    } catch {
      toast.error("Failed to upload. Please try again.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // Eagerly load URLs for photos
  for (const m of photoMessages) {
    const hash = m.text.slice(PHOTO_PREFIX.length);
    if (hash && !photoUrls.has(hash)) {
      getOrLoadUrl(hash).catch(() => {});
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between p-4 border-b"
        style={{ borderColor: "oklch(0.88 0.03 75)" }}
      >
        <div>
          <h3
            className="font-semibold"
            style={{ color: "oklch(0.22 0.05 213)" }}
          >
            Family Photos
          </h3>
          <p className="text-xs" style={{ color: "oklch(0.50 0.04 213)" }}>
            {photoMessages.length} photo{photoMessages.length !== 1 ? "s" : ""}{" "}
            shared
          </p>
        </div>
        <label>
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleUpload}
            disabled={uploading}
            data-ocid="gallery.upload_button"
          />
          <Button
            asChild
            disabled={uploading}
            className="rounded-full text-white cursor-pointer"
            style={{ backgroundColor: "oklch(0.65 0.115 28)" }}
          >
            <span>
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {uploading ? "Uploading..." : "Share Photo"}
            </span>
          </Button>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GALLERY_SKELETONS.map((id) => (
              <Skeleton key={id} className="aspect-square rounded-2xl" />
            ))}
          </div>
        ) : photoMessages.length === 0 ? (
          <div
            data-ocid="gallery.empty_state"
            className="flex flex-col items-center justify-center h-64 text-center space-y-3"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "oklch(0.65 0.115 28 / 0.1)" }}
            >
              <ImageIcon
                className="w-8 h-8"
                style={{ color: "oklch(0.65 0.115 28)" }}
              />
            </div>
            <p
              className="font-semibold"
              style={{ color: "oklch(0.22 0.05 213)" }}
            >
              No photos yet
            </p>
            <p className="text-sm" style={{ color: "oklch(0.50 0.04 213)" }}>
              Share the first family memory! 📸
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photoMessages.map((msg, i) => {
              const hash = msg.text.slice(PHOTO_PREFIX.length);
              const url = photoUrls.get(hash);
              return url ? (
                <div
                  key={msg.id.toString()}
                  data-ocid={`gallery.item.${i + 1}`}
                >
                  <PhotoCard hash={hash} url={url} />
                </div>
              ) : (
                <Skeleton
                  key={msg.id.toString()}
                  className="aspect-square rounded-2xl"
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
