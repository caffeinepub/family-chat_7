import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
  __kind__: "Some";
  value: T;
}
export interface None {
  __kind__: "None";
}
export type Option<T> = Some<T> | None;

export type UserRole =
  | { __kind__: "admin" }
  | { __kind__: "user" }
  | { __kind__: "guest" };

export interface MemberInfo {
  name: string;
  joinedAt: bigint;
}

export interface ChatMessage {
  id: bigint;
  senderName: string;
  text: string;
  timestamp: bigint;
}

export interface Announcement {
  id: bigint;
  authorName: string;
  title: string;
  body: string;
  timestamp: bigint;
}

export interface MemberCount {
  current: bigint;
  max: bigint;
}

export interface CertificateResult {
  method: string;
  blob_hash: string;
}

export interface RefillInfo {
  proposed_top_up_amount: Option<bigint>;
}

export interface RefillResult {
  success: Option<boolean>;
  topped_up_amount: Option<bigint>;
}

export interface VideoParticipant {
  principal: Principal;
  name: string;
}

export interface VideoSignal {
  from: Principal;
  fromName: string;
  signalType: string;
  data: string;
  timestamp: bigint;
}

export interface backendInterface {
  _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
  getCallerUserRole(): Promise<UserRole>;
  assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
  isCallerAdmin(): Promise<boolean>;
  setMemberName(name: string): Promise<void>;
  getCallerMemberInfo(): Promise<MemberInfo | null>;
  getMemberCount(): Promise<MemberCount>;
  getMembers(): Promise<MemberInfo[]>;
  postMessage(text: string): Promise<void>;
  getMessages(): Promise<ChatMessage[]>;
  postAnnouncement(title: string, body: string): Promise<void>;
  getAnnouncements(): Promise<Announcement[]>;
  // Video calling
  joinVideoRoom(): Promise<void>;
  leaveVideoRoom(): Promise<void>;
  getVideoRoomParticipants(): Promise<VideoParticipant[]>;
  sendSignal(to: Principal, signalType: string, data: string): Promise<void>;
  drainSignals(): Promise<VideoSignal[]>;
  // Blob storage
  _caffeineStorageCreateCertificate(blobHash: string): Promise<CertificateResult>;
  _caffeineStorageBlobIsLive(hash: Uint8Array): Promise<boolean>;
  _caffeineStorageBlobsToDelete(): Promise<Uint8Array[]>;
  _caffeineStorageConfirmBlobDeletion(blobs: Uint8Array[]): Promise<void>;
  _caffeineStorageUpdateGatewayPrincipals(): Promise<void>;
  _caffeineStorageRefillCashier(refillInformation: Option<RefillInfo>): Promise<RefillResult>;
}
