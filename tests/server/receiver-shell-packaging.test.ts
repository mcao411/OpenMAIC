import { describe, expect, it } from 'vitest';
import fs from 'fs/promises';

describe('receiver shell packaging assets', () => {
  it('includes a Windows packaging workflow', async () => {
    const workflow = await fs.readFile(
      '.github/workflows/receiver-shell-windows.yml',
      'utf-8',
    );

    expect(workflow).toContain('windows-latest');
    expect(workflow).toContain('receiver:tauri:build');
    expect(workflow).toContain('OpenMAIC Receiver');
  });

  it('includes packaging documentation for the receiver shell', async () => {
    const docs = await fs.readFile('docs/tauri-receiver-shell.md', 'utf-8');

    expect(docs).toContain('OpenMAIC Receiver');
    expect(docs).toContain('Windows');
    expect(docs).toContain('/receiver/<roomId>');
  });
});
