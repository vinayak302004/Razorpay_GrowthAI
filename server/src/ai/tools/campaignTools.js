export async function createCampaignProposal(input) {
  return {
    status: "PENDING_APPROVAL",
    ...input
  };
}
