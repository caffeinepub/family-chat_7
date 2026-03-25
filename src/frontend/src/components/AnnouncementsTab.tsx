import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Megaphone, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAnnouncements, usePostAnnouncement } from "../hooks/useQueries";

const ANN_SKELETONS = ["a", "b", "c"];

function formatDate(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
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

export default function AnnouncementsTab() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const { data: announcements, isLoading } = useAnnouncements();
  const postAnnouncement = usePostAnnouncement();

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    try {
      await postAnnouncement.mutateAsync({
        title: title.trim(),
        body: body.trim(),
      });
      toast.success("Announcement posted! 📢");
      setTitle("");
      setBody("");
      setOpen(false);
    } catch {
      toast.error("Failed to post. Please try again.");
    }
  };

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
            Family Announcements
          </h3>
          <p className="text-xs" style={{ color: "oklch(0.50 0.04 213)" }}>
            {announcements?.length ?? 0} announcement
            {announcements?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              data-ocid="announcements.open_modal_button"
              className="rounded-full text-white"
              style={{ backgroundColor: "oklch(0.65 0.115 28)" }}
            >
              <Plus className="w-4 h-4 mr-2" /> Post
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="announcements.dialog">
            <DialogHeader>
              <DialogTitle
                className="font-display"
                style={{ color: "oklch(0.22 0.05 213)" }}
              >
                New Announcement
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePost} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ann-title">Title</Label>
                <Input
                  id="ann-title"
                  data-ocid="announcements.input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Family Reunion 2026!"
                  maxLength={100}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ann-body">Details</Label>
                <Textarea
                  id="ann-body"
                  data-ocid="announcements.textarea"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Share the details with the family..."
                  rows={4}
                  maxLength={1000}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  data-ocid="announcements.cancel_button"
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  data-ocid="announcements.submit_button"
                  disabled={
                    !title.trim() || !body.trim() || postAnnouncement.isPending
                  }
                  className="text-white"
                  style={{ backgroundColor: "oklch(0.65 0.115 28)" }}
                >
                  {postAnnouncement.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Posting...
                    </>
                  ) : (
                    <>Post Announcement</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          ANN_SKELETONS.map((id) => (
            <Card key={id} className="border-0 shadow-sm">
              <CardContent className="pt-4 space-y-2">
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))
        ) : !announcements || announcements.length === 0 ? (
          <div
            data-ocid="announcements.empty_state"
            className="flex flex-col items-center justify-center h-64 text-center space-y-3"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "oklch(0.65 0.115 28 / 0.1)" }}
            >
              <Megaphone
                className="w-8 h-8"
                style={{ color: "oklch(0.65 0.115 28)" }}
              />
            </div>
            <p
              className="font-semibold"
              style={{ color: "oklch(0.22 0.05 213)" }}
            >
              No announcements yet
            </p>
            <p className="text-sm" style={{ color: "oklch(0.50 0.04 213)" }}>
              Post the first family announcement!
            </p>
          </div>
        ) : (
          [...announcements].reverse().map((ann, i) => (
            <Card
              key={ann.id.toString()}
              data-ocid={`announcements.item.${i + 1}`}
              className="border-0 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="pt-4">
                <div className="flex items-start justify-between mb-2">
                  <h4
                    className="font-display font-bold text-base leading-tight"
                    style={{ color: "oklch(0.22 0.05 213)" }}
                  >
                    {ann.title}
                  </h4>
                  <span
                    className="text-xs ml-3 flex-shrink-0"
                    style={{ color: "oklch(0.60 0.03 213)" }}
                  >
                    {formatDate(ann.timestamp)}
                  </span>
                </div>
                <p
                  className="text-sm leading-relaxed mb-3"
                  style={{ color: "oklch(0.35 0.04 213)" }}
                >
                  {ann.body}
                </p>
                <div className="flex items-center gap-2">
                  <Avatar className="w-5 h-5">
                    <AvatarFallback
                      className="text-white text-xs"
                      style={{ backgroundColor: "oklch(0.65 0.115 28)" }}
                    >
                      {getInitials(ann.authorName)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.55 0.04 213)" }}
                  >
                    {ann.authorName}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
