import type { Principal } from "@icp-sdk/core/principal";
import type {
  Announcement,
  CertificateResult,
  ChatMessage,
  MemberCount,
  MemberInfo,
  RefillInfo,
  RefillResult,
  UserRole,
} from "./backend.d";

declare module "./backend" {
  interface backendInterface {
    _initializeAccessControlWithSecret(userSecret: string): Promise<void>;
    getCallerUserRole(): Promise<UserRole>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    setMemberName(name: string): Promise<void>;
    getMemberCount(): Promise<MemberCount>;
    getMembers(): Promise<MemberInfo[]>;
    postMessage(text: string): Promise<void>;
    getMessages(): Promise<ChatMessage[]>;
    postAnnouncement(title: string, body: string): Promise<void>;
    getAnnouncements(): Promise<Announcement[]>;
    _caffeineStorageCreateCertificate(
      blobHash: string,
    ): Promise<CertificateResult>;
    _caffeineStorageBlobIsLive(hash: Uint8Array): Promise<boolean>;
    _caffeineStorageBlobsToDelete(): Promise<Uint8Array[]>;
    _caffeineStorageConfirmBlobDeletion(blobs: Uint8Array[]): Promise<void>;
    _caffeineStorageUpdateGatewayPrincipals(): Promise<void>;
    _caffeineStorageRefillCashier(
      refillInformation: [] | [RefillInfo],
    ): Promise<RefillResult>;
  }

  // Override createActor return type so config.ts can return backendInterface
  function createActor(
    canisterId: string,
    _uploadFile: (file: ExternalBlob) => Promise<Uint8Array>,
    _downloadFile: (file: Uint8Array) => Promise<ExternalBlob>,
    options?: CreateActorOptions,
  ): backendInterface;
}
