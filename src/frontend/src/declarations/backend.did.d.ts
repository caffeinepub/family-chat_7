/* eslint-disable */
// @ts-nocheck
import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';
import type { Principal } from '@icp-sdk/core/principal';

export type UserRole = { 'admin': null } | { 'user': null } | { 'guest': null };
export interface MemberInfo { 'name': string; 'joinedAt': bigint; }
export interface ChatMessage { 'id': bigint; 'senderName': string; 'text': string; 'timestamp': bigint; }
export interface Announcement { 'id': bigint; 'authorName': string; 'title': string; 'body': string; 'timestamp': bigint; }
export interface MemberCount { 'current': bigint; 'max': bigint; }
export interface CertificateResult { 'method': string; 'blob_hash': string; }
export interface RefillInfo { 'proposed_top_up_amount': [] | [bigint]; }
export interface RefillResult { 'success': [] | [boolean]; 'topped_up_amount': [] | [bigint]; }
export interface VideoParticipant { 'principal': Principal; 'name': string; }
export interface VideoSignal { 'from': Principal; 'fromName': string; 'signalType': string; 'data': string; 'timestamp': bigint; }

export interface _SERVICE {
  '_initializeAccessControlWithSecret': ActorMethod<[string], undefined>;
  'getCallerUserRole': ActorMethod<[], UserRole>;
  'assignCallerUserRole': ActorMethod<[Principal, UserRole], undefined>;
  'isCallerAdmin': ActorMethod<[], boolean>;
  'setMemberName': ActorMethod<[string], undefined>;
  'getMemberCount': ActorMethod<[], MemberCount>;
  'getMembers': ActorMethod<[], MemberInfo[]>;
  'postMessage': ActorMethod<[string], undefined>;
  'getMessages': ActorMethod<[], ChatMessage[]>;
  'postAnnouncement': ActorMethod<[string, string], undefined>;
  'getAnnouncements': ActorMethod<[], Announcement[]>;
  'joinVideoRoom': ActorMethod<[], undefined>;
  'leaveVideoRoom': ActorMethod<[], undefined>;
  'getVideoRoomParticipants': ActorMethod<[], VideoParticipant[]>;
  'sendSignal': ActorMethod<[Principal, string, string], undefined>;
  'drainSignals': ActorMethod<[], VideoSignal[]>;
  '_caffeineStorageCreateCertificate': ActorMethod<[string], CertificateResult>;
  '_caffeineStorageBlobIsLive': ActorMethod<[Uint8Array | number[]], boolean>;
  '_caffeineStorageBlobsToDelete': ActorMethod<[], Array<Uint8Array | number[]>>;
  '_caffeineStorageConfirmBlobDeletion': ActorMethod<[Array<Uint8Array | number[]>], undefined>;
  '_caffeineStorageUpdateGatewayPrincipals': ActorMethod<[], undefined>;
  '_caffeineStorageRefillCashier': ActorMethod<[[] | [RefillInfo]], RefillResult>;
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
