export interface ReceiverShellConfig {
  serverBaseUrl: string;
  roomId: string;
}

export function normalizeServerBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export function buildReceiverUrl(serverBaseUrl: string, roomId: string): string {
  return `${normalizeServerBaseUrl(serverBaseUrl)}/receiver/${roomId.trim()}`;
}

export function isReceiverShellConfigValid(config: ReceiverShellConfig): boolean {
  return Boolean(normalizeServerBaseUrl(config.serverBaseUrl) && config.roomId.trim());
}
