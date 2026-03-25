import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Users } from "lucide-react";
import { useMemberCount, useMembers } from "../hooks/useQueries";

const MEMBER_SKELETONS = ["a", "b", "c", "d", "e"];

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

function formatJoined(ts: bigint): string {
  const ms = Number(ts) / 1_000_000;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(new Date(ms));
}

export default function MembersTab() {
  const { data: members, isLoading } = useMembers();
  const { data: memberCount } = useMemberCount();

  const current = memberCount
    ? Number(memberCount.current)
    : (members?.length ?? 0);
  const max = memberCount ? Number(memberCount.max) : 20;
  const fillPct = Math.round((current / max) * 100);

  return (
    <div className="flex flex-col h-full">
      <div
        className="p-4 border-b"
        style={{ borderColor: "oklch(0.88 0.03 75)" }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3
            className="font-semibold"
            style={{ color: "oklch(0.22 0.05 213)" }}
          >
            Family Members
          </h3>
          <Badge
            variant="outline"
            style={{
              borderColor: "oklch(0.22 0.05 213)",
              color: "oklch(0.22 0.05 213)",
            }}
          >
            <Users className="w-3 h-3 mr-1" />
            {current} / {max}
          </Badge>
        </div>
        <div className="space-y-1">
          <Progress value={fillPct} className="h-2" />
          <p className="text-xs" style={{ color: "oklch(0.55 0.04 213)" }}>
            {max - current} spot{max - current !== 1 ? "s" : ""} remaining
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="space-y-3">
            {MEMBER_SKELETONS.map((id) => (
              <div key={id} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : !members || members.length === 0 ? (
          <div
            data-ocid="members.empty_state"
            className="flex flex-col items-center justify-center h-48 text-center space-y-3"
          >
            <Users
              className="w-12 h-12"
              style={{ color: "oklch(0.65 0.115 28 / 0.5)" }}
            />
            <p className="text-sm" style={{ color: "oklch(0.50 0.04 213)" }}>
              No members yet
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {members.map((m, i) => (
              <li
                key={m.name}
                data-ocid={`members.item.${i + 1}`}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white transition-colors"
              >
                <Avatar className="w-10 h-10">
                  <AvatarFallback
                    className="text-white font-semibold text-sm"
                    style={{ backgroundColor: getAvatarColor(m.name) }}
                  >
                    {getInitials(m.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p
                    className="font-medium text-sm truncate"
                    style={{ color: "oklch(0.22 0.05 213)" }}
                  >
                    {m.name}
                  </p>
                  <p
                    className="text-xs"
                    style={{ color: "oklch(0.55 0.04 213)" }}
                  >
                    Joined {formatJoined(m.joinedAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
