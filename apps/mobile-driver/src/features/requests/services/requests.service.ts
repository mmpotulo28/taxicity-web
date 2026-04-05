import { emitWithAck } from "../../../core/socket/client";
export async function syncDriverRequests() {
  return emitWithAck("driver-requests-sync", {});
}

export async function acceptDriverRequest(requestId: string) {
  return emitWithAck("ride-accepted", { requestId });
}

export async function declineDriverRequest(requestId: string) {
  // TODO(contract): pending backend confirmation for explicit decline socket event + ack contract.
  void requestId;
  return { success: true };
}
