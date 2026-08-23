export function auditEvent({ action, status, input = null, output = null }) {
  // Replace with Prisma persistence in the next implementation phase.
  console.log("[AUDIT]", {
    timestamp: new Date().toISOString(),
    action,
    status,
    input,
    output
  });
}
