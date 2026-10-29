/** GitHub workflow-command data must not create new commands or lines. */
export function workflowError(message) {
  return "::error title=Browser audit::" + message
    .replaceAll("%", "%25")
    .replaceAll("\r", "%0D")
    .replaceAll("\n", "%0A");
}

export function failureMessage(check) {
  return check.name + (check.details === undefined ? "" : "\n" + JSON.stringify(check.details));
}
