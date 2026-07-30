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

  const CONTENT_LOCALIZATION = {
    vi: {
      helperText: 'Kéo chuột để chọn vùng màn hình cần dịch',
      cancelText: '(ESC để hủy)',
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
      cancelText: '(ESC to cancel)',
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

  // Get active container, support fullscreen mode
  // If the fullscreen element is a replaced element like VIDEO, use its parent element instead.
  function getActiveContainer() {
    const fs = document.fullscreenElement || document.webkitFullscreenElement || document.body;
    if (fs && fs.tagName === 'VIDEO') {
      return fs.parentElement || document.body;
    }
    return fs || document.body;
  }

  // Listen for messages from background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Sync UI language setting if sent in message
    if (message.uiLang) {
      currentUiLang = message.uiLang;
    }

    const dict = CONTENT_LOCALIZATION[currentUiLang] || CONTENT_LOCALIZATION.vi;
    const isTopFrame = (window === window.top);

    if (message.action === 'trigger-selection' || message.action === 'trigger-translation') {
      if (!isTopFrame) return;
      if (isTranslating) {
        sendResponse({ error: 'already-translating' });
        return true;
      }
      startSelectionMode();
      sendResponse({ status: 'selection-started' });
    } else if (message.action === 'trigger-text-translation') {
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
      if (!isTopFrame) return;
      showLoading(message.text || '...');
      sendResponse({ status: 'loading-shown' });
    } else if (message.action === 'hide-loading') {
      if (!isTopFrame) return;
      hideLoading();
      sendResponse({ status: 'loading-hidden' });
    } else if (message.action === 'render-translation') {
      if (!isTopFrame) return;
      hideLoading();
      renderTranslation(message.data, message.rect, message.isText, message.pageScrollX || 0, message.pageScrollY || 0);
      sendResponse({ status: 'translation-rendered' });
    } else if (message.action === 'show-error') {
      if (!isTopFrame) return;
      hideLoading();
      const localizedError = getLocalErrorMsg(message.error, currentUiLang);
      showToastError(localizedError);
      sendResponse({ status: 'error-shown' });
    } else if (message.action === 'crop-screenshot') {
      if (!isTopFrame) return;
      cropImage(message.base64Data, message.rect, message.devicePixelRatio)
        .then(croppedBase64 => sendResponse({ croppedBase64 }))
        .catch(err => sendResponse({ error: err.message }));
      return true; // Keep channel open for async response
    }
    return true;
  });

  // Helper function to trigger highlighted text translation
  function triggerTextTranslation(showErrorAlert = true) {
    if (isTranslating) return false;
    const dict = CONTENT_LOCALIZATION[currentUiLang] || CONTENT_LOCALIZATION.vi;
    const selection = window.getSelection();
    const selectedText = selection.toString().trim();
    if (selectedText.length > 0) {
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
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
  document.addEventListener('keydown', (e) => {
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
      const tagName = activeEl.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || activeEl.isContentEditable) {
        return;
      }
    }

    // 2. Alt + Shift + S: Screenshot Crop Selection Mode
    if (e.altKey && e.shiftKey && (e.key === 'S' || e.key === 's')) {
      e.preventDefault();
      if (isTranslating) return;
      startSelectionMode();
    }

    // 3. Alt + Shift + F: Translate Highlighted Text
    if (e.altKey && e.shiftKey && (e.key === 'F' || e.key === 'f')) {
      e.preventDefault();
      hideFloatingTranslateIcon(); // Hide icon if visible before translating
      if (isTranslating) return;
      triggerTextTranslation(true);
    }

    // 4. Alt + Shift + W: Open Quick Translation Popup (Fallback)
    if (e.altKey && e.shiftKey && (e.key === 'W' || e.key === 'w')) {
      e.preventDefault();
      safeSendMessage({ action: 'open-popup' });
    }
  });

  // 1. Selection Mode (Win+Shift+S style)
  function startSelectionMode() {
    if (isTranslating) return;
    // Clear any active translation or selection overlays first
    clearTranslation();
    cancelSelectionMode();
    isTranslating = true; // Block other translate actions during selection mode

    const dict = CONTENT_LOCALIZATION[currentUiLang] || CONTENT_LOCALIZATION.vi;

    // Create instruction helper bar
    helperBar = document.createElement('div');
    helperBar.className = 'gst-helper-bar';
    helperBar.innerHTML = `<span>${dict.helperText}</span> <span style="opacity: 0.6; font-size: 11px;">${dict.cancelText}</span>`;
    getActiveContainer().appendChild(helperBar);

    // Create selection overlay
    selectionOverlay = document.createElement('div');
    selectionOverlay.className = 'gst-selection-overlay';
    
    const canvas = document.createElement('canvas');
    selectionOverlay.appendChild(canvas);
    getActiveContainer().appendChild(selectionOverlay);

    const dpr = window.devicePixelRatio || 1;
    let width = window.innerWidth;
    let height = window.innerHeight;

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
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    function drawSelection() {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw background overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Determine bounding rect coordinates
      const x = Math.min(startX, currentX);
      const y = Math.min(startY, currentY);
      const w = Math.abs(startX - currentX);
      const h = Math.abs(startY - currentY);

      if (w > 0 && h > 0) {
        // Clear selection area
        ctx.clearRect(x, y, w, h);
        
        // Draw selection border (dashed white line)
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.strokeRect(x, y, w, h);
      }
    }

    selectionOverlay.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return; // Only left click
      isDrawing = true;
      startX = e.clientX;
      startY = e.clientY;
      currentX = startX;
      currentY = startY;
    });

    selectionOverlay.addEventListener('mousemove', (e) => {
      if (!isDrawing) return;
      currentX = e.clientX;
      currentY = e.clientY;
      drawSelection();
    });

    selectionOverlay.addEventListener('mouseup', (e) => {
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
      }
    });
  }

  function cancelSelectionMode() {
    if (selectionOverlay) {
      selectionOverlay.remove();
      selectionOverlay = null;
    }
    if (helperBar) {
      helperBar.remove();
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
    if (loadingOverlay) loadingOverlay.remove();
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
      safeSendMessage({ action: 'cancel-translation' });
    });
    loadingOverlay.appendChild(cancelBtn);

    getActiveContainer().appendChild(loadingOverlay);
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
    // Always append to body so absolute positioning with scroll offsets is accurate
    document.body.appendChild(translationContainer);

    // Language badge removed by user request

    // Check if there are translations returned
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

    // Render each block exactly at its position or full selection card
    data.translations.forEach(item => {
      const box = (item.box_2d && Array.isArray(item.box_2d) && item.box_2d.length === 4) 
        ? item.box_2d 
        : [0, 0, 1000, 1000];

      const ymin = box[0];
      const xmin = box[1];
      const ymax = box[2];
      const xmax = box[3];

      // Convert from 0-1000 range to actual screen pixels relative to selection area
      const origLeft = (xmin / 1000) * rect.w;
      const origTop = (ymin / 1000) * rect.h;
      const origWidth = ((xmax - xmin) / 1000) * rect.w;
      const origHeight = ((ymax - ymin) / 1000) * rect.h;

      // Use captured scroll offsets (at time of selection) - NOT live window.scrollX/Y
      const boxLeft = pageScrollX + rect.x + origLeft;
      const boxTop = pageScrollY + rect.y + origTop;
      const boxWidth = Math.max(40, origWidth);
      const boxHeight = origHeight;

      const block = document.createElement('div');
      block.className = 'gst-translation-block';
      if (isText) {
        block.classList.add('gst-text-block');
      }
      block.style.left = boxLeft + 'px';
      block.style.top = boxTop + 'px';
      
      // Format translated text to join short vertical line breaks into natural sentences
      let textVal = (item.translated_text || '').trim();
      if (!isText && textVal.includes('\n')) {
        const rawLines = textVal.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (rawLines.length > 1) {
          const avgLen = rawLines.reduce((sum, l) => sum + l.length, 0) / rawLines.length;
          // If lines are short (average < 25 chars per line), merge into continuous sentence
          if (avgLen < 25) {
            textVal = rawLines.join(' ');
          }
        }
      }

      // Auto width and compact fit around text content
      block.style.width = 'fit-content';
      block.style.minWidth = isText ? 'auto' : '200px';
      block.style.maxWidth = Math.min(window.innerWidth - 60, Math.max(rect.w + 120, 360)) + 'px';
      block.style.height = 'auto';
      block.style.minHeight = 'auto';

      // Keep single-line translations on 1 continuous line without forced wrapping
      if (isText || !textVal.includes('\n')) {
        block.style.whiteSpace = 'nowrap';
      } else {
        block.style.whiteSpace = 'pre-wrap';
      }

      // Calculate font size dynamically relative to text height
      let fontSize = 13;
      if (isText) {
        fontSize = 13;
      } else if (origHeight > 0) {
        fontSize = Math.max(12, Math.min(origHeight * 0.7, 14));
      }
      block.style.fontSize = fontSize + 'px';

      const textWrapper = document.createElement('span');
      textWrapper.textContent = textVal;

      let dragHandle = block;
      if (isText) {
        block.appendChild(textWrapper);
      } else {
        const innerContainer = document.createElement('div');
        innerContainer.className = 'gst-translation-block-inner';
        
        if (isValidHexColor(item.background_color_hex)) {
          innerContainer.style.setProperty('--gst-bg-color', item.background_color_hex);
          innerContainer.style.setProperty('--gst-border', 'none');
        }
        if (isValidHexColor(item.text_color_hex)) {
          innerContainer.style.setProperty('--gst-text-color', item.text_color_hex);
        }

        innerContainer.appendChild(textWrapper);
        block.appendChild(innerContainer);
        dragHandle = innerContainer;
      }

      // Make it draggable
      makeElementDraggable(block, dragHandle);

      // Click to close ONLY this block
      block.addEventListener('click', (e) => {
        // If block was dragged, do not close it
        if (block.dataset.dragged === "true") {
          block.dataset.dragged = "false";
          return;
        }

        block.remove();

        // If no more translation blocks left, remove container
        if (translationContainer.querySelectorAll('.gst-translation-block').length === 0) {
          clearTranslation();
        }
      });

      translationContainer.appendChild(block);
    });

    // Close all translations when clicking anywhere OUTSIDE the translation blocks
    activeDocumentClickListener = (e) => {
      // Don't close if user clicked inside any translation block
      if (e.target.closest('.gst-translation-block')) return;

      const selection = window.getSelection().toString();
      if (selection.trim().length > 0) return;
      
      clearTranslation();
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
    if (translationContainer) {
      translationContainer.remove();
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

      const curRange = selection.getRangeAt(0);
      const curRect = curRange.getBoundingClientRect();
      
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
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
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
})();
