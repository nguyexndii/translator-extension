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
      console.error('Error aborting previous request:', e);
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

// Send trigger message to the tab (handles pre-registered content script or fallbacks to injection)
async function triggerSelection(tabId, action) {
  // Read uiLang
  const storage = await new Promise((resolve) => {
    chrome.storage.local.get(['uiLang'], (result) => resolve(result));
  });
  const uiLang = storage.uiLang || 'en';

  try {
    await chrome.tabs.sendMessage(tabId, { action: action, uiLang: uiLang });
  } catch (err) {
    console.log('Content script not ready on tab, injecting dynamically...', err);
    try {
      await chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: ['content.css']
      });

      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });

      // Retry message
      await chrome.tabs.sendMessage(tabId, { action: action, uiLang: uiLang });
    } catch (injectErr) {
      console.error('Dynamic injection failed:', injectErr);
    }
  }
}

// Listen for keyboard shortcuts defined in manifest
chrome.commands.onCommand.addListener((command) => {
  if (command === 'trigger-translation' || command === 'trigger-text-translation') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        // Prevent script injection errors on system pages
        if (isRestrictedUrl(tabs[0].url)) {
          console.warn('Không thể dịch trên trang hệ thống:', tabs[0].url);
          return;
        }
        triggerSelection(tabs[0].id, command);
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
        console.error('Error aborting request via cancel message:', e);
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
    handleTextTranslationFromPopup(message.text, message.targetLang, sendResponse);
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
async function handleCropAndTranslation(tabId, rect, dpr, context, pageScrollX = 0, pageScrollY = 0) {
  const controller = registerController(tabId);
  try {
    const storage = await new Promise((resolve) => {
      chrome.storage.local.get(['uiLang'], (result) => resolve(result));
    });
    const uiLang = storage.uiLang || 'en';
    const loadingChupText = uiLang === 'en' ? 'Capturing screen...' : 'Đang chụp màn hình...';

    chrome.tabs.sendMessage(tabId, { action: 'show-loading', text: loadingChupText });

    if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

    // Capture the entire visible viewport of the active tab
    const fullScreenshotBase64 = await chrome.tabs.captureVisibleTab(null, {
      format: 'jpeg',
      quality: 85
    });

    if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

    // Ask content script to crop the image using client canvas
    chrome.tabs.sendMessage(tabId, {
      action: 'crop-screenshot',
      base64Data: fullScreenshotBase64,
      rect: rect,
      devicePixelRatio: dpr
    }, async (response) => {
      try {
        if (controller.signal.aborted) throw new DOMException('Aborted', 'AbortError');

        if (!response) {
          const errNoResp = uiLang === 'en' ? 'Failed to crop screen selection.' : 'Không thể phản hồi từ trang web để cắt ảnh.';
          chrome.tabs.sendMessage(tabId, { action: 'show-error', error: errNoResp });
          return;
        }

        if (response.error) {
          chrome.tabs.sendMessage(tabId, { action: 'show-error', error: response.error });
          return;
        }

        const croppedBase64 = response.croppedBase64;
        const loadingDichText = uiLang === 'en' ? 'Translating...' : 'Đang dịch...';
        
        chrome.tabs.sendMessage(tabId, { action: 'show-loading', text: loadingDichText });
        await executeGeminiImageTranslation(tabId, croppedBase64, rect, context, uiLang, pageScrollX, pageScrollY, controller);
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

  const contextPrompt = context ? `\n\nWebpage context:
- Website Domain: "${context.domain || ''}"
- Page Title: "${context.pageTitle || ''}"
Use this context to accurately translate character/object names, coding terms, slang, or media elements. If there are technical codes or special gaming terms, keep them in standard formats.` : '';

  // Construct request payload
  const prompt = `Locate and translate all text in this cropped image to ${targetLang}. Return JSON output matching this schema:
{
  "detected_source_language": "detected source language name in English (e.g., English, Japanese, French, etc.)",
  "translations": [
    {
      "box_2d": [ymin, xmin, ymax, xmax],
      "original_text": "text in original language",
      "translated_text": "translated text",
      "background_color_hex": "hex color code of the background behind the text (e.g., #FFFFFF)",
      "text_color_hex": "hex color code of the original text (e.g., #000000)"
    }
  ]
}
Notes:
- The box_2d coordinates must be normalized integers in range 0-1000 relative to this cropped image where [ymin, xmin, ymax, xmax] are top, left, bottom, right.
- Translate contextually and place the translation inside translated_text.
- For original_text, keep the original raw text.
- For background_color_hex and text_color_hex, analyze the cropped image to detect the dominant background and text color of this specific block, returning valid hex codes.${contextPrompt}`;

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
      responseMimeType: 'application/json'
    }
  };

  const modelUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=';

  // Rotation call
  let callSuccess = false;
  let errorMsgs = [];

  for (let i = 0; i < apiKeys.length; i++) {
    const key = apiKeys[i];
    if (!key) continue;

    try {
      const data = await callGeminiAPI(modelUrl + key, payload, signal);
      data.target_language = targetLang;

      // Add to translation history by combining all detected text blocks
      if (data && data.translations && data.translations.length > 0) {
        const combinedOriginal = data.translations.map(t => t.original_text).filter(Boolean).join('\n');
        const combinedTranslated = data.translations.map(t => t.translated_text).filter(Boolean).join('\n');
        const detectedSourceLang = data.detected_source_language || 'Auto';
        if (combinedOriginal.trim() && combinedTranslated.trim()) {
          addToHistory(combinedOriginal, combinedTranslated, detectedSourceLang, targetLang);
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

    const contextPrompt = context ? `\n\nWebpage context:
- Website Domain: "${context.domain || ''}"
- Page Title: "${context.pageTitle || ''}"
Use this context to accurately translate character/object names, coding terms, slang, or media elements. If there are technical codes or special gaming terms, keep them in standard formats.` : '';

    const prompt = `Translate the following highlighted text to ${targetLang}. Preserve the exact paragraph structure, line breaks, and whitespace formatting of the original input text. Return a JSON object matching this schema:
{
  "detected_source_language": "detected source language name in English (e.g., English, Japanese, French, etc.)",
  "translated_text": "translated text"
}
Input text:\n\n${selectedText}${contextPrompt}`;

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

    const modelUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=';

    let callSuccess = false;
    let errorMsgs = [];

    for (let i = 0; i < apiKeys.length; i++) {
      const key = apiKeys[i];
      if (!key) continue;

      try {
        const response = await fetch(modelUrl + key, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload),
          signal: signal
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const resData = await response.json();
        const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!rawText) {
          throw new Error('Mô hình trả về rỗng.');
        }

        let resJson;
        try {
          resJson = JSON.parse(rawText.trim());
        } catch (parseErr) {
          throw new Error('Mô hình không trả về định dạng JSON.');
        }

        const structuredData = {
          detected_source_language: resJson.detected_source_language,
          target_language: targetLang,
          translations: [
            {
              box_2d: [0, 0, 1000, 1000],
              original_text: selectedText,
              translated_text: resJson.translated_text
            }
          ]
        };

        // Add to translation history
        addToHistory(selectedText, resJson.translated_text, resJson.detected_source_language, targetLang);

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

// Fetch helper that parses Gemini JSON response
async function callGeminiAPI(url, payload, signal) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    signal: signal
  });

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
    console.error('Failed to parse Gemini output as JSON:', rawText);
    throw new Error('Mô hình không trả về định dạng JSON.');
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

// Helper to save translations to local storage (max 50, FIFO, no duplicate consecutive entries)
function addToHistory(original, translated, sourceLang, targetLang) {
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
      timestamp: Date.now()
    };
    
    history.unshift(newItem);
    if (history.length > 200) {
      history = history.slice(0, 200);
    }
    
    chrome.storage.local.set({ translationHistory: history });
  });
}

// Background handler for plain text translation from popup
async function handleTextTranslationFromPopup(rawText, targetLang, sendResponse) {
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

    const prompt = `Translate the following text to ${targetLang}. Preserve the exact paragraph structure, line breaks, and whitespace formatting of the original input text. Return a JSON object matching this schema:
{
  "detected_source_language": "detected source language name in English (e.g., English, Japanese, French, etc.)",
  "translated_text": "translated text"
}
Input text:\n\n${rawText}`;

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

    const modelUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=';

    let apiCallSuccess = false;
    let errorsCollected = [];
    let translated = '';
    let detectedSource = 'Auto';

    for (let i = 0; i < apiKeys.length; i++) {
      const key = apiKeys[i];
      if (!key) continue;

      try {
        const response = await fetch(modelUrl + key, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `HTTP ${response.status}`);
        }

        const resData = await response.json();
        const rawResultText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!rawResultText) {
          throw new Error('Mô hình trả về rỗng.');
        }

        try {
          const resJson = JSON.parse(rawResultText.trim());
          translated = resJson.translated_text || rawResultText;
          detectedSource = resJson.detected_source_language || 'Auto';
        } catch (parseErr) {
          translated = rawResultText;
        }

        addToHistory(rawText, translated, detectedSource, targetLang);
        apiCallSuccess = true;
        break;
      } catch (err) {
        console.warn(`API Key index ${i} failed in background popup handler:`, err);
        errorsCollected.push(`Key ${i + 1}: ${err.message}`);
      }
    }

    if (apiCallSuccess) {
      sendResponse({ success: true, translatedText: translated, detectedSource: detectedSource });
    } else {
      sendResponse({ success: false, error: `API error / Lỗi API:\n${errorsCollected.join('\n')}` });
    }
  } catch (err) {
    sendResponse({ success: false, error: err.message });
  }
}
