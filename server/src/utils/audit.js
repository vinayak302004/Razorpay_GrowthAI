export function auditEvent({ action, status, input = null, output = null }) {
  console.log("[AUDIT]", {
    timestamp: new Date().toISOString(),
    action,
    status,
    input,
    output
  });
}
