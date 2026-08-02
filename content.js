(() => {
  // Prevent duplicate script execution
  if (window.gstInitialized) return;
  window.gstInitialized = true;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  let selectionOverlay = null;
  let helperBar = null;
  let loadingOverlay = null;
  let translationContainer = null;
  let currentUiLang = 'en'; // default UI language
  let isTranslating = false;
  let autoPausedVideos = [];
  let preventReplayListeners = [];

  function pauseAllPlayingVideos() {
    autoPausedVideos = [];
    preventReplayListeners = [];

    function scanAndPause(root) {
      if (!root) return;
      try {
        const vids = root.querySelectorAll ? Array.from(root.querySelectorAll('video')) : [];
        vids.forEach(v => {
          if (!v.paused && !v.ended) {
            try {
              v.pause();
              autoPausedVideos.push(v);
            } catch (e) {}
          }

          // Intercept any forced replay attempts by site JS while selection/translation is active
          const preventReplay = (e) => {
            if (isTranslating || selectionOverlay) {
              e.preventDefault();
              e.stopPropagation();
              if (e.stopImmediatePropagation) e.stopImmediatePropagation();
              try { v.pause(); } catch (err) {}
            }
          };

          try {
            v.addEventListener('play', preventReplay, true);
            v.addEventListener('playing', preventReplay, true);
            preventReplayListeners.push({ video: v, listener: preventReplay });
          } catch (err) {}
        });

        const allEls = root.querySelectorAll ? Array.from(root.querySelectorAll('*')) : [];
        allEls.forEach(el => {
          if (el.shadowRoot) scanAndPause(el.shadowRoot);
        });
      } catch (err) {}
    }
    scanAndPause(document);
  }

  function resumeAutoPausedVideo() {
    // Remove replay prevention listeners
    preventReplayListeners.forEach(item => {
      try {
        item.video.removeEventListener('play', item.listener, true);
        item.video.removeEventListener('playing', item.listener, true);
      } catch (e) {}
    });
    preventReplayListeners = [];

    if (Array.isArray(autoPausedVideos) && autoPausedVideos.length > 0) {
      autoPausedVideos.forEach(v => {
        try {
          v.play().catch(() => {});
        } catch (e) {}
      });
      autoPausedVideos = [];
    }
  }

  // Robustly append overlay to active container (handles HTML5 Fullscreen mode and windowed mode)
  function appendToActiveContainer(el) {
    if (!el) return;
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (fsEl) {
      const container = (fsEl.tagName === 'VIDEO' && fsEl.parentElement) ? fsEl.parentElement : fsEl;
      try {
        if (window.getComputedStyle(container).position === 'static') {
          container.style.position = 'relative';
        }
      } catch (e) {}
      container.appendChild(el);
    } else {
      (document.body || document.documentElement).appendChild(el);
    }
  }

  function removeFromActiveContainer(el) {
    if (el) {
      try { el.remove(); } catch (e) {}
    }
  }

  // Get active container, support fullscreen mode (e.g. YouTube, Netflix, HTML5 Video players)
  function getActiveContainer() {
    const fs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (fs) {
      const container = (fs.tagName === 'VIDEO' && fs.parentElement) ? fs.parentElement : fs;
      try {
        const compPos = window.getComputedStyle(container).position;
        if (compPos === 'static') {
          container.style.position = 'relative';
        }
      } catch (e) {}
      return container;
    }
    return document.body || document.documentElement;
  }

  const CONTENT_LOCALIZATION = {
    vi: {
      helperText: 'Kéo chuột để chọn vùng màn hình cần dịch',
      cancelText: '(ESC hoặc Chuột phải để hủy)',
      alertNoHighlight: 'Vui lòng bôi đen văn bản trên trang web trước khi dịch!',
      noTextFound: 'Không tìm thấy chữ nào.',
      closeAllTooltip: 'Đóng tất cả bản dịch',
      errorTitle: 'Lỗi Dịch Thuật',
      errorInvalidKey: 'API Key không hợp lệ. Vui lòng kiểm tra lại cấu hình API Key trong trang Cài đặt (Cấu hình).',
      errorQuota: 'Đã hết lượt sử dụng miễn phí (Vượt quá Quota). Vui lòng thử lại sau hoặc thêm API Key khác.',
      errorNetwork: 'Không kết nối được Internet hoặc API bị chặn. Vui lòng kiểm tra mạng hoặc VPN.',
      errorGeneric: 'Dịch thất bại. Chi tiết lỗi:',
      contextInvalidated: 'Tiện ích đã được tải lại hoặc cập nhật. Vui lòng tải lại (F5) trang web để tiếp tục sử dụng Screen Translator.'
    },
    en: {
      helperText: 'Drag mouse to select screen region to translate',
      cancelText: '(ESC or Right-click to cancel)',
      alertNoHighlight: 'Please highlight text on the webpage before translating!',
      noTextFound: 'No text found.',
      closeAllTooltip: 'Close all translations',
      errorTitle: 'Translation Error',
      errorInvalidKey: 'Invalid API Key. Please check your API Key configuration in the Settings.',
      errorQuota: 'Quota exceeded. Please try again later or add another API Key.',
      errorNetwork: 'Unable to connect to the Internet or API is blocked. Please check your connection or VPN.',
      errorGeneric: 'Translation failed. Details:',
      contextInvalidated: 'Extension context was invalidated due to reload/update. Please reload (F5) the webpage to continue using Screen Translator.'
    }
  };

  function isContextValid() {
    return typeof chrome !== 'undefined' && chrome.runtime && !!chrome.runtime.id;
  }

  function safeSendMessage(message, callback) {
    if (!isContextValid()) {
      const dict = CONTENT_LOCALIZATION[currentUiLang] || CONTENT_LOCALIZATION.vi;
      showToastError(dict.contextInvalidated);
      return;
    }
    try {
      chrome.runtime.sendMessage(message, callback);
    } catch (err) {
      console.warn("Screen Translator: Failed to send message.", err);
    }
  }

  const LANGUAGE_MAP = {
    'vietnamese': 'Tiếng Việt',
    'english': 'Tiếng Anh',
    'japanese': 'Tiếng Nhật',
    'chinese': 'Tiếng Trung',
    'korean': 'Tiếng Hàn',
    'french': 'Tiếng Pháp',
    'german': 'Tiếng Đức',
    'spanish': 'Tiếng Tây Ban Nha',
    'italic': 'Tiếng Ý',
    'italian': 'Tiếng Ý',
    'russian': 'Tiếng Nga',
    'portuguese': 'Tiếng Bồ Đào Nha',
    'thai': 'Tiếng Thái',
    'indonesian': 'Tiếng Indonesia',
    'malay': 'Tiếng Mã Lai',
    'turkish': 'Tiếng Thổ Nhĩ Kỳ',
    'arabic': 'Tiếng Ả Rập',
    'hindi': 'Tiếng Hindi',
    'dutch': 'Tiếng Hà Lan',
    'polish': 'Tiếng Ba Lan',
    'swedish': 'Tiếng Thụy Điển',
    'norwegian': 'Tiếng Na Uy',
    'danish': 'Tiếng Đan Mạch',
    'finnish': 'Tiếng Phần Lan',
    'greek': 'Tiếng Hy Lạp',
    'czech': 'Tiếng Séc',
    'romanian': 'Tiếng Romania',
    'ukrainian': 'Tiếng Ukraina'
  };

  function getLocalizedLanguageName(langName, uiLang) {
    if (!langName) return '';
    const cleanName = langName.trim().toLowerCase();
    if (uiLang === 'vi') {
      return LANGUAGE_MAP[cleanName] || langName.charAt(0).toUpperCase() + langName.slice(1);
    }
    return langName.charAt(0).toUpperCase() + langName.slice(1);
  }

  // Get active container, support fullscreen mode (e.g. YouTube, Netflix, HTML5 Video players)
  function getActiveContainer() {
    const fs = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement;
    if (fs) {
      const container = (fs.tagName === 'VIDEO' && fs.parentElement) ? fs.parentElement : fs;
      try {
        const compPos = window.getComputedStyle(container).position;
        if (compPos === 'static') {
          container.style.position = 'relative';
        }
      } catch (e) {}
      return container;
    }
    return document.body || document.documentElement;
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Sync UI language setting if sent in message
    if (message.uiLang) {
      currentUiLang = message.uiLang;
    }

    const isTopFrame = (window === window.top);
    const hasLocalFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
    const shouldHandleInThisFrame = isTopFrame || hasLocalFs;

    if (message.action === 'pause-video') {
      pauseAllPlayingVideos();
      sendResponse({ status: 'video-paused' });
      return true;
    } else if (message.action === 'resume-video') {
      resumeAutoPausedVideo();
      sendResponse({ status: 'video-resumed' });
      return true;
    }

    if (message.action === 'trigger-selection' || message.action === 'trigger-translation') {
      if (isTopFrame && !hasLocalFs) {
        let iframeInFs = false;
        try {
          const iframes = document.querySelectorAll('iframe');
          for (const frame of iframes) {
            if (frame === document.fullscreenElement || frame === document.webkitFullscreenElement) {
              iframeInFs = true;
              break;
            }
          }
        } catch (e) {}
        if (iframeInFs) return;
      } else if (!isTopFrame && !hasLocalFs) {
        return;
      }

      if (isTranslating) {
        sendResponse({ error: 'already-translating' });
        return true;
      }
      startSelectionMode();
      sendResponse({ status: 'selection-started' });
    } else if (message.action === 'trigger-text-translation') {
      if (!shouldHandleInThisFrame) return;
      hideFloatingTranslateIcon();
      if (isTranslating) {
        sendResponse({ error: 'already-translating' });
        return true;
      }
      const success = triggerTextTranslation(true);
      if (success) {
        sendResponse({ status: 'text-selection-processing' });
      } else {
        sendResponse({ error: 'no-selection' });
      }
    } else if (message.action === 'show-loading') {
      if (!shouldHandleInThisFrame) return;
      showLoading(message.text || '...');
      sendResponse({ status: 'loading-shown' });
    } else if (message.action === 'hide-loading') {
      if (!shouldHandleInThisFrame) return;
      hideLoading();
      sendResponse({ status: 'loading-hidden' });
    } else if (message.action === 'render-translation') {
      if (!shouldHandleInThisFrame) return;
      hideLoading();
      renderTranslation(message.data, message.rect, message.isText, message.pageScrollX || 0, message.pageScrollY || 0);
      sendResponse({ status: 'translation-rendered' });
    } else if (message.action === 'show-error') {
      if (!shouldHandleInThisFrame) return;
      hideLoading();
      resumeAutoPausedVideo();
      const localizedError = getLocalErrorMsg(message.error, currentUiLang);
      showToastError(localizedError);
      sendResponse({ status: 'error-shown' });
    } else if (message.action === 'crop-screenshot') {
      if (!shouldHandleInThisFrame) return;
      cropImage(message.base64Data, message.rect, message.devicePixelRatio)
        .then(croppedBase64 => sendResponse({ croppedBase64 }))
        .catch(err => sendResponse({ error: err.message }));
      return true; // Keep channel open for async response
    }
    return true;
  });

  // Helper to compute exact visual bounding rect of text selection, ignoring empty parent element margins
  function getExactSelectionRect(selection) {
    if (!selection || selection.rangeCount === 0) return { left: 0, top: 0, width: 0, height: 0 };
    const range = selection.getRangeAt(0);
    const clientRects = Array.from(range.getClientRects()).filter(r => r.width > 0 && r.height > 0);
    
    if (clientRects.length > 0) {
      const minLeft = Math.min(...clientRects.map(r => r.left));
      const maxRight = Math.max(...clientRects.map(r => r.right));
      const minTop = Math.min(...clientRects.map(r => r.top));
      const maxBottom = Math.max(...clientRects.map(r => r.bottom));
      return {
        left: minLeft,
        top: minTop,
        width: Math.max(maxRight - minLeft, 10),
        height: Math.max(maxBottom - minTop, 10)
      };
    }
    
    const r = range.getBoundingClientRect();
    return { left: r.left, top: r.top, width: r.width, height: r.height };
  }

  // Helper function to trigger highlighted text translation
  function triggerTextTranslation(showErrorAlert = true) {
    if (isTranslating) return false;
    const dict = CONTENT_LOCALIZATION[currentUiLang] || CONTENT_LOCALIZATION.vi;
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (selectedText.length > 0) {
      if (selection.rangeCount > 0) {
        const rect = getExactSelectionRect(selection);
        
        const context = {
          pageTitle: document.title,
          pageUrl: window.location.href,
          domain: window.location.hostname
        };

        // Capture scroll position at selection time to avoid position drift if user scrolls before result arrives
        const capturedScrollX = window.scrollX;
        const capturedScrollY = window.scrollY;

        isTranslating = true; // Set immediately to prevent double-trigger from shortcut keys

        // Show loading spinner INSTANTLY
        showLoading(dict.loadingText || 'Đang dịch...');

        // Hide floating icon and clear selection immediately to avoid duplication or leftovers
        hideFloatingTranslateIcon();
        selection.removeAllRanges();

        // Trigger text-only selection translation with page context
        safeSendMessage({
          action: 'process-text-selection',
          text: selectedText,
          rect: {
            x: rect.left,
            y: rect.top,
            w: rect.width,
            h: rect.height
          },
          pageScrollX: capturedScrollX,
          pageScrollY: capturedScrollY,
          context: context
        });
        return true;
      }
    } else {
      // Only show the alert dialog if we are in the main/top frame to avoid alert spam from nested iframes (like YouTube player)
      if (showErrorAlert && window === window.top) {
        alert(dict.alertNoHighlight);
      }
      return false;
    }
    return false;
  }

  // Handle global key events (ESC to close, Alt+Shift+S and Alt+Shift+D as local fallbacks)
  window.addEventListener('keydown', (e) => {
    if (!isContextValid()) return;
    // 1. ESC to cancel selection, clear translations or cancel loading
    if (e.key === 'Escape') {
      if (loadingOverlay) {
        hideLoading();
        safeSendMessage({ action: 'cancel-translation' });
      } else if (selectionOverlay) {
        cancelSelectionMode();
      } else if (translationContainer) {
        clearTranslation();
      }
      return;
    }

    // Don't trigger shortcuts if user is typing in inputs or contenteditable fields
    const activeEl = document.activeElement;
    if (activeEl) {
      const tagName = activeEl.tagName ? activeEl.tagName.toLowerCase() : '';
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || activeEl.isContentEditable) {
        return;
      }
    }

    // 2. Alt + Shift + S: Screenshot Crop Selection Mode
    if (e.altKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      e.stopPropagation();
      if (isTranslating) return;
      startSelectionMode();
    }

    // 3. Alt + Shift + F: Translate Highlighted Text
    if (e.altKey && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
      e.preventDefault();
      e.stopPropagation();
      hideFloatingTranslateIcon(); // Hide icon if visible before translating
      if (isTranslating) return;
      triggerTextTranslation(true);
    }

    // 4. Alt + Shift + W: Open Quick Translation Popup (Fallback)
    if (e.altKey && e.shiftKey && (e.key === 'W' || e.key === 'w')) {
      e.preventDefault();
      e.stopPropagation();
      safeSendMessage({ action: 'open-popup' });
    }
  }, true);

  // 1. Selection Mode (Win+Shift+S style)
  function startSelectionMode() {
    if (isTranslating) return;
    // Clear any active translation or selection overlays first
    clearTranslation();
    cancelSelectionMode();
    isTranslating = true; // Block other translate actions during selection mode

    // Pause all playing videos across light DOM and shadow roots
    pauseAllPlayingVideos();

    const dict = CONTENT_LOCALIZATION[currentUiLang] || CONTENT_LOCALIZATION.vi;

    // 1. Create selection overlay FIRST
    selectionOverlay = document.createElement('div');
    selectionOverlay.className = 'gst-selection-overlay';
    
    const canvas = document.createElement('canvas');
    selectionOverlay.appendChild(canvas);
    appendToActiveContainer(selectionOverlay);

    // 2. Create instruction helper bar SECOND (on top of selectionOverlay, locked to top center)
    helperBar = document.createElement('div');
    helperBar.className = 'gst-helper-bar';
    helperBar.style.cssText = 'top: 16px !important; align-self: flex-start !important; position: fixed !important; left: 50% !important; transform: translateX(-50%) !important; z-index: 2147483648 !important;';
    helperBar.innerHTML = `<span>${dict.helperText}</span> <span style="opacity: 0.6; font-size: 11px;">${dict.cancelText}</span>`;
    appendToActiveContainer(helperBar);

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth || screen.width;
    const height = window.innerHeight || screen.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Draw initial translucent dark overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(0, 0, width, height);

    let isDrawing = false;
    let startX = 0, startY = 0, currentX = 0, currentY = 0;

    function drawSelection() {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw background overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Rectangle Box Cutout & Stroke
      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      const w = Math.abs(startX - currentX);
      const h = Math.abs(startY - currentY);

      if (w > 0 && h > 0) {
        ctx.clearRect(x, y, w, h);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(x, y, w, h);
      }
    }

    // Intercept ESC key so cancelling crop mode NEVER exits fullscreen mode
    const handleEscKeyCancel = (e) => {
      if (e.key === 'Escape' || e.keyCode === 27) {
        e.preventDefault();
        e.stopPropagation();
        if (e.stopImmediatePropagation) e.stopImmediatePropagation();
        cancelSelectionMode();
        resumeAutoPausedVideo();
        window.removeEventListener('keydown', handleEscKeyCancel, true);
      }
    };
    window.addEventListener('keydown', handleEscKeyCancel, true);

    // Right-click cancel handler
    const handleRightClickCancel = (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.removeEventListener('keydown', handleEscKeyCancel, true);
      cancelSelectionMode();
      resumeAutoPausedVideo();
    };

    // Block all pointer and click events from leaking down to underlying video elements
    const blockEventPropagation = (e) => {
      e.stopPropagation();
      if (e.type === 'click' || e.type === 'dblclick') {
        e.preventDefault();
      }
    };

    ['click', 'dblclick', 'pointerdown', 'pointerup', 'pointermove'].forEach(evt => {
      selectionOverlay.addEventListener(evt, blockEventPropagation, true);
    });

    selectionOverlay.addEventListener('contextmenu', handleRightClickCancel, true);

    selectionOverlay.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (e.button === 2) { // Right-click button
        handleRightClickCancel(e);
        return;
      }
      if (e.button !== 0) return; // Only left click for drawing

      // Remove helperBar completely when mouse starts drawing so helper bar is NEVER captured in screenshots
      if (helperBar) {
        helperBar.remove();
        helperBar = null;
      }

      isDrawing = true;
      startX = e.clientX;
      startY = e.clientY;
      currentX = startX;
      currentY = startY;
    }, true);

    selectionOverlay.addEventListener('mousemove', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!isDrawing) return;
      currentX = e.clientX;
      currentY = e.clientY;
      drawSelection();
    }, true);

    selectionOverlay.addEventListener('mouseup', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!isDrawing) return;
      isDrawing = false;

      const x = Math.min(startX, e.clientX);
      const y = Math.min(startY, e.clientY);
      const w = Math.abs(startX - e.clientX);
      const h = Math.abs(startY - e.clientY);

      // Remove selection elements
      cancelSelectionMode();

      // Only proceed if selection is large enough (e.g., width & height > 10px)
      if (w > 10 && h > 10) {
        isTranslating = true; // Keep block active for API request
        const dict = CONTENT_LOCALIZATION[currentUiLang] || CONTENT_LOCALIZATION.vi;
        
        // Show loading spinner INSTANTLY upon releasing mouse
        showLoading(dict.loadingText || 'Đang dịch...');

        const context = {
          pageTitle: document.title,
          pageUrl: window.location.href,
          domain: window.location.hostname
        };

        // Capture scroll position at selection time to avoid position drift if user scrolls before result arrives
        const capturedScrollX = window.scrollX;
        const capturedScrollY = window.scrollY;

        // Send crop area coordinates and page context to background script
        safeSendMessage({
          action: 'process-crop-selection',
          rect: { x, y, w, h },
          pageScrollX: capturedScrollX,
          pageScrollY: capturedScrollY,
          devicePixelRatio: dpr,
          context: context
        });
      } else {
        // Selection too small, no translation will take place — resume video immediately
        resumeAutoPausedVideo();
      }
    }, true);
  }

  function cancelSelectionMode() {
    if (selectionOverlay) {
      removeFromActiveContainer(selectionOverlay);
      selectionOverlay = null;
    }
    if (helperBar) {
      removeFromActiveContainer(helperBar);
      helperBar = null;
    }
    isTranslating = false; // Reset block when selection is cancelled
  }

  // Helper function to crop screenshot using client-side Image & Canvas with ultra-fast downscaling
  function cropImage(base64Data, rect, dpr) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Max dimension 650px for ultra-fast Gemini Vision processing (lightweight ~30KB payload)
          const maxDim = 650;
          let targetW = rect.w;
          let targetH = rect.h;
          
          if (targetW > maxDim || targetH > maxDim) {
            const scale = Math.min(maxDim / targetW, maxDim / targetH);
            targetW = Math.round(targetW * scale);
            targetH = Math.round(targetH * scale);
          }

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          
          // Draw the cropped portion from the full screen image
          ctx.drawImage(
            img,
            rect.x * dpr,
            rect.y * dpr,
            rect.w * dpr,
            rect.h * dpr,
            0,
            0,
            targetW,
            targetH
          );
          
          // Convert canvas to jpeg base64 with 65% compression quality for ultra-fast payload
          const croppedBase64 = canvas.toDataURL('image/jpeg', 0.65);
          resolve(croppedBase64);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Không thể tải ảnh chụp màn hình.'));
      img.src = base64Data;
    });
  }

  // 2. Loading indicator
  function showLoading(text) {
    if (loadingOverlay) removeFromActiveContainer(loadingOverlay);
    isTranslating = true;

    loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'gst-loading-overlay';
    
    const spinner = document.createElement('div');
    spinner.className = 'gst-spinner';
    
    const label = document.createElement('div');
    label.textContent = text;

    loadingOverlay.appendChild(spinner);
    loadingOverlay.appendChild(label);

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'gst-loading-cancel-btn';
    cancelBtn.textContent = currentUiLang === 'vi' ? 'Hủy' : 'Cancel';
    cancelBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideLoading();
      resumeAutoPausedVideo();
      safeSendMessage({ action: 'cancel-translation' });
    });
    loadingOverlay.appendChild(cancelBtn);

    appendToActiveContainer(loadingOverlay);
  }

  function hideLoading() {
    isTranslating = false;
    if (loadingOverlay) {
      removeFromActiveContainer(loadingOverlay);
      loadingOverlay = null;
    }
  }

  // 3. Render Translations
  let activeDocumentClickListener = null;

  // Helper to make a DOM element draggable on mousedown/mousemove
  function makeElementDraggable(el, handle = el) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    handle.addEventListener('mousedown', dragMouseDown);

    function dragMouseDown(e) {
      // Don't drag if user clicked input or is selecting text
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Prevent text selection drag override
      e.preventDefault();

      // Prevent transition / transform jumps by converting translate offset to absolute offsets
      const rect = el.getBoundingClientRect();
      let parentLeft = 0;
      let parentTop = 0;
      if (el.offsetParent) {
        const parentRect = el.offsetParent.getBoundingClientRect();
        parentLeft = parentRect.left;
        parentTop = parentRect.top;
      }
      el.style.left = (rect.left - parentLeft) + 'px';
      el.style.top = (rect.top - parentTop) + 'px';
      el.style.transform = 'none'; // clear transform

      // Get mouse cursor position at start
      pos3 = e.clientX;
      pos4 = e.clientY;

      document.addEventListener('mouseup', closeDragElement);
      document.addEventListener('mousemove', elementDrag);
    }

    function elementDrag(e) {
      e.preventDefault();
      // Calculate new mouse positions
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;

      // Adjust element coordinates
      el.style.top = (el.offsetTop - pos2) + "px";
      el.style.left = (el.offsetLeft - pos1) + "px";

      // Flag as dragged so we don't trigger click-to-close on mouseup
      el.dataset.dragged = "true";
    }

    function closeDragElement() {
      // Stop moving when mouse button is released
      document.removeEventListener('mouseup', closeDragElement);
      document.removeEventListener('mousemove', elementDrag);
    }
  }

  function renderTranslation(data, rect, isText = false, pageScrollX = 0, pageScrollY = 0) {
    clearTranslation();

    const isValidHexColor = (color) => {
      if (!color || typeof color !== 'string') return false;
      return /^#([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color.trim());
    };

    const dict = CONTENT_LOCALIZATION[currentUiLang] || CONTENT_LOCALIZATION.vi;

    translationContainer = document.createElement('div');
    translationContainer.className = 'gst-translation-container';
    appendToActiveContainer(translationContainer);

    if (!data.translations || data.translations.length === 0) {
      const errorBlock = document.createElement('div');
      errorBlock.className = 'gst-translation-block';
      if (isText) {
        errorBlock.classList.add('gst-text-block');
      }
      errorBlock.style.left = (pageScrollX + rect.x) + 'px';
      errorBlock.style.top = (pageScrollY + rect.y) + 'px';
      errorBlock.style.width = 'auto';
      errorBlock.style.minWidth = rect.w + 'px';
      errorBlock.style.maxWidth = '280px';
      errorBlock.style.minHeight = rect.h + 'px';
      errorBlock.style.height = 'auto';
      errorBlock.style.fontSize = '12px';
      errorBlock.style.color = '#ff6b6b';
      errorBlock.textContent = dict.noTextFound;

      translationContainer.appendChild(errorBlock);

      activeDocumentClickListener = (e) => {
        clearTranslation();
      };
      setTimeout(() => {
        if (translationContainer) {
          document.addEventListener('mousedown', activeDocumentClickListener);
        }
      }, 50);
      return;
    }

    if (!isText) {
      const renderedPrecise = renderPreciseBoxes(data, rect, pageScrollX, pageScrollY);
      if (renderedPrecise) {
        activeDocumentClickListener = (e) => {
          if (e.target.closest('.gst-translation-block')) return;
          clearTranslation();
        };
        setTimeout(() => {
          if (translationContainer) {
            document.addEventListener('mousedown', activeDocumentClickListener);
          }
        }, 50);
        return;
      }
    }

    renderFallbackSingleBlock(data, rect, isText, pageScrollX, pageScrollY);
  }

  function renderPreciseBoxes(data, rect, pageScrollX, pageScrollY) {
    if (!data || !data.translations || data.translations.length === 0) return false;

    const rawItems = data.translations.filter(t => t.translated_text && t.translated_text.trim().length > 0);
    if (rawItems.length === 0) return false;

    // Merge vertically adjacent & aligned text items into single consolidated boxes (skip merging for software_ui/game UI menus)
    const validItems = mergeAdjacentBoxes(rawItems, data.context_type);

    const scaleX = rect.w / 1000;
    const scaleY = rect.h / 1000;

    let renderedCount = 0;

    validItems.forEach((t) => {
      let ymin = 0, xmin = 0, ymax = 1000, xmax = 1000;
      if (Array.isArray(t.box_2d) && t.box_2d.length === 4) {
        [ymin, xmin, ymax, xmax] = t.box_2d;
      }

      const rawW = Math.max((xmax - xmin) * scaleX, 10);
      const rawH = Math.max((ymax - ymin) * scaleY, 10);
      const rawLeft = pageScrollX + rect.x + xmin * scaleX;
      const rawTop = pageScrollY + rect.y + ymin * scaleY;

      const SHRINK = 0.82;
      const boxW = Math.max(rawW * SHRINK, 6);
      const boxH = Math.max(rawH * SHRINK, 6);
      const boxLeft = rawLeft + (rawW - boxW) / 2;
      const boxTop = rawTop + (rawH - boxH) / 2;

      const patch = document.createElement('div');
      patch.className = 'gst-translation-block gst-inline-patch';

      patch.style.position = 'absolute';
      patch.style.left = boxLeft + 'px';
      patch.style.top = boxTop + 'px';
      patch.style.width = 'max-content';
      patch.style.height = 'auto';
      patch.style.minWidth = '30px';
      patch.style.maxWidth = Math.min(Math.max(boxW * 1.5, 300), window.innerWidth - 40) + 'px';
      patch.style.whiteSpace = 'pre-wrap';
      patch.style.wordBreak = 'normal';
      patch.style.overflowWrap = 'normal';
      patch.style.minHeight = '18px';
      patch.style.padding = '4px 8px';

      const isValidHexColor = (color) => {
        if (!color || typeof color !== 'string') return false;
        return /^#([0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color.trim());
      };

      if (t.background_color_hex && isValidHexColor(t.background_color_hex)) {
        patch.style.backgroundColor = t.background_color_hex;
      }
      if (t.text_color_hex && isValidHexColor(t.text_color_hex)) {
        patch.style.color = t.text_color_hex;
      }

      const textSpan = document.createElement('span');
      textSpan.textContent = t.translated_text.trim();
      patch.appendChild(textSpan);

      makeElementDraggable(patch, patch);

      patch.addEventListener('click', (e) => {
        if (patch.dataset.dragged === "true") {
          patch.dataset.dragged = "false";
          return;
        }
        patch.remove();
        if (translationContainer && translationContainer.querySelectorAll('.gst-translation-block').length === 0) {
          clearTranslation();
        }
      });

      translationContainer.appendChild(patch);
      renderedCount++;
    });

    return renderedCount > 0;
  }

  function mergeAdjacentBoxes(validItems, contextType) {
    if (!validItems || validItems.length <= 1) return validItems;

    // DO NOT merge items if the content is identified as software UI menu or game UI options list
    if (contextType === 'software_ui' || contextType === 'game') {
      return validItems;
    }

    // Detect if items are distinct UI options (e.g. short 1-3 word labels in a vertical menu)
    const isUIOptionList = validItems.length >= 3 && validItems.every(item => {
      const wordCount = (item.original_text || '').trim().split(/\s+/).length;
      return wordCount <= 3;
    });

    if (isUIOptionList) {
      return validItems;
    }

    const getBounds = (item) => {
      if (Array.isArray(item.box_2d) && item.box_2d.length === 4) {
        return item.box_2d;
      }
      return [0, 0, 1000, 1000];
    };

    const sorted = [...validItems].sort((a, b) => getBounds(a)[0] - getBounds(b)[0]);
    const merged = [];
    let currentGroup = [sorted[0]];

    for (let i = 1; i < sorted.length; i++) {
      const prev = currentGroup[currentGroup.length - 1];
      const curr = sorted[i];

      const [pYmin, pXmin, pYmax, pXmax] = getBounds(prev);
      const [cYmin, cXmin, cYmax, cXmax] = getBounds(curr);

      const vDistance = cYmin - pYmax;
      const isVerticallyClose = vDistance < 90;

      const hOverlap = Math.max(0, Math.min(pXmax, cXmax) - Math.max(pXmin, cXmin));
      const pWidth = pXmax - pXmin;
      const cWidth = cXmax - cXmin;
      const isHorizontallyAligned = (hOverlap > 0.35 * Math.min(pWidth, cWidth));

      if (isVerticallyClose && isHorizontallyAligned) {
        currentGroup.push(curr);
      } else {
        merged.push(createMergedGroupItem(currentGroup));
        currentGroup = [curr];
      }
    }

    if (currentGroup.length > 0) {
      merged.push(createMergedGroupItem(currentGroup));
    }

    return merged;
  }

  function createMergedGroupItem(group) {
    if (group.length === 1) return group[0];

    let minYmin = Infinity, minXmin = Infinity;
    let maxYmax = -Infinity, maxXmax = -Infinity;
    const texts = [];

    group.forEach(item => {
      const [ymin, xmin, ymax, xmax] = (Array.isArray(item.box_2d) && item.box_2d.length === 4)
        ? item.box_2d
        : [0, 0, 1000, 1000];
      if (ymin < minYmin) minYmin = ymin;
      if (xmin < minXmin) minXmin = xmin;
      if (ymax > maxYmax) maxYmax = ymax;
      if (xmax > maxXmax) maxXmax = xmax;

      if (item.translated_text && item.translated_text.trim()) {
        texts.push(item.translated_text.trim());
      }
    });

    return {
      box_2d: [minYmin, minXmin, maxYmax, maxXmax],
      original_text: group.map(g => g.original_text).filter(Boolean).join(' '),
      translated_text: texts.join('\n'),
      background_color_hex: group[0].background_color_hex,
      text_color_hex: group[0].text_color_hex
    };
  }

  function renderFallbackSingleBlock(data, rect, isText, pageScrollX, pageScrollY) {
    let consolidatedText = data.translations
      .map(t => (t.translated_text || '').trim())
      .filter(Boolean)
      .join('\n\n');

    if (!consolidatedText.trim()) return;

    if (!isText && consolidatedText.includes('\n')) {
      const rawLines = consolidatedText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (rawLines.length > 1) {
        const avgLen = rawLines.reduce((sum, l) => sum + l.length, 0) / rawLines.length;
        if (avgLen < 25) {
          consolidatedText = rawLines.join(' ');
        }
      }
    }

    const block = document.createElement('div');
    block.className = 'gst-translation-block';
    if (isText) {
      block.classList.add('gst-text-block');
    }

    let maxBoxWidth = 480;

    if (isText) {
      const selWidth = rect.w > 0 ? rect.w : 420;
      maxBoxWidth = Math.min(Math.max(selWidth, 340), window.innerWidth - 40);
      block.style.display = 'block';
      block.style.width = 'max-content';
      block.style.minWidth = '220px';
      block.style.maxWidth = Math.min(window.innerWidth - 40, 650) + 'px';
      block.style.height = 'auto';
      block.style.minHeight = '28px';
    } else {
      // Fit container tightly around text content without collapsing into vertical single-character strip
      maxBoxWidth = Math.min(Math.max(rect.w, 300), window.innerWidth - 40);
      block.style.display = 'inline-block';
      block.style.width = 'max-content';
      block.style.height = 'auto';
      block.style.minWidth = '40px';
      block.style.maxWidth = maxBoxWidth + 'px';
      block.style.minHeight = '24px';
      block.style.padding = '6px 12px';
    }

    block.style.whiteSpace = 'pre-wrap';
    block.style.wordBreak = 'normal';
    block.style.overflowWrap = 'normal';
    block.style.fontSize = '12.5px';
    block.style.lineHeight = '1.45';

    const boxLeft = pageScrollX + rect.x;
    const boxTop = pageScrollY + rect.y;
    const maxLeft = pageScrollX + window.innerWidth - maxBoxWidth - 15;
    const safeLeft = Math.max(pageScrollX + 10, Math.min(boxLeft, maxLeft));

    block.style.left = safeLeft + 'px';
    block.style.top = boxTop + 'px';
    if (isText) {
      block.style.height = 'auto';
    }

    const textWrapper = document.createElement('span');
    textWrapper.textContent = consolidatedText;

    block.appendChild(textWrapper);

    makeElementDraggable(block, block);

    block.addEventListener('click', (e) => {
      if (block.dataset.dragged === "true") {
        block.dataset.dragged = "false";
        return;
      }
      block.remove();
      clearTranslation();
    });

    translationContainer.appendChild(block);

    activeDocumentClickListener = (e) => {
      if (e.target.closest('.gst-translation-block')) return;
    };

    setTimeout(() => {
      if (translationContainer) {
        document.addEventListener('mousedown', activeDocumentClickListener);
      }
    }, 50);
  }

  function getLocalErrorMsg(rawError, uiLang) {
    const dict = CONTENT_LOCALIZATION[uiLang] || CONTENT_LOCALIZATION.vi;
    if (!rawError) return dict.errorGeneric;

    const errLower = rawError.toLowerCase();

    if (errLower.includes('api key not valid') || (errLower.includes('api key') && errLower.includes('valid'))) {
      return dict.errorInvalidKey;
    }
    if (errLower.includes('quota') || errLower.includes('exhausted') || errLower.includes('limit')) {
      return dict.errorQuota;
    }
    if (errLower.includes('failed to fetch') || errLower.includes('network') || errLower.includes('connection')) {
      return dict.errorNetwork;
    }

    return `${dict.errorGeneric} ${rawError}`;
  }

  function showToastError(errorMsg) {
    const dict = CONTENT_LOCALIZATION[currentUiLang] || CONTENT_LOCALIZATION.vi;

    // Remove existing error toast if any
    const existing = document.querySelector('.gst-error-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'gst-error-toast';

    // Header
    const header = document.createElement('div');
    header.className = 'gst-toast-header';

    const titleWrap = document.createElement('div');
    titleWrap.className = 'gst-toast-title-wrap';
    titleWrap.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ff5252" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <span>${escapeHtml(dict.errorTitle || 'Lỗi Dịch Thuật')}</span>
    `;
    header.appendChild(titleWrap);

    const closeBtn = document.createElement('span');
    closeBtn.className = 'gst-toast-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => toast.remove());
    header.appendChild(closeBtn);

    toast.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'gst-toast-body';
    
    const isMissingKey = errorMsg.toLowerCase().includes('configure api keys') || 
                         errorMsg.toLowerCase().includes('cấu hình api key') ||
                         errorMsg.toLowerCase().includes('vui lòng cấu hình api key');
                         
    const msgPara = document.createElement('p');
    msgPara.className = 'gst-toast-message';

    if (isMissingKey) {
      msgPara.textContent = currentUiLang === 'vi' 
        ? 'Chưa cấu hình API Key. Vui lòng thêm khóa API trong trang Cài đặt để tiếp tục dịch.' 
        : 'API Key not configured. Please add an API Key in Settings to continue.';
      body.appendChild(msgPara);
      
      const link = document.createElement('a');
      link.href = '#';
      link.className = 'gst-toast-action-btn';
      link.innerHTML = `<span>${currentUiLang === 'vi' ? 'Đi đến Cài đặt' : 'Go to Settings'}</span> <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`;
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        safeSendMessage({ action: 'open-options-page' });
      });
      body.appendChild(link);
    } else {
      msgPara.textContent = errorMsg;
      body.appendChild(msgPara);
    }
    toast.appendChild(body);

    getActiveContainer().appendChild(toast);

    // Auto-remove after 3.5 seconds
    if (window.gstErrorToastTimeout) clearTimeout(window.gstErrorToastTimeout);
    window.gstErrorToastTimeout = setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }
    }, 3500);
  }

  function hideLoading() {
    isTranslating = false;
    if (loadingOverlay) {
      loadingOverlay.remove();
      loadingOverlay = null;
    }
  }

  function clearTranslation() {
    isTranslating = false;
    resumeAutoPausedVideo();
    if (translationContainer) {
      removeFromActiveContainer(translationContainer);
      translationContainer = null;
    }
    if (activeDocumentClickListener) {
      document.removeEventListener('mousedown', activeDocumentClickListener);
      activeDocumentClickListener = null;
    }
  }

  let floatingIcon = null;

  function showFloatingTranslateIcon(rect, text) {
    if (floatingIcon) floatingIcon.remove();

    floatingIcon = document.createElement('div');
    floatingIcon.className = 'gst-floating-icon';

    const iconWidth = 32;
    const iconHeight = 32;

    // Viewport-relative positioning (fixed), centered above text selection
    let left = rect.left + (rect.width / 2) - (iconWidth / 2);
    let top = rect.top - iconHeight - 6;

    if (top < 10) top = rect.bottom + 6;
    if (left + iconWidth > window.innerWidth - 10) left = window.innerWidth - iconWidth - 10;
    if (left < 10) left = 10;

    floatingIcon.style.position = 'fixed';
    floatingIcon.style.left = left + 'px';
    floatingIcon.style.top = top + 'px';

    // Premium translate SVG icon
    floatingIcon.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 8l6 6M4 14l6-6M2 5h12M7 2h4M22 22l-5-10-5 10M14 18h6"/>
      </svg>
    `;
    floatingIcon.title = currentUiLang === 'vi' ? 'Dịch đoạn văn đã chọn' : 'Translate selected text';

    // Prevent clearing browser selection on mousedown
    floatingIcon.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });

    // Prevent mouseup from bubbling up to document and re-triggering show icon
    floatingIcon.addEventListener('mouseup', (e) => {
      e.stopPropagation();
    });

    floatingIcon.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isTranslating) return;

      const dict = CONTENT_LOCALIZATION[currentUiLang] || CONTENT_LOCALIZATION.vi;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !text) {
        hideFloatingTranslateIcon();
        return;
      }

      const curRect = getExactSelectionRect(selection);
      
      const context = {
        pageTitle: document.title,
        pageUrl: window.location.href,
        domain: window.location.hostname
      };

      const capturedScrollX = window.scrollX;
      const capturedScrollY = window.scrollY;

      isTranslating = true;

      // Show loading overlay INSTANTLY
      showLoading(dict.loadingText || 'Đang dịch...');

      // Hide floating icon and clear selection immediately to avoid duplication or leftovers
      hideFloatingTranslateIcon();
      selection.removeAllRanges();

      // Send with captured scroll offsets so render lands at correct position
      safeSendMessage({
        action: 'process-text-selection',
        text: text,
        rect: {
          x: curRect.left,
          y: curRect.top,
          w: curRect.width,
          h: curRect.height
        },
        pageScrollX: capturedScrollX,
        pageScrollY: capturedScrollY,
        context: context
      });
    });

    getActiveContainer().appendChild(floatingIcon);
  }

  function hideFloatingTranslateIcon() {
    if (floatingIcon) {
      floatingIcon.remove();
      floatingIcon = null;
    }
  }

  let selectionTimeout = null;

  function handleSelectionCheck(e) {
    if (!isContextValid()) return;
    
    // Ignore mouseup if we are in crop selection mode
    if (selectionOverlay) return;

    // Don't trigger if clicked on editable fields
    if (e && e.target) {
      const tagName = e.target.tagName ? e.target.tagName.toLowerCase() : '';
      if (tagName === 'input' || tagName === 'textarea' || e.target.isContentEditable) {
        hideFloatingTranslateIcon();
        return;
      }
    }

    clearTimeout(selectionTimeout);
    selectionTimeout = setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        hideFloatingTranslateIcon();
        return;
      }

      const selectedText = selection.toString().trim();
      if (selectedText.length > 0) {
        const rect = getExactSelectionRect(selection);
        if (rect.width > 0 || rect.height > 0) {
          showFloatingTranslateIcon(rect, selectedText);
        }
      } else {
        hideFloatingTranslateIcon();
      }
    }, 40);
  }

  // Detect text selection on mouse release or arrow key selection
  document.addEventListener('mouseup', handleSelectionCheck);
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Shift' || e.key.startsWith('Arrow')) {
      handleSelectionCheck(e);
    }
  });

  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
      hideFloatingTranslateIcon();
    }
  });

  // Clean up floating icon on click down elsewhere
  document.addEventListener('mousedown', (e) => {
    if (floatingIcon && !floatingIcon.contains(e.target)) {
      hideFloatingTranslateIcon();
    }
  });

  // Handle entering/exiting fullscreen mode cleanly to prevent state locking
  const handleFullscreenStateChange = () => {
    isTranslating = false;
    cancelSelectionMode();
    clearTranslation();
  };

  document.addEventListener('fullscreenchange', handleFullscreenStateChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenStateChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenStateChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenStateChange);
})();
