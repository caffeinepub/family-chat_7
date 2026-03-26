import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Announcement,
  ChatMessage,
  MemberCount,
  MemberInfo,
} from "../backend.d";
import { useActor } from "./useActor";

export function useMemberCount() {
  const { actor, isFetching } = useActor();
  return useQuery<MemberCount>({
    queryKey: ["memberCount"],
    queryFn: async () => {
      if (!actor) return { current: 0n, max: 20n };
      return (actor as any).getMemberCount();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery<"admin" | "user" | "guest" | "unregistered">({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return "unregistered";
      try {
        const role = await (actor as any).getCallerUserRole();
        // Candid variants come as { user: null }, { admin: null }, or { guest: null }
        // Some SDK versions wrap them as { __kind__: "user" } etc.
        if (role.__kind__) return role.__kind__ as "admin" | "user" | "guest";
        if ("admin" in role) return "admin";
        if ("user" in role) return "user";
        if ("guest" in role) return "guest";
        return "unregistered";
      } catch {
        return "unregistered";
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCallerMemberInfo() {
  const { actor, isFetching } = useActor();
  return useQuery<MemberInfo | null>({
    queryKey: ["callerMemberInfo"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        // Returns ?MemberInfo - either null or a MemberInfo object
        // Candid opt T comes as [] (none) or [value] (some)
        const result = await (actor as any).getCallerMemberInfo();
        if (Array.isArray(result)) {
          return result.length > 0 ? result[0] : null;
        }
        return result ?? null;
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<ChatMessage[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMessages();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 5000,
  });
}

export function useAnnouncements() {
  const { actor, isFetching } = useActor();
  return useQuery<Announcement[]>({
    queryKey: ["announcements"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getAnnouncements();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
  });
}

export function useMembers() {
  const { actor, isFetching } = useActor();
  return useQuery<MemberInfo[]>({
    queryKey: ["members"],
    queryFn: async () => {
      if (!actor) return [];
      return (actor as any).getMembers();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 30000,
  });
}

export function usePostMessage() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (text: string) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).postMessage(text);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function usePostAnnouncement() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ title, body }: { title: string; body: string }) => {
      if (!actor) throw new Error("Not connected");
      return (actor as any).postAnnouncement(title, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });
}

export function useSetMemberName() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      await (actor as any).setMemberName(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerRole"] });
      queryClient.invalidateQueries({ queryKey: ["callerMemberInfo"] });
      queryClient.invalidateQueries({ queryKey: ["members"] });
      queryClient.invalidateQueries({ queryKey: ["memberCount"] });
    },
  });
}
