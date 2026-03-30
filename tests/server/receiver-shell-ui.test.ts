import { describe, expect, it } from 'vitest';
import fs from 'fs/promises';

describe('receiver shell scaffold', () => {
  it('includes a local shell settings page for server url and room id', async () => {
    const html = await fs.readFile('receiver-shell-ui/index.html', 'utf-8');
    expect(html).toContain('serverBaseUrl');
    expect(html).toContain('roomId');
    expect(html).toContain('OpenMAIC Receiver');
  });

  it('includes a tauri configuration file', async () => {
    const config = await fs.readFile('src-tauri/tauri.conf.json', 'utf-8');
    expect(config).toContain('OpenMAIC Receiver');
    expect(config).toContain('withGlobalTauri');
  });
});
