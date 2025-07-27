export function getCurrentTime(localeTime: number = 0): string {
  return new Date(Date.now() + localeTime).toISOString();
}
export function getLogTime(): string {
  const KST = 9 * 60 * 60 * 1000;
  return getCurrentTime(KST).replace('T', ' ').substring(0, 19);
}
