(() => {
  // Prevent duplicate script execution
  if (window.gstInitialized) return;
  window.gstInitialized = true;

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

  // Helper function to crop screenshot using client-side Image & Canvas
  function cropImage(base64Data, rect, dpr) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = rect.w;
          canvas.height = rect.h;
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
            rect.w,
            rect.h
          );
          
          // Convert canvas to jpeg base64 with 80% compression quality
          const croppedBase64 = canvas.toDataURL('image/jpeg', 0.8);
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
  function makeElementDraggable(el) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    
    el.addEventListener('mousedown', dragMouseDown);

    function dragMouseDown(e) {
      // Don't drag if user clicked input or is selecting text
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      // Prevent text selection drag override
      e.preventDefault();

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

    // Render each block exactly at its original position
    data.translations.forEach(item => {
      const box = item.box_2d; // [ymin, xmin, ymax, xmax] relative to 0-1000
      if (!box || box.length !== 4) return;

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
      
      // Auto width and dynamic max width to prevent text clipping
      block.style.width = 'auto';

      // Detect if the original block is vertical text (height is significantly larger than width)
      const isVerticalText = origHeight > origWidth * 1.5;

      if (isVerticalText) {
        // For vertical text, since translated text is horizontal (Vietnamese/English),
        // we expand the box width and let the height adjust automatically to fit the content nicely.
        block.style.minWidth = Math.max(150, origWidth * 2.5) + 'px';
        block.style.maxWidth = '320px';
        block.style.minHeight = 'auto'; // Don't force massive height of vertical column
        block.style.height = 'auto';
      } else {
        block.style.minWidth = boxWidth + 'px';
        block.style.maxWidth = Math.max(boxWidth * 1.5, 280) + 'px';
        block.style.minHeight = boxHeight + 'px';
        block.style.height = 'auto';
      }

      // Calculate font size dynamically relative to text height (or width if vertical text)
      // Cap at 13px/14px to keep text compact and aligned precisely
      let fontSize;
      if (isVerticalText) {
        fontSize = Math.max(11, Math.min(origWidth * 0.85, 14));
      } else if (isText) {
        fontSize = Math.max(10, Math.min(origHeight * 0.75, 13));
      } else {
        fontSize = Math.max(10, Math.min(origHeight * 0.68, 13));
      }
      block.style.fontSize = fontSize + 'px';

      const textWrapper = document.createElement('span');
      textWrapper.textContent = item.translated_text;

      if (isText) {
        block.appendChild(textWrapper);
      } else {
        const innerContainer = document.createElement('div');
        innerContainer.className = 'gst-translation-block-inner';
        innerContainer.appendChild(textWrapper);
        block.appendChild(innerContainer);
      }

      // Make it draggable
      makeElementDraggable(block);

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

    const title = document.createElement('span');
    title.textContent = dict.errorTitle;
    header.appendChild(title);

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
                         
    if (isMissingKey) {
      body.textContent = errorMsg + ' ';
      
      const link = document.createElement('a');
      link.href = '#';
      link.className = 'gst-toast-link';
      link.textContent = currentUiLang === 'vi' ? 'Đi đến Cài đặt' : 'Go to Settings';
      link.style.color = '#a8b8ff';
      link.style.textDecoration = 'underline';
      link.style.fontWeight = 'bold';
      link.style.marginLeft = '8px';
      link.style.cursor = 'pointer';
      
      link.addEventListener('click', (e) => {
        e.preventDefault();
        safeSendMessage({ action: 'open-options-page' });
      });
      body.appendChild(link);
    } else {
      body.textContent = errorMsg;
    }
    toast.appendChild(body);

    getActiveContainer().appendChild(toast);

    // Auto-remove after 8 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
      }
    }, 8000);
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

  function showFloatingTranslateIcon(x, y, text) {
    if (floatingIcon) floatingIcon.remove();

    floatingIcon = document.createElement('div');
    floatingIcon.className = 'gst-floating-icon';

    // Capture scroll position NOW (at the moment icon is shown)
    const capturedScrollX = window.scrollX;
    const capturedScrollY = window.scrollY;

    // Position it near the mouse selection release coords (document-absolute)
    const left = x + 10;
    const top = y + 10;
    floatingIcon.style.left = (capturedScrollX + left) + 'px';
    floatingIcon.style.top = (capturedScrollY + top) + 'px';

    // Premium translate SVG icon
    floatingIcon.innerHTML = `
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 8l6 6M4 14l6-6M2 5h12M7 2h4M22 22l-5-10-5 10M14 18h6"/>
      </svg>
    `;

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
      
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !text) {
        hideFloatingTranslateIcon();
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      const context = {
        pageTitle: document.title,
        pageUrl: window.location.href,
        domain: window.location.hostname
      };

      isTranslating = true; // Block key combinations and other triggers immediately

      // Hide floating icon and clear selection immediately to avoid duplication or leftovers
      hideFloatingTranslateIcon();
      selection.removeAllRanges();

      // Send with captured scroll offsets so render lands at correct position
      safeSendMessage({
        action: 'process-text-selection',
        text: text,
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
    });

    document.body.appendChild(floatingIcon);
  }

  function hideFloatingTranslateIcon() {
    if (floatingIcon) {
      floatingIcon.remove();
      floatingIcon = null;
    }
  }

  // Detect mouseup for text selection (ignoring inputs)
  document.addEventListener('mouseup', (e) => {
    if (!isContextValid()) return;
    
    // Ignore mouseup if we are in crop selection mode
    if (selectionOverlay) return;

    // Don't trigger if clicked on editable fields
    if (e.target) {
      const tagName = e.target.tagName.toLowerCase();
      if (tagName === 'input' || tagName === 'textarea' || e.target.isContentEditable) {
        hideFloatingTranslateIcon();
        return;
      }
    }

    // Wrap in small timeout so browser finished updating selection
    setTimeout(() => {
      const selection = window.getSelection();
      const selectedText = selection.toString().trim();
      
      if (selectedText.length > 0) {
        showFloatingTranslateIcon(e.clientX, e.clientY, selectedText);
      } else {
        // If clicked elsewhere, selection will clear and we hide
        hideFloatingTranslateIcon();
      }
    }, 10);
  });

  // Clean up floating icon on click down elsewhere
  document.addEventListener('mousedown', (e) => {
    if (floatingIcon && !floatingIcon.contains(e.target)) {
      hideFloatingTranslateIcon();
    }
  });
})();
