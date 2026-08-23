// Payment actions must be gated and audited.
// The Razorpay secret must only be used server-side.

export async function createPaymentProposal(input) {
  return {
    status: "PENDING_APPROVAL",
    ...input
  };
}
