export function createReconnectDelay(attempt: number) {
  const capped = Math.min(attempt, 6);
  return Math.min(30000, 500 * 2 ** capped);
}
