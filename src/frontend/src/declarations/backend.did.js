/* eslint-disable */
// @ts-nocheck
import { IDL } from '@icp-sdk/core/candid';

const UserRole = IDL.Variant({ admin: IDL.Null, user: IDL.Null, guest: IDL.Null });
const MemberInfo = IDL.Record({ name: IDL.Text, joinedAt: IDL.Int });
const ChatMessage = IDL.Record({ id: IDL.Nat, senderName: IDL.Text, text: IDL.Text, timestamp: IDL.Int });
const Announcement = IDL.Record({ id: IDL.Nat, authorName: IDL.Text, title: IDL.Text, body: IDL.Text, timestamp: IDL.Int });
const MemberCount = IDL.Record({ current: IDL.Nat, max: IDL.Nat });
const CertificateResult = IDL.Record({ method: IDL.Text, blob_hash: IDL.Text });
const RefillInfo = IDL.Record({ proposed_top_up_amount: IDL.Opt(IDL.Nat) });
const RefillResult = IDL.Record({ success: IDL.Opt(IDL.Bool), topped_up_amount: IDL.Opt(IDL.Nat) });
const VideoParticipant = IDL.Record({ principal: IDL.Principal, name: IDL.Text });
const VideoSignal = IDL.Record({ from: IDL.Principal, fromName: IDL.Text, signalType: IDL.Text, data: IDL.Text, timestamp: IDL.Int });

export const idlService = IDL.Service({
  _initializeAccessControlWithSecret: IDL.Func([IDL.Text], [], []),
  getCallerUserRole: IDL.Func([], [UserRole], ['query']),
  assignCallerUserRole: IDL.Func([IDL.Principal, UserRole], [], []),
  isCallerAdmin: IDL.Func([], [IDL.Bool], ['query']),
  setMemberName: IDL.Func([IDL.Text], [], []),
  getMemberCount: IDL.Func([], [MemberCount], ['query']),
  getMembers: IDL.Func([], [IDL.Vec(MemberInfo)], ['query']),
  postMessage: IDL.Func([IDL.Text], [], []),
  getMessages: IDL.Func([], [IDL.Vec(ChatMessage)], ['query']),
  postAnnouncement: IDL.Func([IDL.Text, IDL.Text], [], []),
  getAnnouncements: IDL.Func([], [IDL.Vec(Announcement)], ['query']),
  joinVideoRoom: IDL.Func([], [], []),
  leaveVideoRoom: IDL.Func([], [], []),
  getVideoRoomParticipants: IDL.Func([], [IDL.Vec(VideoParticipant)], ['query']),
  sendSignal: IDL.Func([IDL.Principal, IDL.Text, IDL.Text], [], []),
  drainSignals: IDL.Func([], [IDL.Vec(VideoSignal)], []),
  _caffeineStorageCreateCertificate: IDL.Func([IDL.Text], [CertificateResult], []),
  _caffeineStorageBlobIsLive: IDL.Func([IDL.Vec(IDL.Nat8)], [IDL.Bool], ['query']),
  _caffeineStorageBlobsToDelete: IDL.Func([], [IDL.Vec(IDL.Vec(IDL.Nat8))], ['query']),
  _caffeineStorageConfirmBlobDeletion: IDL.Func([IDL.Vec(IDL.Vec(IDL.Nat8))], [], []),
  _caffeineStorageUpdateGatewayPrincipals: IDL.Func([], [], []),
  _caffeineStorageRefillCashier: IDL.Func([IDL.Opt(RefillInfo)], [RefillResult], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL }) => {
  const UserRole = IDL.Variant({ admin: IDL.Null, user: IDL.Null, guest: IDL.Null });
  const MemberInfo = IDL.Record({ name: IDL.Text, joinedAt: IDL.Int });
  const ChatMessage = IDL.Record({ id: IDL.Nat, senderName: IDL.Text, text: IDL.Text, timestamp: IDL.Int });
  const Announcement = IDL.Record({ id: IDL.Nat, authorName: IDL.Text, title: IDL.Text, body: IDL.Text, timestamp: IDL.Int });
  const MemberCount = IDL.Record({ current: IDL.Nat, max: IDL.Nat });
  const CertificateResult = IDL.Record({ method: IDL.Text, blob_hash: IDL.Text });
  const RefillInfo = IDL.Record({ proposed_top_up_amount: IDL.Opt(IDL.Nat) });
  const RefillResult = IDL.Record({ success: IDL.Opt(IDL.Bool), topped_up_amount: IDL.Opt(IDL.Nat) });
  const VideoParticipant = IDL.Record({ principal: IDL.Principal, name: IDL.Text });
  const VideoSignal = IDL.Record({ from: IDL.Principal, fromName: IDL.Text, signalType: IDL.Text, data: IDL.Text, timestamp: IDL.Int });
  return IDL.Service({
    _initializeAccessControlWithSecret: IDL.Func([IDL.Text], [], []),
    getCallerUserRole: IDL.Func([], [UserRole], ['query']),
    assignCallerUserRole: IDL.Func([IDL.Principal, UserRole], [], []),
    isCallerAdmin: IDL.Func([], [IDL.Bool], ['query']),
    setMemberName: IDL.Func([IDL.Text], [], []),
    getMemberCount: IDL.Func([], [MemberCount], ['query']),
    getMembers: IDL.Func([], [IDL.Vec(MemberInfo)], ['query']),
    postMessage: IDL.Func([IDL.Text], [], []),
    getMessages: IDL.Func([], [IDL.Vec(ChatMessage)], ['query']),
    postAnnouncement: IDL.Func([IDL.Text, IDL.Text], [], []),
    getAnnouncements: IDL.Func([], [IDL.Vec(Announcement)], ['query']),
    joinVideoRoom: IDL.Func([], [], []),
    leaveVideoRoom: IDL.Func([], [], []),
    getVideoRoomParticipants: IDL.Func([], [IDL.Vec(VideoParticipant)], ['query']),
    sendSignal: IDL.Func([IDL.Principal, IDL.Text, IDL.Text], [], []),
    drainSignals: IDL.Func([], [IDL.Vec(VideoSignal)], []),
    _caffeineStorageCreateCertificate: IDL.Func([IDL.Text], [CertificateResult], []),
    _caffeineStorageBlobIsLive: IDL.Func([IDL.Vec(IDL.Nat8)], [IDL.Bool], ['query']),
    _caffeineStorageBlobsToDelete: IDL.Func([], [IDL.Vec(IDL.Vec(IDL.Nat8))], ['query']),
    _caffeineStorageConfirmBlobDeletion: IDL.Func([IDL.Vec(IDL.Vec(IDL.Nat8))], [], []),
    _caffeineStorageUpdateGatewayPrincipals: IDL.Func([], [], []),
    _caffeineStorageRefillCashier: IDL.Func([IDL.Opt(RefillInfo)], [RefillResult], []),
  });
};

export const init = ({ IDL }) => { return []; };
