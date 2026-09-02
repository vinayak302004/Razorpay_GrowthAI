export async function createPaymentProposal(input) {
  return {
    status: "PENDING_APPROVAL",
    ...input
  };
}
