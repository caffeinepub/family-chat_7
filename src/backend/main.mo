import AccessControl "./authorization/access-control";
import Storage "./blob-storage/Storage";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Prim "mo:prim";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";

actor {
  // ---- State ----
  let accessControlState : AccessControl.AccessControlState = AccessControl.initState();
  transient let _caffeineStorageState : Storage.State = Storage.new();

  transient let MAX_MEMBERS : Nat = 20;
  var registeredCount : Nat = 0;

  type MemberInfo = { name : Text; joinedAt : Int };
  let memberNames = Map.empty<Principal, MemberInfo>();

  type ChatMessage = { id : Nat; senderName : Text; text : Text; timestamp : Int };
  var chatMessages : [ChatMessage] = [];
  var nextMsgId : Nat = 0;

  type Announcement = { id : Nat; authorName : Text; title : Text; body : Text; timestamp : Int };
  var announcements : [Announcement] = [];
  var nextAnnId : Nat = 0;

  // ---- Video Call Signaling ----
  type Signal = { from : Principal; fromName : Text; signalType : Text; data : Text; timestamp : Int };
  let pendingSignals = Map.empty<Principal, [Signal]>();
  let roomParticipants = Map.empty<Principal, Int>();
  transient let ROOM_TIMEOUT_NS : Int = 30_000_000_000;

  // ---- Authorization ----
  public shared ({ caller }) func _initializeAccessControlWithSecret(userSecret : Text) : async () {
    let alreadyRegistered = switch (accessControlState.userRoles.get(caller)) {
      case (?_) { true };
      case (null) { false };
    };
    if (not alreadyRegistered) {
      if (registeredCount >= MAX_MEMBERS) {
        Runtime.trap("Family is full. Maximum 20 members allowed.");
      };
      registeredCount += 1;
    };
    switch (Prim.envVar<system>("CAFFEINE_ADMIN_TOKEN")) {
      case (null) { Runtime.trap("CAFFEINE_ADMIN_TOKEN environment variable is not set") };
      case (?adminToken) { AccessControl.initialize(accessControlState, caller, adminToken, userSecret) };
    };
  };

  public query ({ caller }) func getCallerUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  public shared ({ caller }) func assignCallerUserRole(user : Principal, role : AccessControl.UserRole) : async () {
    AccessControl.assignRole(accessControlState, caller, user, role);
  };

  public query ({ caller }) func isCallerAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  // ---- Blob Storage ----
  type _CaffeineStorageRefillInformation = { proposed_top_up_amount : ?Nat };
  type _CaffeineStorageRefillResult = { success : ?Bool; topped_up_amount : ?Nat };
  type _CaffeineStorageCreateCertificateResult = { method : Text; blob_hash : Text };

  public shared ({ caller }) func _caffeineStorageRefillCashier(refillInformation : ?_CaffeineStorageRefillInformation) : async _CaffeineStorageRefillResult {
    let cashier = await Storage.getCashierPrincipal();
    if (cashier != caller) { Runtime.trap("Unauthorized access") };
    await Storage.refillCashier(_caffeineStorageState, cashier, refillInformation);
  };

  public shared (_) func _caffeineStorageUpdateGatewayPrincipals() : async () {
    await Storage.updateGatewayPrincipals(_caffeineStorageState);
  };

  public query (_) func _caffeineStorageBlobIsLive(hash : Blob) : async Bool {
    Prim.isStorageBlobLive(hash);
  };

  public query ({ caller }) func _caffeineStorageBlobsToDelete() : async [Blob] {
    if (not Storage.isAuthorized(_caffeineStorageState, caller)) {
      Runtime.trap("Unauthorized access");
    };
    let deadBlobs = Prim.getDeadBlobs();
    switch (deadBlobs) {
      case (null) { [] };
      case (?deadBlobs) { deadBlobs.sliceToArray(0, 10000) };
    };
  };

  public shared ({ caller }) func _caffeineStorageConfirmBlobDeletion(blobs : [Blob]) : async () {
    if (not Storage.isAuthorized(_caffeineStorageState, caller)) {
      Runtime.trap("Unauthorized access");
    };
    Prim.pruneConfirmedDeadBlobs(blobs);
    type GC = actor { __motoko_gc_trigger : () -> async () };
    let myGC = actor (debug_show (Prim.getSelfPrincipal<system>())) : GC;
    await myGC.__motoko_gc_trigger();
  };

  public shared (_) func _caffeineStorageCreateCertificate(blobHash : Text) : async _CaffeineStorageCreateCertificateResult {
    { method = "upload"; blob_hash = blobHash };
  };

  // ---- Member Profile ----
  public shared ({ caller }) func setMemberName(name : Text) : async () {
    ignore AccessControl.getUserRole(accessControlState, caller);
    let info : MemberInfo = { name = name; joinedAt = Time.now() };
    memberNames.add(caller, info);
  };

  public query (_) func getMemberCount() : async { current : Nat; max : Nat } {
    { current = registeredCount; max = MAX_MEMBERS };
  };

  public query (_) func getMembers() : async [MemberInfo] {
    memberNames.values().toArray();
  };

  // ---- Chat ----
  public shared ({ caller }) func postMessage(text : Text) : async () {
    ignore AccessControl.getUserRole(accessControlState, caller);
    let name = switch (memberNames.get(caller)) {
      case (?info) { info.name };
      case (null) { "Family Member" };
    };
    let msg : ChatMessage = {
      id = nextMsgId;
      senderName = name;
      text = text;
      timestamp = Time.now();
    };
    chatMessages := chatMessages.concat([msg]);
    nextMsgId += 1;
  };

  public query (_) func getMessages() : async [ChatMessage] {
    chatMessages;
  };

  // ---- Announcements ----
  public shared ({ caller }) func postAnnouncement(title : Text, body : Text) : async () {
    ignore AccessControl.getUserRole(accessControlState, caller);
    let name = switch (memberNames.get(caller)) {
      case (?info) { info.name };
      case (null) { "Family Member" };
    };
    let ann : Announcement = {
      id = nextAnnId;
      authorName = name;
      title = title;
      body = body;
      timestamp = Time.now();
    };
    announcements := announcements.concat([ann]);
    nextAnnId += 1;
  };

  public query (_) func getAnnouncements() : async [Announcement] {
    announcements;
  };

  // ---- Video Call Signaling ----

  public shared ({ caller }) func joinVideoRoom() : async () {
    ignore AccessControl.getUserRole(accessControlState, caller);
    roomParticipants.add(caller, Time.now());
  };

  public shared ({ caller }) func leaveVideoRoom() : async () {
    roomParticipants.remove(caller);
    pendingSignals.remove(caller);
  };

  public query (_) func getVideoRoomParticipants() : async [{ principal : Principal; name : Text }] {
    let now = Time.now();
    var result : [{ principal : Principal; name : Text }] = [];
    for ((p, lastPing) in roomParticipants.entries()) {
      if (now - lastPing < ROOM_TIMEOUT_NS) {
        let name = switch (memberNames.get(p)) {
          case (?info) { info.name };
          case (null) { "Family Member" };
        };
        let entry : { principal : Principal; name : Text } = { principal = p; name = name };
        result := result.concat([entry]);
      };
    };
    result;
  };

  public shared ({ caller }) func sendSignal(to : Principal, signalType : Text, data : Text) : async () {
    ignore AccessControl.getUserRole(accessControlState, caller);
    let fromName = switch (memberNames.get(caller)) {
      case (?info) { info.name };
      case (null) { "Family Member" };
    };
    let signal : Signal = {
      from = caller;
      fromName = fromName;
      signalType = signalType;
      data = data;
      timestamp = Time.now();
    };
    let existing : [Signal] = switch (pendingSignals.get(to)) {
      case (?sigs) { sigs };
      case (null) { [] };
    };
    pendingSignals.add(to, existing.concat([signal]));
  };

  public shared ({ caller }) func drainSignals() : async [Signal] {
    ignore AccessControl.getUserRole(accessControlState, caller);
    let signals : [Signal] = switch (pendingSignals.get(caller)) {
      case (?sigs) { sigs };
      case (null) { [] };
    };
    pendingSignals.remove(caller);
    signals;
  };
}
