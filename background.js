// Central Gemini AI Model Configuration
const GEMINI_MODELS = [
  'gemini-3.1-flash-lite'
];

// Glossary Cache Helper Functions
async function getGlossaryEntry(key) {
  if (!key) return null;
  const storage = await new Promise((resolve) => {
    chrome.storage.local.get(['glossaryCache'], (result) => resolve(result));
  });
  const cache = storage.glossaryCache || {};
  return cache[key] || null;
}

async function updateGlossaryEntry(key, detectedSource, newTerms) {
  if (!key || !newTerms || newTerms.length === 0) return;
  const storage = await new Promise((resolve) => {
    chrome.storage.local.get(['glossaryCache'], (result) => resolve(result));
  });
  const cache = storage.glossaryCache || {};
  const entry = cache[key] || { detectedSource: detectedSource || null, terms: {}, updatedAt: 0 };
  newTerms.forEach((t) => {
    if (t && typeof t === 'string' && t.trim()) {
      entry.terms[t.trim()] = entry.terms[t.trim()] || 'giữ nguyên';
    }
  });
  if (detectedSource) {
    entry.detectedSource = detectedSource;
  }
  entry.updatedAt = Date.now();
  // Giới hạn 50 term gần nhất để tránh phình prompt
  const termKeys = Object.keys(entry.terms);
  if (termKeys.length > 50) {
    termKeys.slice(0, termKeys.length - 50).forEach((k) => delete entry.terms[k]);
  }
  // Cân nhắc giới hạn tổng số entry trong cache (VD: 100 domain gần nhất)
  const entryKeys = Object.keys(cache);
  if (entryKeys.length > 100) {
    const sortedKeys = entryKeys.sort((a, b) => (cache[a].updatedAt || 0) - (cache[b].updatedAt || 0));
    sortedKeys.slice(0, sortedKeys.length - 100).forEach((k) => delete cache[k]);
  }
  cache[key] = entry;
  chrome.storage.local.set({ glossaryCache: cache });
}

function buildGlossaryPrompt(entry) {
  if (!entry || !entry.terms || Object.keys(entry.terms).length === 0) return '';
  const lines = Object.entries(entry.terms).map(([term, note]) => `- "${term}": ${note}`).join('\n');
  const srcName = entry.detectedSource ? ` cho nguồn "${entry.detectedSource}"` : '';
  return `\n\nTHUẬT NGỮ ĐÃ DÙNG TRƯỚC ĐÓ${srcName} (giữ nhất quán, đừng đổi cách dịch/giữ):\n${lines}`;
}

async function getLastPopupSourceKey() {
  const storage = await new Promise((resolve) => {
    chrome.storage.local.get(['lastPopupSource'], (result) => resolve(result));
  });
  return storage.lastPopupSource || null;
}

function getGeminiModelUrl(apiKey, modelName = GEMINI_MODELS[0]) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${encodeURIComponent(apiKey)}`;
}

async function callGeminiApiWithFallback(apiKey, payload, signal) {
  let lastErr = null;
  for (const model of GEMINI_MODELS) {
    try {
      const url = getGeminiModelUrl(apiKey, model);
      return await callGeminiAPI(url, payload, signal);
    } catch (err) {
      lastErr = err;
      if (err.message && (err.message.includes('404') || err.message.includes('not found') || err.message.includes('not supported') || err.message.includes('HTTP 404'))) {
        console.warn(`Gemini Model ${model} not available for key, attempting fallback model...`);
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

// Helper to check if a URL is restricted by Chrome extension security policies
function isRestrictedUrl(url) {
  if (!url) return true;
  return url.startsWith('chrome://') || 
         url.startsWith('chrome-extension://') || 
         url.startsWith('brave://') || 
         url.startsWith('edge://') || 
         url.startsWith('about:') || 
         url.includes('chrome.google.com/webstore') ||
         url.includes('chromewebstore.google.com');
}

// Active AbortControllers for cancellation
const activeControllers = new Map();

function registerController(tabId) {
  if (activeControllers.has(tabId)) {
    try {
      activeControllers.get(tabId).abort();
    } catch (e) {
      console.warn('Error aborting previous request:', e);
    }
  }
  const controller = new AbortController();
  activeControllers.set(tabId, controller);
  return controller;
}

function clearController(tabId, controller) {
  if (activeControllers.get(tabId) === controller) {
    activeControllers.delete(tabId);
  }
}

async function broadcastToAllFrames(tabId, message) {
  chrome.tabs.sendMessage(tabId, message).catch(() => {});
  if (chrome.webNavigation && chrome.webNavigation.getAllFrames) {
    try {
      chrome.webNavigation.getAllFrames({ tabId: tabId }, (frames) => {
        if (frames && Array.isArray(frames)) {
          frames.forEach(f => {
            if (f.frameId !== 0) {
              chrome.tabs.sendMessage(tabId, message, { frameId: f.frameId }).catch(() => {});
            }
          });
        }
      });
    } catch (e) {}
  }
}

// Send trigger message to the tab (handles pre-registered content script or fallbacks to injection)
async function triggerSelection(tabId, action) {
  // Read uiLang
  const storage = await new Promise((resolve) => {
    chrome.storage.local.get(['uiLang'], (result) => resolve(result));
  });
  const uiLang = storage.uiLang || 'en';

  // Broadcast video pause & trigger action to ALL frames in tab
  broadcastToAllFrames(tabId, { action: 'pause-video' });
  broadcastToAllFrames(tabId, { action: action, uiLang: uiLang });

  // Ensure content script is dynamically injected if not present
  try {
    await chrome.scripting.insertCSS({
      target: { tabId: tabId, allFrames: true },
      files: ['content.css']
    });

    await chrome.scripting.executeScript({
      target: { tabId: tabId, allFrames: true },
      files: ['jsQR.js', 'content.js']
    });

    broadcastToAllFrames(tabId, { action: action, uiLang: uiLang });
  } catch (injectErr) {
    // Dynamic injection skipped if script already active
  }
}

// Listen for keyboard shortcuts defined in manifest
chrome.commands.onCommand.addListener((command) => {
  if (command === 'trigger-translation' || command === 'trigger-text-translation' || command === 'trigger-qr-translation') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        // Prevent script injection errors on system pages
        if (isRestrictedUrl(tabs[0].url)) {
          console.warn('Không thể chạy trên trang hệ thống:', tabs[0].url);
          return;
        }
        const action = command === 'trigger-qr-translation' ? 'trigger-qr-selection' : command;
        triggerSelection(tabs[0].id, action);
      }
    });
  } else if (command === 'open-history') {
    chrome.tabs.create({ url: chrome.runtime.getURL('history.html') });
  }
});

// Listen for messages from popup or content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'cancel-translation') {
    const tabId = sender.tab && sender.tab.id;
    if (tabId && activeControllers.has(tabId)) {
      try {
        activeControllers.get(tabId).abort();
      } catch (e) {
        console.warn('Error aborting request via cancel message:', e);
      }
      activeControllers.delete(tabId);
    }
    sendResponse({ status: 'cancelled' });
    return true;
  }

  if (message.action === 'start-selection-mode') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        // Prevent selection mode trigger on system pages
        if (isRestrictedUrl(tabs[0].url)) {
          sendResponse({ error: 'Không thể chạy trên trang hệ thống.' });
          return;
        }
        triggerSelection(tabs[0].id, 'trigger-selection');
        sendResponse({ status: 'initiated' });
      } else {
        sendResponse({ error: 'Không tìm thấy tab hoạt động.' });
      }
    });
    return true; // async
  }

  if (message.action === 'process-crop-selection') {
    const tabId = sender.tab.id;
    const rect = message.rect;
    const dpr = message.devicePixelRatio;
    const context = message.context;
    const pageScrollX = message.pageScrollX || 0;
    const pageScrollY = message.pageScrollY || 0;

    handleCropAndTranslation(tabId, rect, dpr, context, pageScrollX, pageScrollY);
    sendResponse({ status: 'processing' });
    return true;
  }

  if (message.action === 'add-qr-to-history') {
    addQrToHistory(message.type, message.content);
    sendResponse({ status: 'added' });
    return true;
  }

  if (message.action === 'start-auto-qr-scan') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        if (isRestrictedUrl(tabs[0].url)) {
          sendResponse({ error: 'Không thể chạy trên trang hệ thống.' });
          return;
        }
        // Start automatic screen scan
        handleAutoQrScan(tabs[0].id);
        sendResponse({ status: 'auto-scan-initiated' });
      } else {
        sendResponse({ error: 'Không tìm thấy tab hoạt động.' });
      }
    });
    return true; // async
  }

  if (message.action === 'start-qr-selection-mode') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        if (isRestrictedUrl(tabs[0].url)) {
          sendResponse({ error: 'Không thể chạy trên trang hệ thống.' });
          return;
        }
        triggerSelection(tabs[0].id, 'trigger-qr-selection');
        sendResponse({ status: 'initiated' });
      } else {
        sendResponse({ error: 'Không tìm thấy tab hoạt động.' });
      }
    });
    return true; // async
  }

  if (message.action === 'process-qr-selection') {
    const tabId = sender.tab.id;
    const rect = message.rect;
    const dpr = message.devicePixelRatio;
    const pageScrollX = message.pageScrollX || 0;
    const pageScrollY = message.pageScrollY || 0;

    handleQrCropAndDecoding(tabId, rect, dpr, pageScrollX, pageScrollY);
    sendResponse({ status: 'processing-qr' });
    return true;
  }

  if (message.action === 'process-text-selection') {
    const tabId = sender.tab.id;
    const rect = message.rect;
    const selectedText = message.text;
    const context = message.context;
    const pageScrollX = message.pageScrollX || 0;
    const pageScrollY = message.pageScrollY || 0;

    handleTextSelectionAndTranslation(tabId, selectedText, rect, context, pageScrollX, pageScrollY);
    sendResponse({ status: 'processing-text' });
    return true;
  }

  if (message.action === 'translate-text-popup') {
    handleTextTranslationFromPopup(message.text, message.targetLang, message.domain || null, sendResponse);
    return true;
  }

  if (message.action === 'translate-image-popup') {
    handleImageTranslationFromPopup(message.base64Data, message.targetLang, message.domain || null, sendResponse);
    return true;
  }

  if (message.action === 'open-popup') {
    chrome.action.openPopup(() => {
      if (chrome.runtime.lastError) {
        console.warn('Failed to open popup via chrome.action.openPopup:', chrome.runtime.lastError.message);
      }
    });
    sendResponse({ status: 'opening' });
    return true;
  }

  if (message.action === 'open-options-page') {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html?focusKey=true') });
    sendResponse({ status: 'options-opened' });
    return true;
  }
});

// Capture visible screen, crop it locally in content.js, and send it to Gemini API
// Ensure the content script is active and loaded before sending messages
async function ensureContentScriptActive(tabId) {
  try {
    // Send a ping to check if content script is ready
    await new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(tabId, { action: 'ping' }, (response) => {
        if (chrome.runtime.lastError || !response) {
          reject(new Error('No response'));
        } else {
          resolve(response);
        }
      });
    });
  } catch (err) {
    console.log('Content script not responding on tab, injecting dynamically...', err);
    try {
      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ['content.css']
      });
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['jsQR.js', 'content.js']
      });
      // Short delay for script initialization
      await new Promise(resolve => setTimeout(resolve, 80));
    } catch (injectErr) {
      console.warn('Dynamic injection failed:', injectErr);
    }
  }
}

// Ultra-fast background image cropping using OffscreenCanvas & createImageBitmap (prevents 8MB IPC overhead)
async function cropScreenshotInBackground(fullBase64, rect, dpr) {
  try {
    const tCropStart = performance.now();
    const res = await fetch(fullBase64);
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);

    // Max 500px dimension ensures lightweight ~15KB payload for ultra-fast Gemini Vision processing
    const maxDim = 500;
    let targetW = rect.w;
    let targetH = rect.h;
    if (targetW > maxDim || targetH > maxDim) {
      const scale = Math.min(maxDim / targetW, maxDim / targetH);
      targetW = Math.round(targetW * scale);
      targetH = Math.round(targetH * scale);
    }

    const canvas = new OffscreenCanvas(targetW, targetH);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(
      bitmap,
      Math.round(rect.x * dpr),
      Math.round(rect.y * dpr),
      Math.round(rect.w * dpr),
      Math.round(rect.h * dpr),
      0,
      0,
      targetW,
      targetH
    );

    const croppedBlob = await canvas.convertToBlob({ type: 'image/jpeg', quality: 0.6 });
    const arrayBuffer = await croppedBlob.arrayBuffer();
    
    let binary = '';
    const bytes = new Uint8Array(arrayBuffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const croppedData = 'data:image/jpeg;base64,' + btoa(binary);
    console.log(`⚡ [Perf] OffscreenCanvas crop completed in ${(performance.now() - tCropStart).toFixed(1)}ms (${targetW}x${targetH}px)`);
    return croppedData;
  } catch (err) {
    console.warn('Background OffscreenCanvas crop failed, fallback to content script:', err);
    return null;
  }
}

async function handleCropAndTranslation(tabId, rect, dpr, context, pageScrollX = 0, pageScrollY = 0) {
  const tTotalStart = performance.now();
  const controller = registerController(tabId);
  try {
    const storage = await new Promise((resolve) => {
      chrome.storage.local.get(['uiLang'], (result) => resolve(result));
    });
    const uiLang = storage.uiLang || 'en';
    const loadingChupText = uiLang === 'en' ? 'Capturing screen...' : 'Đang chụp màn hình...';

    chrome.tabs.sendMessage(tabId, { action: 'show-loading', text: loadingChupText });

    if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

    const tCaptureStart = performance.now();
    // Short 60ms delay ensures DOM repaints completely clean screen before capture
    await new Promise(r => setTimeout(r, 60));

    // Capture visible viewport at quality 50 for fast capture
    const fullScreenshotBase64 = await chrome.tabs.captureVisibleTab(null, {
      format: 'jpeg',
      quality: 50
    });
    const captureTime = performance.now() - tCaptureStart;

    if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

    const loadingDichText = uiLang === 'en' ? 'Translating...' : 'Đang dịch...';
    
    const tCropStart = performance.now();
    let croppedBase64 = await cropScreenshotInBackground(fullScreenshotBase64, rect, dpr);
    const cropTime = performance.now() - tCropStart;

    if (croppedBase64) {
      if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');
      chrome.tabs.sendMessage(tabId, { action: 'show-loading', text: loadingDichText });
      
      const tApiStart = performance.now();
      await executeGeminiImageTranslation(tabId, croppedBase64, rect, context, uiLang, pageScrollX, pageScrollY, controller);
      const apiTime = performance.now() - tApiStart;
      const totalTime = performance.now() - tTotalStart;

      console.log(`📊 [Crop Translation Performance Metrics]:
  • Viewport Capture: ${captureTime.toFixed(1)}ms
  • Image Cropping:   ${cropTime.toFixed(1)}ms
  • Gemini API Call:  ${apiTime.toFixed(1)}ms
  • TOTAL PIPELINE:   ${totalTime.toFixed(1)}ms`);

      clearController(tabId, controller);
      return;
    }

    // Fallback: Ask content script to crop the image using client canvas
    chrome.tabs.sendMessage(tabId, {
      action: 'crop-screenshot',
      base64Data: fullScreenshotBase64,
      rect: rect,
      devicePixelRatio: dpr
    }, async (response) => {
      try {
        if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

        if (!response || response.error) {
          const errNoResp = response?.error || (uiLang === 'en' ? 'Failed to crop screen selection.' : 'Không thể phản hồi từ trang web để cắt ảnh.');
          chrome.tabs.sendMessage(tabId, { action: 'show-error', error: errNoResp });
          return;
        }

        const croppedBase64Fallback = response.croppedBase64;
        chrome.tabs.sendMessage(tabId, { action: 'show-loading', text: loadingDichText });
        
        const tApiStart = performance.now();
        await executeGeminiImageTranslation(tabId, croppedBase64Fallback, rect, context, uiLang, pageScrollX, pageScrollY, controller);
        const apiTime = performance.now() - tApiStart;
        const totalTime = performance.now() - tTotalStart;

        console.log(`📊 [Crop Translation Fallback Metrics]:
  • Viewport Capture: ${captureTime.toFixed(1)}ms
  • Gemini API Call:  ${apiTime.toFixed(1)}ms
  • TOTAL PIPELINE:   ${totalTime.toFixed(1)}ms`);

      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Image translation aborted by user');
          return;
        }
        chrome.tabs.sendMessage(tabId, { action: 'show-error', error: err.message });
      } finally {
        clearController(tabId, controller);
      }
    });

  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Screen capture/translation aborted by user');
      return;
    }
    chrome.tabs.sendMessage(tabId, { action: 'show-error', error: err.message });
    clearController(tabId, controller);
  }
}

// Call Gemini API and return translation data back to content script
async function executeGeminiImageTranslation(tabId, croppedBase64, rect, context, uiLang, pageScrollX = 0, pageScrollY = 0, controller) {
  const signal = controller ? controller.signal : null;
  const storage = await new Promise((resolve) => {
    chrome.storage.local.get(['apiKeys', 'targetLang'], (result) => {
      resolve(result);
    });
  });

  const apiKeys = storage.apiKeys || [];
  const targetLang = storage.targetLang || 'Vietnamese';

  if (apiKeys.length === 0 || !apiKeys[0]) {
    const errorNoKey = uiLang === 'en' 
      ? 'Please configure API Keys in settings.' 
      : 'Vui lòng cấu hình API Key trong tab cài đặt.';
    chrome.tabs.sendMessage(tabId, { action: 'show-error', error: errorNoKey });
    return;
  }

  // Strip prefix "data:image/jpeg;base64," to get raw base64 data
  const base64ImageBytes = croppedBase64.split(',')[1];

  const key = (context && context.domain) ? context.domain : await getLastPopupSourceKey();
  const glossaryEntry = await getGlossaryEntry(key);
  const glossaryPrompt = buildGlossaryPrompt(glossaryEntry);

  const contextPrompt = context ? `\n\nWebpage context:
- Website Domain: "${context.domain || ''}"
- Page Title: "${context.pageTitle || ''}"` : '';

  const prompt = `Dịch toàn bộ văn bản trong ảnh crop này sang ${targetLang}.

QUY TẮC DỊCH:
1. Dịch chuẩn xác, tự nhiên, đúng ngữ cảnh (Game UI, Web UI, Bài viết, Chat, Meme, hoặc Phụ đề phim).
2. Giữ nguyên tên riêng, phím tắt, hằng số & thuật ngữ kỹ thuật/game.
3. Gom các câu/dòng văn bản trong ảnh crop thành văn bản hoàn chỉnh, dịch trôi chảy và tự nhiên.

Trả về JSON ngắn gọn đúng schema:
{
  "context_type": "software_ui" | "game" | "web_article" | "chat" | "subtitle" | "other",
  "detected_source": "tên game/app/website nếu biết, hoặc null",
  "translations": [
    {
      "original_text": "text gốc",
      "translated_text": "text đã dịch"
    }
  ]
}
Ghi chú: Trả về văn bản đã dịch đầy đủ, ngắn gọn.${contextPrompt}${glossaryPrompt}`;

  const payload = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64ImageBytes
            }
          },
          {
            text: prompt
          }
        ]
      }
    ],
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2
    }
  };

  let callSuccess = false;
  let errorMsgs = [];

  for (let i = 0; i < apiKeys.length; i++) {
    const keyItem = apiKeys[i];
    if (!keyItem) continue;

    try {
      const data = await callGeminiApiWithFallback(keyItem, payload, signal);
      data.target_language = targetLang;

      // Filter out any helper bar text if accidentally captured
      if (data && data.translations && Array.isArray(data.translations)) {
        data.translations = data.translations.filter(item => {
          const orig = (item.original_text || '').toLowerCase();
          const trans = (item.translated_text || '').toLowerCase();
          const isHelperText = orig.includes('kéo chuột') || orig.includes('drag mouse') ||
                               orig.includes('chuột phải để hủy') || trans.includes('kéo chuột') ||
                               trans.includes('drag mouse');
          return !isHelperText;
        });
      }

      const allKeptTerms = (data.translations || []).flatMap(t => t.kept_terms || []);
      if (data.detected_source) {
        chrome.storage.local.set({ lastPopupSource: data.detected_source });
      }
      await updateGlossaryEntry(key || data.detected_source, data.detected_source, allKeptTerms);

      // Add to translation history by combining all detected text blocks
      if (data && data.translations && data.translations.length > 0) {
        const combinedOriginal = data.translations.map(t => t.original_text).filter(Boolean).join('\n');
        const combinedTranslated = data.translations.map(t => t.translated_text).filter(Boolean).join('\n');
        const detectedSourceLang = data.detected_source_language || 'Auto';
        if (combinedOriginal.trim() && combinedTranslated.trim()) {
          addToHistory(combinedOriginal, combinedTranslated, detectedSourceLang, targetLang, data.context_type, data.detected_source);
        }
      }

      chrome.tabs.sendMessage(tabId, { action: 'render-translation', data: data, rect: rect, pageScrollX: pageScrollX, pageScrollY: pageScrollY });
      callSuccess = true;
      break;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw err;
      }
      console.warn(`Image API Key index ${i} failed:`, err);
      errorMsgs.push(`Key ${i + 1}: ${err.message}`);
    }
  }

  if (!callSuccess) {
    const errorFailImg = uiLang === 'en' ? 'Image translation failed:\n' : 'Dịch ảnh thất bại:\n';
    chrome.tabs.sendMessage(tabId, {
      action: 'show-error',
      error: `${errorFailImg}${errorMsgs.join('\n')}`
    });
  }
}

// Handle highlighted text translation
async function handleTextSelectionAndTranslation(tabId, selectedText, rect, context, pageScrollX = 0, pageScrollY = 0) {
  const controller = registerController(tabId);
  const signal = controller.signal;
  try {
    const storage = await new Promise((resolve) => {
      chrome.storage.local.get(['apiKeys', 'targetLang', 'uiLang'], (result) => {
        resolve(result);
      });
    });

    const apiKeys = storage.apiKeys || [];
    const targetLang = storage.targetLang || 'Vietnamese';
    const uiLang = storage.uiLang || 'en';
    const loadingDichText = uiLang === 'en' ? 'Translating...' : 'Đang dịch...';

    chrome.tabs.sendMessage(tabId, { action: 'show-loading', text: loadingDichText });

    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

    if (apiKeys.length === 0 || !apiKeys[0]) {
      const errorNoKey = uiLang === 'en' 
        ? 'Please configure API Keys in settings.' 
        : 'Vui lòng cấu hình API Key trong tab cài đặt.';
      chrome.tabs.sendMessage(tabId, { action: 'show-error', error: errorNoKey });
      return;
    }

    const key = (context && context.domain) ? context.domain : await getLastPopupSourceKey();
    const glossaryEntry = await getGlossaryEntry(key);
    const glossaryPrompt = buildGlossaryPrompt(glossaryEntry);

    const contextPrompt = context ? `\n\nWebpage context:
- Website Domain: "${context.domain || ''}"
- Page Title: "${context.pageTitle || ''}"` : '';

    const prompt = `Dịch đoạn text được bôi đen dưới đây sang ${targetLang}. Giữ nguyên cấu trúc đoạn văn, xuống dòng và khoảng trắng của bản gốc.

Trước khi dịch, xác định ngữ cảnh dựa trên metadata trang web (domain, tiêu đề trang) và nội dung của chính đoạn text: đây là bài viết, UI phần mềm, đoạn chat, hội thoại/cốt truyện game, hay loại khác. Nếu nội dung thuộc về 1 game/app cụ thể mà bạn nhận ra tên, ghi vào detected_source.

Nếu là nội dung game: giữ nguyên tên riêng (nhân vật, địa danh), thuật ngữ hệ thống (skill, item, currency trong game) và các từ mượn quen thuộc với cộng đồng (boss, combo, gacha...) — trừ khi có bản Việt hóa chính thức phổ biến.

Trả về JSON đúng schema, không thêm text khác:
{
  "context_type": "game" | "software_ui" | "web_article" | "chat" | "subtitle" | "document" | "other",
  "detected_source": "tên game/app/website cụ thể nếu nhận ra, hoặc null",
  "detected_source_language": "tên ngôn ngữ gốc bằng tiếng Anh",
  "translated_text": "text đã dịch",
  "kept_terms": ["các thuật ngữ giữ nguyên, nếu có"]
}
Input text:\n\n${selectedText}${contextPrompt}${glossaryPrompt}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    let callSuccess = false;
    let errorMsgs = [];

    for (let i = 0; i < apiKeys.length; i++) {
      const keyItem = apiKeys[i];
      if (!keyItem) continue;

      try {
        const data = await callGeminiApiWithFallback(keyItem, payload, signal);
        const translatedText = data.translated_text || '';
        const detectedSourceLang = data.detected_source_language || 'Auto';

        if (selectedText.trim() && translatedText.trim()) {
          addToHistory(selectedText, translatedText, detectedSourceLang, targetLang, data.context_type, data.detected_source);
        }

        if (data.detected_source) {
          chrome.storage.local.set({ lastPopupSource: data.detected_source });
        }
        await updateGlossaryEntry(key || data.detected_source, data.detected_source, data.kept_terms || []);

        const structuredData = {
          context_type: data.context_type,
          detected_source: data.detected_source,
          detected_source_language: detectedSourceLang,
          target_language: targetLang,
          translations: [
            {
              box_2d: [0, 0, 1000, 1000],
              original_text: selectedText,
              translated_text: translatedText,
              kept_terms: data.kept_terms || []
            }
          ]
        };

        chrome.tabs.sendMessage(tabId, { action: 'render-translation', data: structuredData, rect: rect, isText: true, pageScrollX: pageScrollX, pageScrollY: pageScrollY });
        callSuccess = true;
        break;
      } catch (err) {
        if (err.name === 'AbortError') {
          throw err;
        }
        console.warn(`Text API Key index ${i} failed:`, err);
        errorMsgs.push(`Key ${i + 1}: ${err.message}`);
      }
    }

    if (!callSuccess) {
      const errorFailTxt = uiLang === 'en' ? 'Text translation failed:\n' : 'Dịch chữ thất bại:\n';
      chrome.tabs.sendMessage(tabId, {
        action: 'show-error',
        error: `${errorFailTxt}${errorMsgs.join('\n')}`
      });
    }

  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Text translation aborted by user');
      return;
    }
    chrome.tabs.sendMessage(tabId, { action: 'show-error', error: err.message });
  } finally {
    clearController(tabId, controller);
  }
}

// Fetch helper that parses Gemini JSON response with 15s timeout
async function callGeminiAPI(url, payload, externalSignal) {
  // Combine externalSignal with a 15s timeout signal so fetch never hangs forever
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 15000);
  
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => timeoutController.abort());
  }

  const tApiStart = performance.now();

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: timeoutController.signal
    });

    clearTimeout(timeoutId);
    console.log(`🌐 [Gemini API Response Time]: ${(performance.now() - tApiStart).toFixed(1)}ms`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    const resData = await response.json();
    const candidates = resData.candidates;
    
    if (!candidates || candidates.length === 0 || !candidates[0].content?.parts?.[0]?.text) {
      throw new Error('Mô hình không trả về nội dung hợp lệ.');
    }

    const rawText = candidates[0].content.parts[0].text;
    
    try {
      return JSON.parse(rawText.trim());
    } catch (parseErr) {
      console.warn('Failed to parse Gemini output as JSON:', rawText);
      throw new Error('Mô hình không trả về định dạng JSON.');
    }
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Yêu cầu dịch đã quá thời gian phản hồi (Timeout 15s). Vui lòng kiểm tra kết nối mạng hoặc API Key.');
    }
    throw err;
  }
}

// Register the right-click context menu item on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translate-selected-text",
    title: "Translate highlighted text",
    contexts: ["selection"]
  }, () => {
    if (chrome.runtime.lastError) {}
  });

  chrome.storage.local.get(['uiLang'], (result) => {
    const uiLang = result.uiLang || 'en';
    const title = uiLang === 'vi' ? 'Dịch văn bản bôi đen' : 'Translate highlighted text';
    chrome.contextMenus.update("translate-selected-text", { title: title }, () => {
      if (chrome.runtime.lastError) {}
    });
  });
});

// Update the context menu title dynamically if the user changes the UI display language
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.uiLang) {
    const newLang = changes.uiLang.newValue;
    const title = newLang === 'vi' ? 'Dịch văn bản bôi đen' : 'Translate highlighted text';
    chrome.contextMenus.update("translate-selected-text", { title: title }, () => {
      if (chrome.runtime.lastError) {} // Ignore error if not created yet
    });
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translate-selected-text" && tab && tab.id) {
    if (isRestrictedUrl(tab.url)) {
      console.warn('Không thể dịch trên trang hệ thống:', tab.url);
      return;
    }
    triggerSelection(tab.id, 'trigger-text-translation');
  }
});

// Helper to save translations to local storage (max 100, FIFO, no duplicate consecutive entries)
function addToHistory(original, translated, sourceLang, targetLang, contextType = null, detectedSource = null) {
  if (!original || !translated) return;
  const originalClean = original.trim();
  const translatedClean = translated.trim();

  chrome.storage.local.get(['translationHistory'], (result) => {
    let history = result.translationHistory || [];
    
    // Prevent duplicate consecutive entries
    if (history.length > 0) {
      const last = history[0];
      if (last.original === originalClean && last.targetLang === targetLang) {
        return;
      }
    }
    
    const newItem = {
      id: Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      original: originalClean,
      translated: translatedClean,
      sourceLang: sourceLang || 'Auto',
      targetLang: targetLang || 'Vietnamese',
      contextType: contextType || null,
      detectedSource: detectedSource || null,
      timestamp: Date.now()
    };
    
    history.unshift(newItem);
    if (history.length > 100) history = history.slice(0, 100);
    chrome.storage.local.set({ translationHistory: history });
  });
}

function addQrToHistory(type, content) {
  if (!content) return;
  const contentClean = content.trim();

  chrome.storage.local.get(['qrHistory'], (result) => {
    let history = result.qrHistory || [];
    
    // Prevent duplicate consecutive entries of same content and type within last 10 entries to avoid spam
    const exists = history.slice(0, 10).some(item => item.type === type && item.content === contentClean);
    if (exists) {
      history = history.filter(item => !(item.type === type && item.content === contentClean));
    }
    
    const newItem = {
      id: 'qr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
      type: type, // 'scan' or 'generate'
      content: contentClean,
      timestamp: Date.now()
    };
    
    history.unshift(newItem);
    chrome.storage.local.set({ qrHistory: history });
  });
}

// Background handler for plain text translation from popup
async function handleTextTranslationFromPopup(rawText, targetLang, popupDomain, sendResponse) {
  try {
    const storage = await new Promise((resolve) => {
      chrome.storage.local.get(['apiKeys', 'uiLang'], (result) => {
        resolve(result);
      });
    });

    const apiKeys = storage.apiKeys || [];
    const uiLang = storage.uiLang || 'en';

    if (apiKeys.length === 0 || !apiKeys[0]) {
      const errorNoKey = uiLang === 'en' 
        ? 'Please configure API Keys in settings.' 
        : 'Vui lòng cấu hình API Key trong tab cài đặt.';
      sendResponse({ success: false, error: errorNoKey });
      return;
    }

    const key = popupDomain || await getLastPopupSourceKey();
    const glossaryEntry = await getGlossaryEntry(key);
    const glossaryPrompt = buildGlossaryPrompt(glossaryEntry);

    const prompt = `Dịch đoạn text sau sang ${targetLang}. Giữ nguyên cấu trúc đoạn văn, xuống dòng và khoảng trắng của bản gốc.

Xác định ngữ cảnh nội dung dựa trên chính văn bản: đây là bài viết, UI phần mềm, đoạn chat, hội thoại/cốt truyện game hay loại khác. Nếu nhận ra đây là nội dung từ 1 game/app cụ thể, ghi vào detected_source.

Nếu là nội dung game: giữ nguyên tên riêng, thuật ngữ hệ thống (skill, item, currency) và từ mượn quen thuộc cộng đồng — trừ khi có bản Việt hóa chính thức phổ biến.

Trả về JSON đúng schema, không thêm text khác:
{
  "context_type": "game" | "software_ui" | "web_article" | "chat" | "subtitle" | "document" | "other",
  "detected_source": "tên game/app cụ thể nếu nhận ra, hoặc null",
  "detected_source_language": "tên ngôn ngữ gốc bằng tiếng Anh",
  "translated_text": "text đã dịch",
  "kept_terms": ["các thuật ngữ giữ nguyên, nếu có"]
}
Input text:\n\n${rawText}${glossaryPrompt}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    let apiCallSuccess = false;
    let errorsCollected = [];
    let translated = '';
    let detectedSource = 'Auto';

    for (let i = 0; i < apiKeys.length; i++) {
      const keyItem = apiKeys[i];
      if (!keyItem) continue;

      try {
        const resJson = await callGeminiApiWithFallback(keyItem, payload, null);
        translated = resJson.translated_text || '';
        detectedSource = resJson.detected_source_language || 'Auto';

        addToHistory(rawText, translated, detectedSource, targetLang, resJson.context_type, resJson.detected_source);

        if (resJson.detected_source) {
          chrome.storage.local.set({ lastPopupSource: resJson.detected_source });
        }
        await updateGlossaryEntry(key || resJson.detected_source, resJson.detected_source, resJson.kept_terms || []);

        apiCallSuccess = true;
        sendResponse({
          success: true,
          translatedText: translated,
          detectedSource: detectedSource,
          contextType: resJson.context_type || null,
          detectedAppSource: resJson.detected_source || null,
          keptTerms: resJson.kept_terms || []
        });
        break;
      } catch (err) {
        console.warn(`API Key index ${i} failed in background popup handler:`, err);
        errorsCollected.push(`Key ${i + 1}: ${err.message}`);
      }
    }

    if (!apiCallSuccess) {
      sendResponse({ success: false, error: `API error / Lỗi API:\n${errorsCollected.join('\n')}` });
    }
  } catch (err) {
    sendResponse({ success: false, error: err.message });
  }
}

async function handleImageTranslationFromPopup(base64Data, targetLang, popupDomain, sendResponse) {
  try {
    const storage = await new Promise((resolve) => {
      chrome.storage.local.get(['apiKeys', 'uiLang'], (result) => {
        resolve(result);
      });
    });

    const apiKeys = storage.apiKeys || [];
    const uiLang = storage.uiLang || 'en';

    if (apiKeys.length === 0 || !apiKeys[0]) {
      const errorNoKey = uiLang === 'en' 
        ? 'Please configure API Keys in settings.' 
        : 'Vui lòng cấu hình API Key trong tab cài đặt.';
      sendResponse({ success: false, error: errorNoKey });
      return;
    }

    const base64ImageBytes = base64Data.split(',')[1];
    const mimeType = base64Data.split(',')[0].split(':')[1].split(';')[0] || 'image/jpeg';

    const key = popupDomain || await getLastPopupSourceKey();
    const glossaryEntry = await getGlossaryEntry(key);
    const glossaryPrompt = buildGlossaryPrompt(glossaryEntry);

    const prompt = `Xác định các ký tự chữ viết thực sự xuất hiện trong ảnh này và dịch sang ${targetLang}.

QUY TẮC BẮT BUỘC:
- KHÔNG đoán, mô tả, hoặc bịa ra text không có thật.
- KHÔNG decode/dịch/mô tả mã QR, barcode, icon, logo hay hoạ tiết hình ảnh. Mã QR KHÔNG phải là text chữ viết.
- Nếu ảnh không có ký tự chữ viết thực sự nào (chữ cái, số, câu), PHẢI trả về chuỗi rỗng "" cho cả "original_text" và "translated_text".
- Không tự bịa text dựa theo suy đoán ngữ cảnh (VD: thấy mã QR không có nghĩa là có chữ "Scan QR code").

Trước khi dịch, xác định ngữ cảnh dựa trên dấu hiệu hình ảnh (HUD, thanh máu, icon vật phẩm, khung hội thoại, bố cục menu, font chữ, logo phần mềm...): đây là game, phần mềm/UI, bài viết, đoạn chat, phụ đề, hay loại khác. Nếu nhận ra tên game/app cụ thể, ghi vào detected_source.

Nếu là nội dung game: giữ nguyên tên riêng, thuật ngữ hệ thống (skill, item, currency), từ mượn quen thuộc cộng đồng (boss, combo, gacha...) — trừ khi có bản Việt hóa chính thức phổ biến.

Trả về JSON đúng schema, không thêm text khác:
{
  "context_type": "game" | "software_ui" | "web_article" | "chat" | "subtitle" | "document" | "other",
  "detected_source": "tên game/app cụ thể nếu nhận ra, hoặc null",
  "detected_source_language": "tên ngôn ngữ gốc bằng tiếng Anh",
  "original_text": "toàn bộ text gốc nhận diện được, giữ xuống dòng phù hợp",
  "translated_text": "text đã dịch, giữ cùng cấu trúc xuống dòng",
  "kept_terms": ["các thuật ngữ giữ nguyên, nếu có"]
}${glossaryPrompt}`;

    const payload = {
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64ImageBytes
              }
            },
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    let apiCallSuccess = false;
    let errorsCollected = [];
    let translated = '';
    let original = '';
    let detectedSource = 'Auto';

    for (let i = 0; i < apiKeys.length; i++) {
      const keyItem = apiKeys[i];
      if (!keyItem) continue;

      try {
        const resJson = await callGeminiApiWithFallback(keyItem, payload, null);
        translated = resJson.translated_text || '';
        original = resJson.original_text || '';
        detectedSource = resJson.detected_source_language || 'Auto';

        if (original.trim() && translated.trim()) {
          addToHistory(original, translated, detectedSource, targetLang, resJson.context_type, resJson.detected_source);
        } else if (translated.trim()) {
          addToHistory('Image Translation', translated, detectedSource, targetLang, resJson.context_type, resJson.detected_source);
        }

        if (resJson.detected_source) {
          chrome.storage.local.set({ lastPopupSource: resJson.detected_source });
        }
        await updateGlossaryEntry(key || resJson.detected_source, resJson.detected_source, resJson.kept_terms || []);

        apiCallSuccess = true;
        sendResponse({
          success: true,
          translatedText: translated,
          originalText: original,
          detectedSource: detectedSource,
          contextType: resJson.context_type || null,
          detectedAppSource: resJson.detected_source || null,
          keptTerms: resJson.kept_terms || []
        });
        break;
      } catch (err) {
        console.warn(`API Key index ${i} failed in background image popup handler:`, err);
        errorsCollected.push(`Key ${i + 1}: ${err.message}`);
      }
    }

    if (apiCallSuccess) {
      sendResponse({ success: true, translatedText: translated, originalText: original, detectedSource: detectedSource });
    } else {
      sendResponse({ success: false, error: `API error / Lỗi API:\n${errorsCollected.join('\n')}` });
    }
  } catch (err) {
    sendResponse({ success: false, error: err.message });
  }
}


// Capture visible screen, crop it locally in content.js, and decode QR
async function handleQrCropAndDecoding(tabId, rect, dpr, pageScrollX = 0, pageScrollY = 0) {
  await ensureContentScriptActive(tabId);
  const controller = registerController(tabId);
  try {
    const storage = await new Promise((resolve) => {
      chrome.storage.local.get(['uiLang'], (result) => resolve(result));
    });
    const uiLang = storage.uiLang || 'en';
    const loadingText = uiLang === 'en' ? 'Scanning QR...' : 'Đang quét QR...';

    chrome.tabs.sendMessage(tabId, { action: 'show-loading', text: loadingText });

    if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

    // Capture the entire visible viewport at quality 50 for fast capture
    const fullScreenshotBase64 = await chrome.tabs.captureVisibleTab(null, {
      format: 'jpeg',
      quality: 50
    });

    if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

    // Send to content script to crop and decode QR
    chrome.tabs.sendMessage(tabId, {
      action: 'crop-and-decode-qr',
      base64Data: fullScreenshotBase64,
      rect: rect,
      devicePixelRatio: dpr
    }, (response) => {
      try {
        if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

        if (!response) {
          const errNoResp = uiLang === 'en' ? 'Failed to communicate with the webpage.' : 'Không thể kết nối với trang web.';
          chrome.tabs.sendMessage(tabId, { action: 'show-error', error: errNoResp });
          return;
        }

        if (response.error) {
          chrome.tabs.sendMessage(tabId, { action: 'show-error', error: response.error });
          return;
        }

        const qrResult = response.result;
        if (qrResult && qrResult.success) {
          if (qrResult.codes && qrResult.codes.length > 1) {
            // Add to QR history
            qrResult.codes.forEach(code => {
              addQrToHistory('scan', code.text);
            });
            // Render multiple QR results if multiple QR codes were found in selection
            chrome.tabs.sendMessage(tabId, {
              action: 'render-multiple-qr-results',
              codes: qrResult.codes,
              devicePixelRatio: qrResult.devicePixelRatio || 1,
              pageScrollX: pageScrollX,
              pageScrollY: pageScrollY
            });
          } else {
            // Single QR result
            addQrToHistory('scan', qrResult.text);
            chrome.tabs.sendMessage(tabId, {
              action: 'render-qr-result',
              text: qrResult.text,
              rect: rect,
              pageScrollX: pageScrollX,
              pageScrollY: pageScrollY
            });
          }
        } else {
          const errorMsg = qrResult && qrResult.error 
            ? qrResult.error 
            : (uiLang === 'en' ? 'No QR code found in selection.' : 'Không tìm thấy mã QR trong vùng chọn.');
          chrome.tabs.sendMessage(tabId, { action: 'show-error', error: errorMsg });
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        chrome.tabs.sendMessage(tabId, { action: 'show-error', error: err.message });
      } finally {
        clearController(tabId, controller);
      }
    });

  } catch (err) {
    if (err.name === 'AbortError') return;
    chrome.tabs.sendMessage(tabId, { action: 'show-error', error: err.message });
    clearController(tabId, controller);
  }
}

async function handleAutoQrScan(tabId) {
  await ensureContentScriptActive(tabId);
  const controller = registerController(tabId);
  try {
    const storage = await new Promise((resolve) => {
      chrome.storage.local.get(['uiLang'], (result) => resolve(result));
    });
    const uiLang = storage.uiLang || 'en';
    const loadingText = uiLang === 'en' ? 'Scanning screen for QR...' : 'Đang quét QR trên màn hình...';

    chrome.tabs.sendMessage(tabId, { action: 'show-loading', text: loadingText });

    if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

    // Wait 300ms for popup to close completely and page to redraw
    await new Promise((resolve) => setTimeout(resolve, 150));

    if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

    // Capture the entire visible viewport of the active tab
    const fullScreenshotBase64 = await chrome.tabs.captureVisibleTab(null, {
      format: 'jpeg',
      quality: 85
    });

    if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

    // Send full screen screenshot to content script to decode automatically
    chrome.tabs.sendMessage(tabId, {
      action: 'auto-decode-qr',
      base64Data: fullScreenshotBase64
    }, (response) => {
      try {
        if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

        if (!response) {
          const errNoResp = uiLang === 'en' ? 'Failed to communicate with the webpage.' : 'Không thể kết nối với trang web.';
          chrome.tabs.sendMessage(tabId, { action: 'show-error', error: errNoResp });
          return;
        }

        if (response.error) {
          chrome.tabs.sendMessage(tabId, { action: 'show-error', error: response.error });
          return;
        }

        const qrResult = response.result;
        if (qrResult && qrResult.success && qrResult.codes && qrResult.codes.length > 0) {
          // Add to QR history
          qrResult.codes.forEach(code => {
            addQrToHistory('scan', code.text);
          });
          // Send render message for multiple QR codes
          chrome.tabs.sendMessage(tabId, {
            action: 'render-multiple-qr-results',
            codes: qrResult.codes,
            devicePixelRatio: qrResult.devicePixelRatio || 1,
            pageScrollX: qrResult.pageScrollX || 0,
            pageScrollY: qrResult.pageScrollY || 0
          });
        } else {
          // Automatic scanning failed to find a QR code.
          // Show a toast message, then automatically trigger manual selection mode!
          const noticeMsg = uiLang === 'en' 
            ? 'No QR found automatically. Please draw a box to scan.' 
            : 'Không tìm thấy QR tự động. Hãy vẽ vùng chọn chứa mã QR!';
          
          chrome.tabs.sendMessage(tabId, { action: 'show-error', error: noticeMsg });
          
          // Wait 2s for the toast to be readable, then start selection mode
          setTimeout(() => {
            triggerSelection(tabId, 'trigger-qr-selection');
          }, 2000);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        chrome.tabs.sendMessage(tabId, { action: 'show-error', error: err.message });
      } finally {
        clearController(tabId, controller);
      }
    });

  } catch (err) {
    if (err.name === 'AbortError') return;
    chrome.tabs.sendMessage(tabId, { action: 'show-error', error: err.message });
    clearController(tabId, controller);
  }
}
