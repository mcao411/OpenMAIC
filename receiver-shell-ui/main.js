(function () {
  const STORAGE_KEY = 'openmaic.receiver-shell.config';

  const serverBaseUrlInput = document.getElementById('serverBaseUrl');
  const roomIdInput = document.getElementById('roomId');
  const autoFullscreenInput = document.getElementById('autoFullscreen');
  const autoLaunchInput = document.getElementById('autoLaunch');
  const receiverUrlPreview = document.getElementById('receiverUrlPreview');
  const statusMessage = document.getElementById('statusMessage');
  const saveConfigButton = document.getElementById('saveConfigButton');
  const launchReceiverButton = document.getElementById('launchReceiverButton');

  function normalizeServerBaseUrl(url) {
    return String(url || '').trim().replace(/\/+$/, '');
  }

  function buildReceiverUrl(serverBaseUrl, roomId) {
    return `${normalizeServerBaseUrl(serverBaseUrl)}/receiver/${String(roomId || '').trim()}`;
  }

  function readConfig() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return {};
    }
  }

  function writeConfig(config) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  function getFormState() {
    return {
      serverBaseUrl: normalizeServerBaseUrl(serverBaseUrlInput.value),
      roomId: String(roomIdInput.value || '').trim(),
      autoFullscreen: Boolean(autoFullscreenInput.checked),
      autoLaunch: Boolean(autoLaunchInput.checked),
    };
  }

  function validateConfig(config) {
    if (!config.serverBaseUrl) {
      return '请先填写服务器地址。';
    }
    if (!config.roomId) {
      return '请先填写 roomId。';
    }
    return '';
  }

  function renderPreview() {
    const config = getFormState();
    receiverUrlPreview.textContent =
      config.serverBaseUrl && config.roomId
        ? buildReceiverUrl(config.serverBaseUrl, config.roomId)
        : '未配置';
  }

  async function openReceiverWindow(config) {
    const url = buildReceiverUrl(config.serverBaseUrl, config.roomId);

    if (window.__TAURI__?.webviewWindow?.WebviewWindow) {
      const WebviewWindow = window.__TAURI__.webviewWindow.WebviewWindow;
      const existing = WebviewWindow.getByLabel
        ? WebviewWindow.getByLabel('receiver')
        : null;

      if (existing) {
        try {
          await existing.close();
        } catch {
          // ignore stale handle errors
        }
      }

      new WebviewWindow('receiver', {
        url,
        title: `OpenMAIC Receiver · ${config.roomId}`,
        fullscreen: config.autoFullscreen,
        focus: true,
        resizable: true,
      });
      statusMessage.textContent = `已打开接收端：${url}`;
      return;
    }

    window.open(url, '_blank', 'noopener,noreferrer');
    statusMessage.textContent = `浏览器模式打开：${url}`;
  }

  function hydrate() {
    const config = readConfig();
    serverBaseUrlInput.value = config.serverBaseUrl || '';
    roomIdInput.value = config.roomId || '';
    autoFullscreenInput.checked = Boolean(config.autoFullscreen);
    autoLaunchInput.checked = Boolean(config.autoLaunch);
    renderPreview();

    if (config.autoLaunch) {
      const error = validateConfig(config);
      if (!error) {
        openReceiverWindow(config).catch((err) => {
          statusMessage.textContent = err instanceof Error ? err.message : '打开接收端失败';
        });
      }
    }
  }

  saveConfigButton.addEventListener('click', () => {
    const config = getFormState();
    const error = validateConfig(config);
    if (error) {
      statusMessage.textContent = error;
      return;
    }
    writeConfig(config);
    statusMessage.textContent = '配置已保存。';
    renderPreview();
  });

  launchReceiverButton.addEventListener('click', async () => {
    const config = getFormState();
    const error = validateConfig(config);
    if (error) {
      statusMessage.textContent = error;
      return;
    }
    writeConfig(config);
    await openReceiverWindow(config);
  });

  [serverBaseUrlInput, roomIdInput, autoFullscreenInput, autoLaunchInput].forEach((element) => {
    element.addEventListener('input', renderPreview);
    element.addEventListener('change', renderPreview);
  });

  hydrate();
})();
