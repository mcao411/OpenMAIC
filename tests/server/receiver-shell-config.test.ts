import { describe, expect, it } from 'vitest';

describe('receiver shell config helpers', () => {
  it('normalizes server base urls and builds receiver urls', async () => {
    const {
      normalizeServerBaseUrl,
      buildReceiverUrl,
      isReceiverShellConfigValid,
    } = await import('@/lib/receiver-shell/config');

    expect(normalizeServerBaseUrl('http://192.168.1.20:6001/')).toBe(
      'http://192.168.1.20:6001',
    );
    expect(buildReceiverUrl('http://192.168.1.20:6001/', 'room-802')).toBe(
      'http://192.168.1.20:6001/receiver/room-802',
    );
    expect(
      isReceiverShellConfigValid({
        serverBaseUrl: 'http://192.168.1.20:6001/',
        roomId: 'room-802',
      }),
    ).toBe(true);
  });

  it('rejects invalid receiver shell config', async () => {
    const { isReceiverShellConfigValid } = await import('@/lib/receiver-shell/config');

    expect(
      isReceiverShellConfigValid({
        serverBaseUrl: '',
        roomId: 'room-802',
      }),
    ).toBe(false);
    expect(
      isReceiverShellConfigValid({
        serverBaseUrl: 'http://192.168.1.20:6001',
        roomId: '',
      }),
    ).toBe(false);
  });
});
