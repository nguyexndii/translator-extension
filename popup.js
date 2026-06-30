const LANGUAGE_MAP = {
  'vietnamese': { vi: 'Tiếng Việt', en: 'Vietnamese' },
  'english': { vi: 'Tiếng Anh', en: 'English' },
  'japanese': { vi: 'Tiếng Nhật', en: 'Japanese' },
  'chinese': { vi: 'Tiếng Trung', en: 'Chinese' },
  'korean': { vi: 'Tiếng Hàn', en: 'Korean' },
  'french': { vi: 'Tiếng Pháp', en: 'French' },
  'german': { vi: 'Tiếng Đức', en: 'German' },
  'spanish': { vi: 'Tiếng Tây Ban Nha', en: 'Spanish' },
  'italic': { vi: 'Tiếng Ý', en: 'Italian' },
  'italian': { vi: 'Tiếng Ý', en: 'Italian' },
  'russian': { vi: 'Tiếng Nga', en: 'Russian' },
  'portuguese': { vi: 'Tiếng Bồ Đào Nha', en: 'Portuguese' },
  'thai': { vi: 'Tiếng Thái', en: 'Thai' },
  'indonesian': { vi: 'Tiếng Indonesia', en: 'Indonesian' },
  'malay': { vi: 'Tiếng Ma Lai', en: 'Malay' },
  'turkish': { vi: 'Tiếng Thổ Nhĩ Kỳ', en: 'Turkish' },
  'arabic': { vi: 'Tiếng Ả Rập', en: 'Arabic' },
  'hindi': { vi: 'Tiếng Hindi', en: 'Hindi' },
  'dutch': { vi: 'Tiếng Hà Lan', en: 'Dutch' },
  'polish': { vi: 'Tiếng Ba Lan', en: 'Polish' },
  'swedish': { vi: 'Tiếng Thụy Điển', en: 'Swedish' },
  'norwegian': { vi: 'Tiếng Na Uy', en: 'Norwegian' },
  'danish': { vi: 'Tiếng Đan Mạch', en: 'Danish' },
  'finnish': { vi: 'Tiếng Phần Lan', en: 'Finnish' },
  'greek': { vi: 'Tiếng Hy Lạp', en: 'Greek' },
  'czech': { vi: 'Tiếng Séc', en: 'Czech' },
  'romanian': { vi: 'Tiếng Romania', en: 'Romanian' },
  'ukrainian': { vi: 'Tiếng Ukraina', en: 'Ukrainian' }
};

const LANGUAGES_DATA = [
  'Vietnamese', 'English', 'Japanese', 'Chinese', 'Korean', 'French', 'German',
  'Spanish', 'Italian', 'Russian', 'Portuguese', 'Thai', 'Indonesian', 'Malay',
  'Turkish', 'Arabic', 'Hindi', 'Dutch', 'Polish', 'Swedish', 'Norwegian',
  'Danish', 'Finnish', 'Greek', 'Czech', 'Romanian', 'Ukrainian'
];

function getLocalizedLanguagesList(uiLang) {
  const list = LANGUAGES_DATA.map(lang => {
    const key = lang.toLowerCase();
    const mapping = LANGUAGE_MAP[key];
    const label = mapping ? mapping[uiLang] : lang;
    return { value: lang, label: label };
  });
  list.sort((a, b) => a.label.localeCompare(b.label, uiLang));
  return list;
}

const LOCALIZATION = {
  vi: {
    appName: 'Screen Translator',
    btnOptions: 'Cài đặt',
    tabTranslate: 'Dịch thuật',
    tabQr: 'Mã QR',
    btnTranslate: 'Chọn vùng màn hình để dịch',
    btnTextSelectTranslate: 'Dịch văn bản bôi đen',
    divider: 'hoặc dịch văn bản nhanh',
    lblTranslateTo: 'Dịch sang:',
    placeholderSearch: 'Tìm kiếm...',
    placeholderText: 'Nhập hoặc dán văn bản cần dịch tại đây...',
    btnTextTranslate: 'Dịch văn bản',
    btnImageTranslate: 'Dịch hình ảnh',
    textLoadingImage: 'Đang dịch hình ảnh...',
    lblTranslation: 'Bản dịch:',
    
    lblQrScanManual: 'Quét thủ công',
    lblQrScanAuto: 'Tự động quét',
    lblQrUploadPrompt: 'Kéo thả ảnh QR hoặc click để tải lên<br>Hoặc dán ảnh trực tiếp (Ctrl+V)',
    lblQrSuccessTitle: 'Quét thành công!',
    statusNoQrFound: 'Không tìm thấy mã QR trong ảnh.',
    statusQrSuccess: 'Đã copy nội dung QR vào clipboard.',
    statusQrLoadError: 'Không thể phân tích QR từ ảnh này.',
    statusNoTextInImage: 'Không tìm thấy văn bản nào trong hình ảnh này.',
    
    lblDividerQrGen: 'hoặc tạo mã QR',
    placeholderQrGen: 'Nhập văn bản hoặc liên kết để tạo mã QR tại đây...',
    btnQrGenerate: 'Tạo mã QR',
    lblQrGenResultTitle: 'Mã QR của bạn:',
    btnDownloadQr: 'Tải ảnh QR',
    
    statusNoKey: 'Hãy cài đặt API Key trước!',
    statusReload: 'Lỗi: Hãy tải lại trang web rồi thử lại!',
    statusHighlightErr: 'Lỗi: Hãy bôi đen chữ trên trang web rồi thử lại!',
    textLoading: 'Đang dịch...',
    lblHistoryTitle: 'Lịch sử dịch thuật',
    btnClearHistory: 'Xóa lịch sử',
    lblHistoryEmpty: 'Chưa có lịch sử dịch thuật',
    lblCopySuccess: 'Đã sao chép!'
  },
  en: {
    appName: 'Screen Translator',
    btnOptions: 'Settings',
    tabTranslate: 'Translate',
    tabQr: 'QR Code',
    btnTranslate: 'Select screen region to translate',
    btnTextSelectTranslate: 'Translate highlighted text',
    divider: 'or quick text translation',
    lblTranslateTo: 'Translate to:',
    placeholderSearch: 'Search...',
    placeholderText: 'Type or paste text to translate here...',
    btnTextTranslate: 'Translate text',
    btnImageTranslate: 'Translate image',
    textLoadingImage: 'Translating image...',
    lblTranslation: 'Translation:',
    
    lblQrScanManual: 'Manual Scan',
    lblQrScanAuto: 'Auto Scan',
    lblQrUploadPrompt: 'Drag & drop QR image or click to upload<br>Or paste image directly (Ctrl+V)',
    lblQrSuccessTitle: 'QR Scanned!',
    statusNoQrFound: 'No QR code found in the image.',
    statusQrSuccess: 'Copied QR text to clipboard.',
    statusQrLoadError: 'Failed to load image for QR analysis.',
    statusNoTextInImage: 'No text found in this image.',
    
    lblDividerQrGen: 'or generate QR code',
    placeholderQrGen: 'Enter text or URL to generate QR code here...',
    btnQrGenerate: 'Generate QR',
    lblQrGenResultTitle: 'Your QR Code:',
    btnDownloadQr: 'Download QR',
    
    statusNoKey: 'Please configure API Key first!',
    statusReload: 'Error: Please reload the webpage and try again!',
    statusHighlightErr: 'Error: Please highlight text on the webpage and try again!',
    textLoading: 'Translating...',
    lblHistoryTitle: 'Translation History',
    btnClearHistory: 'Clear history',
    lblHistoryEmpty: 'No translation history',
    lblCopySuccess: 'Copied!'
  }
};

function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

document.addEventListener('DOMContentLoaded', () => {
  // Navigation elements
  const tabBtnTranslate = document.getElementById('tabBtnTranslate');
  const tabBtnQr = document.getElementById('tabBtnQr');
  const tabContentTranslate = document.getElementById('tabContentTranslate');
  const tabContentQr = document.getElementById('tabContentQr');

  // Translation elements
  const targetLangSearch = document.getElementById('targetLangSearch');
  const targetLangList = document.getElementById('targetLangList');
  const btnTranslate = document.getElementById('btnTranslate');
  const btnTextSelectTranslate = document.getElementById('btnTextSelectTranslate');
  const textInput = document.getElementById('textInput');
  const btnPaste = document.getElementById('btnPaste');
  const btnTextTranslate = document.getElementById('btnTextTranslate');
  const imagePreviewContainer = document.getElementById('imagePreviewContainer');
  const imagePreview = document.getElementById('imagePreview');
  const btnRemoveImage = document.getElementById('btnRemoveImage');
  let pastedImageBase64 = '';
  const textOutputContainer = document.getElementById('textOutputContainer');
  const textOutput = document.getElementById('textOutput');

  // QR elements
  const btnQrScanManual = document.getElementById('btnQrScanManual');
  const btnQrScanAuto = document.getElementById('btnQrScanAuto');
  const qrUploadZone = document.getElementById('qrUploadZone');
  const qrFileInput = document.getElementById('qrFileInput');
  const qrUploadPromptContainer = document.getElementById('qrUploadPromptContainer');
  const qrResultContainer = document.getElementById('qrResultContainer');
  const qrResultText = document.getElementById('qrResultText');
  const btnCopyQrResult = document.getElementById('btnCopyQrResult');
  const btnOpenQrResult = document.getElementById('btnOpenQrResult');
  const btnTranslateQrResult = document.getElementById('btnTranslateQrResult');
  const btnResetQrScan = document.getElementById('btnResetQrScan');
  
  const qrGenInput = document.getElementById('qrGenInput');
  const btnQrGenerate = document.getElementById('btnQrGenerate');
  const qrGenResultContainer = document.getElementById('qrGenResultContainer');
  const qrGenResultImage = document.getElementById('qrGenResultImage');
  const btnDownloadQrGen = document.getElementById('btnDownloadQrGen');

  // Common header & status elements
  const btnHistory = document.getElementById('btnHistory');
  const btnOptions = document.getElementById('btnOptions');
  const statusMsg = document.getElementById('status');

  let apiKeys = [];
  let dropdown = null;
  let currentUiLang = 'en';

  // Searchable dropdown init
  dropdown = initSearchableDropdown(targetLangSearch, targetLangList, () => getLocalizedLanguagesList(currentUiLang), (newVal) => {
    chrome.storage.local.set({ targetLang: newVal });
  });

  // Apply localization
  function applyUiLocalization(lang) {
    currentUiLang = lang;
    const dict = LOCALIZATION[lang] || LOCALIZATION.vi;

    // Header & Tabs
    document.querySelector('header h1').textContent = dict.appName;
    btnOptions.title = dict.btnOptions;
    if (tabBtnTranslate) tabBtnTranslate.textContent = dict.tabTranslate;
    if (tabBtnQr) tabBtnQr.textContent = dict.tabQr;

    // Tab 1: Translator
    if (btnTranslate) btnTranslate.textContent = dict.btnTranslate;
    if (btnTextSelectTranslate) btnTextSelectTranslate.textContent = dict.btnTextSelectTranslate;
    document.querySelector('#tabContentTranslate .divider').textContent = dict.divider;
    document.querySelector('#tabContentTranslate .lang-row label').textContent = dict.lblTranslateTo;
    targetLangSearch.placeholder = dict.placeholderSearch;
    textInput.placeholder = dict.placeholderText;
    if (pastedImageBase64) {
      btnTextTranslate.textContent = dict.btnImageTranslate || 'Dịch hình ảnh';
    } else {
      btnTextTranslate.textContent = dict.btnTextTranslate;
    }
    document.querySelector('#tabContentTranslate .output-container label').textContent = dict.lblTranslation;

    // Tab 2: QR Code
    if (btnQrScanManual) {
      document.getElementById('lblQrScanManual').textContent = dict.lblQrScanManual;
    }
    if (btnQrScanAuto) {
      document.getElementById('lblQrScanAuto').textContent = dict.lblQrScanAuto;
    }
    if (qrUploadZone) {
      document.getElementById('lblQrUploadPrompt').innerHTML = dict.lblQrUploadPrompt;
    }
    const lblQrSuccessTitle = document.getElementById('lblQrSuccessTitle');
    if (lblQrSuccessTitle) lblQrSuccessTitle.textContent = dict.lblQrSuccessTitle;
    if (btnCopyQrResult) btnCopyQrResult.title = lang === 'vi' ? 'Sao chép' : 'Copy';
    if (btnOpenQrResult) btnOpenQrResult.textContent = lang === 'vi' ? 'Mở Link' : 'Open Link';
    if (btnTranslateQrResult) btnTranslateQrResult.textContent = lang === 'vi' ? 'Dịch' : 'Translate';
    if (btnResetQrScan) btnResetQrScan.textContent = lang === 'vi' ? 'Quét tiếp' : 'Scan again';

    const lblDividerQrGen = document.getElementById('lblDividerQrGen');
    if (lblDividerQrGen) lblDividerQrGen.textContent = dict.lblDividerQrGen;
    if (qrGenInput) qrGenInput.placeholder = dict.placeholderQrGen;
    if (btnQrGenerate) btnQrGenerate.textContent = dict.btnQrGenerate;
    const lblQrGenResultTitle = document.getElementById('lblQrGenResultTitle');
    if (lblQrGenResultTitle) lblQrGenResultTitle.textContent = dict.lblQrGenResultTitle;
    if (btnDownloadQrGen) btnDownloadQrGen.textContent = dict.btnDownloadQr;

    if (btnHistory) btnHistory.title = dict.lblHistoryTitle;
  }

  // Load Storage Configurations
  chrome.storage.local.get(['theme'], (result) => {
    if (result.theme === 'light') {
      document.documentElement.classList.add('light-mode');
    }
  });

  chrome.storage.local.get(['apiKeys', 'apiKey1', 'apiKey2', 'targetLang', 'uiLang', 'activeTab'], (result) => {
    apiKeys = result.apiKeys || [];
    if (apiKeys.length === 0) {
      if (result.apiKey1) apiKeys.push(result.apiKey1);
      if (result.apiKey2) apiKeys.push(result.apiKey2);
      if (apiKeys.length > 0) {
        chrome.storage.local.set({ apiKeys: apiKeys });
      }
    }

    const langSetting = result.uiLang || 'en';
    applyUiLocalization(langSetting);

    if (result.targetLang) {
      dropdown.setValue(result.targetLang);
    } else {
      dropdown.setValue('Vietnamese');
    }

    // Always default to Translation tab on launch
    if (tabBtnTranslate) tabBtnTranslate.click();

    // Clean up leftover cached input/output values
    chrome.storage.local.remove(['lastPopupInput', 'lastPopupOutput']);
  });

  // Tab switcher
  if (tabBtnTranslate && tabBtnQr) {
    tabBtnTranslate.addEventListener('click', () => {
      tabBtnTranslate.classList.add('active');
      tabBtnQr.classList.remove('active');
      tabContentTranslate.style.display = 'block';
      tabContentQr.style.display = 'none';
      chrome.storage.local.set({ activeTab: 'translate' });
    });

    tabBtnQr.addEventListener('click', () => {
      tabBtnQr.classList.add('active');
      tabBtnTranslate.classList.remove('active');
      tabContentTranslate.style.display = 'none';
      tabContentQr.style.display = 'block';
      chrome.storage.local.set({ activeTab: 'qr' });
    });
  }

  // Common Header events
  btnOptions.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  });

  if (btnHistory) {
    btnHistory.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('history.html') });
    });
  }

  function showError(text, title = null) {
    const errorToast = document.getElementById('errorToast');
    const errorToastText = document.getElementById('errorToastText');
    const errorToastTitle = document.getElementById('errorToastTitle');
    const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.vi;
    
    if (errorToast && errorToastText) {
      let defaultTitle = currentUiLang === 'vi' ? 'Lỗi' : 'Error';
      if (!title) {
        if (text.includes(dict.statusNoQrFound) || text.includes(dict.statusQrLoadError) || text.includes('QR')) {
          defaultTitle = currentUiLang === 'vi' ? 'Lỗi Quét QR' : 'QR Scan Error';
        } else {
          defaultTitle = currentUiLang === 'vi' ? 'Lỗi Dịch Thuật' : 'Translation Error';
        }
      }
      
      if (errorToastTitle) errorToastTitle.textContent = title || defaultTitle;
      errorToastText.textContent = text;
      
      const isMissingKey = text.toLowerCase().includes('configure api keys') || 
                           text.toLowerCase().includes('cấu hình api key') ||
                           text.toLowerCase().includes('vui lòng cấu hình api key') ||
                           text === dict.statusNoKey;
      if (isMissingKey) {
        const link = document.createElement('a');
        link.href = '#';
        link.className = 'error-toast-link';
        link.textContent = currentUiLang === 'vi' ? ' Đi đến Cài đặt' : ' Go to Settings';
        link.addEventListener('click', (e) => {
          e.preventDefault();
          chrome.runtime.openOptionsPage ? chrome.runtime.openOptionsPage() : window.open(chrome.runtime.getURL('options.html'));
        });
        errorToastText.appendChild(link);
      }
      
      errorToast.classList.add('show');
      
      if (window.errorToastTimeout) clearTimeout(window.errorToastTimeout);
      window.errorToastTimeout = setTimeout(() => {
        errorToast.classList.remove('show');
      }, 5000);
    } else {
      statusMsg.textContent = text;
      statusMsg.style.color = '#c5221f';
      setTimeout(() => {
        statusMsg.textContent = '';
      }, 4000);
    }
  }

  // TAB 1: TRANSLATOR EVENTS
  textInput.addEventListener('input', () => {
    if (!textInput.value.trim()) {
      textOutputContainer.style.display = 'none';
      textOutput.textContent = '';
    }
  });

  // Handler for pasting images in the translator tab
  function processPastedImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      pastedImageBase64 = e.target.result;
      if (imagePreview) imagePreview.src = pastedImageBase64;
      
      // Hide textarea and show image preview
      if (textInput) textInput.style.display = 'none';
      if (imagePreviewContainer) imagePreviewContainer.style.display = 'flex';
      
      // Update translation button text
      const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.vi;
      if (btnTextTranslate) {
        btnTextTranslate.textContent = dict.btnImageTranslate || 'Dịch hình ảnh';
      }
    };
    reader.readAsDataURL(file);
  }

  function clearPastedImage() {
    pastedImageBase64 = '';
    if (imagePreview) imagePreview.src = '';
    
    // Show textarea and hide image preview
    if (textInput) textInput.style.display = 'block';
    if (imagePreviewContainer) imagePreviewContainer.style.display = 'none';
    
    // Restore translation button text
    const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.vi;
    if (btnTextTranslate) {
      btnTextTranslate.textContent = dict.btnTextTranslate || 'Dịch văn bản';
    }
  }

  // Bind remove image button
  if (btnRemoveImage) {
    btnRemoveImage.addEventListener('click', () => {
      clearPastedImage();
    });
  }

  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        // Try reading items from clipboard
        const items = await navigator.clipboard.read();
        for (const item of items) {
          const imageTypes = item.types.filter(type => type.startsWith('image/'));
          if (imageTypes.length > 0) {
            const blob = await item.getType(imageTypes[0]);
            processPastedImageFile(blob);
            return;
          }
        }
        
        // Fallback to text
        const text = await navigator.clipboard.readText();
        if (text) {
          textInput.value = text;
          textInput.focus();
          clearPastedImage();
        }
      } catch (err) {
        console.warn('Không thể đọc clipboard:', err);
        // Fallback if read() fails or permission denied
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            textInput.value = text;
            textInput.focus();
            clearPastedImage();
          }
        } catch (e2) {
          console.warn('Fallback readText failed:', e2);
        }
      }
    });
  }

  btnTranslate.addEventListener('click', () => {
    const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.vi;

    if (apiKeys.length === 0 || !apiKeys[0]) {
      showError(dict.statusNoKey);
      setTimeout(() => {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
      }, 1000);
      return;
    }

    chrome.runtime.sendMessage({ action: 'start-selection-mode' }, (response) => {
      if (chrome.runtime.lastError) {
        showError(dict.statusReload);
        return;
      }
      window.close();
    });
  });

  btnTextSelectTranslate.addEventListener('click', () => {
    const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.vi;

    if (apiKeys.length === 0 || !apiKeys[0]) {
      showError(dict.statusNoKey);
      setTimeout(() => {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
      }, 1000);
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { action: 'trigger-text-translation' }, (response) => {
          if (chrome.runtime.lastError || (response && response.error)) {
            showError(dict.statusHighlightErr);
            return;
          }
          window.close();
        });
      }
    });
  });

  btnTextTranslate.addEventListener('click', () => {
    const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.vi;

    if (apiKeys.length === 0 || !apiKeys[0]) {
      showError(dict.statusNoKey);
      setTimeout(() => {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
      }, 1000);
      return;
    }

    const targetLang = dropdown.getValue();

    // Check if we have a pasted image
    if (pastedImageBase64) {
      statusMsg.textContent = '';
      textOutputContainer.style.display = 'block';
      textOutput.textContent = dict.textLoadingImage || 'Đang dịch hình ảnh...';
      textOutput.className = 'loading';
      textOutput.style.color = '';

      chrome.runtime.sendMessage({
        action: 'translate-image-popup',
        base64Data: pastedImageBase64,
        targetLang: targetLang
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Popup connection closed. Image translation continuing in background.');
          return;
        }

        if (response) {
          if (response.success) {
            if (response.translatedText && response.translatedText.trim()) {
              renderTextOutput(response.translatedText);
            } else {
              renderTextError(dict.statusNoTextInImage || 'Không tìm thấy văn bản nào trong hình ảnh này.');
            }
          } else {
            renderTextError(response.error);
          }
        }
      });
      return;
    }

    const rawText = textInput.value.trim();
    if (!rawText) {
      textInput.focus();
      return;
    }

    statusMsg.textContent = '';
    textOutputContainer.style.display = 'block';
    textOutput.textContent = dict.textLoading;
    textOutput.className = 'loading';
    textOutput.style.color = '';

    chrome.runtime.sendMessage({
      action: 'translate-text-popup',
      text: rawText,
      targetLang: targetLang
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.log('Popup connection closed. Translation continuing in background.');
        return;
      }

      if (response) {
        if (response.success) {
          renderTextOutput(response.translatedText);
        } else {
          renderTextError(response.error);
        }
      }
    });
  });

  function renderTextOutput(translatedText) {
    textOutput.textContent = translatedText;
    textOutput.className = '';
    textOutput.style.color = '';
    
    let btnCopy = textOutputContainer.querySelector('.btn-copy-output');
    if (!btnCopy) {
      btnCopy = document.createElement('button');
      btnCopy.className = 'btn-copy-output';
      btnCopy.textContent = 'Copy';
      btnCopy.addEventListener('click', () => {
        navigator.clipboard.writeText(textOutput.textContent).then(() => {
          const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.vi;
          const origText = btnCopy.textContent;
          btnCopy.textContent = dict.lblCopySuccess;
          setTimeout(() => {
            btnCopy.textContent = origText;
          }, 1500);
        });
      });
      textOutputContainer.appendChild(btnCopy);
    }
  }

  function renderTextError(errMessage) {
    textOutput.textContent = errMessage;
    textOutput.className = '';
    textOutput.style.color = '#c5221f';
    const btnCopy = textOutputContainer.querySelector('.btn-copy-output');
    if (btnCopy) btnCopy.remove();
  }

  // TAB 2: QR CODE EVENTS
  if (btnQrScanManual) {
    btnQrScanManual.addEventListener('click', () => {
      const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.vi;
      chrome.runtime.sendMessage({ action: 'start-qr-selection-mode' }, (response) => {
        if (chrome.runtime.lastError) {
          showError(dict.statusReload);
          return;
        }
        window.close();
      });
    });
  }

  if (btnQrScanAuto) {
    btnQrScanAuto.addEventListener('click', () => {
      const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.vi;
      chrome.runtime.sendMessage({ action: 'start-auto-qr-scan' }, (response) => {
        if (chrome.runtime.lastError) {
          showError(dict.statusReload);
          return;
        }
        window.close();
      });
    });
  }

  // Drag-and-drop & file selector for QR image
  if (qrUploadZone) {
    qrUploadZone.addEventListener('click', (e) => {
      if (qrUploadPromptContainer.contains(e.target) || e.target === qrUploadZone) {
        if (qrUploadPromptContainer.style.display !== 'none') {
          qrFileInput.click();
        }
      }
    });

    qrUploadZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      qrUploadZone.classList.add('dragover');
    });

    qrUploadZone.addEventListener('dragleave', () => {
      qrUploadZone.classList.remove('dragover');
    });

    qrUploadZone.addEventListener('drop', (e) => {
      e.preventDefault();
      qrUploadZone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        processQrImageFile(e.dataTransfer.files[0]);
      }
    });
  }

  if (qrFileInput) {
    qrFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        processQrImageFile(e.target.files[0]);
      }
    });
  }

  // Global document paste event listener
  document.addEventListener('paste', (e) => {
    if (e.clipboardData && e.clipboardData.files && e.clipboardData.files[0]) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        // Intercept if we are on the translator tab
        if (tabBtnTranslate && tabBtnTranslate.classList.contains('active')) {
          processPastedImageFile(file);
          e.preventDefault();
          return;
        }
        
        // Otherwise, if we are on the QR tab, run QR scanner
        if (tabBtnQr && tabBtnQr.classList.contains('active')) {
          const activeEl = document.activeElement;
          if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
            // Let normal text paste if focused on QR generator, but if they pasted an image file scan it
            processQrImageFile(file);
            e.preventDefault();
            return;
          }
          processQrImageFile(file);
          e.preventDefault();
        }
      }
    }
  });

  let lastScannedQrData = '';

  if (btnCopyQrResult) {
    btnCopyQrResult.addEventListener('click', () => {
      if (!lastScannedQrData) return;
      navigator.clipboard.writeText(lastScannedQrData).then(() => {
        const origHtml = btnCopyQrResult.innerHTML;
        btnCopyQrResult.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#4caf50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
        btnCopyQrResult.style.borderColor = '#4caf50';
        setTimeout(() => {
          btnCopyQrResult.innerHTML = origHtml;
          btnCopyQrResult.style.borderColor = '';
        }, 1500);
      });
    });
  }

  if (btnOpenQrResult) {
    btnOpenQrResult.addEventListener('click', () => {
      if (!lastScannedQrData) return;
      chrome.tabs.create({ url: lastScannedQrData });
    });
  }

  if (btnTranslateQrResult) {
    btnTranslateQrResult.addEventListener('click', () => {
      if (!lastScannedQrData) return;
      
      // Switch back to translation tab
      if (tabBtnTranslate) tabBtnTranslate.click();
      
      textInput.value = lastScannedQrData;
      textInput.dispatchEvent(new Event('input'));
      textInput.focus();
      btnTextTranslate.click(); 
    });
  }

  if (btnResetQrScan) {
    btnResetQrScan.addEventListener('click', () => {
      lastScannedQrData = '';
      qrResultContainer.style.display = 'none';
      qrUploadPromptContainer.style.display = 'flex';
      qrResultText.textContent = '';
      btnOpenQrResult.style.display = 'none';
    });
  }

  const errorToastClose = document.getElementById('errorToastClose');
  if (errorToastClose) {
    errorToastClose.addEventListener('click', () => {
      const errorToast = document.getElementById('errorToast');
      if (errorToast) {
        errorToast.classList.remove('show');
        if (window.errorToastTimeout) clearTimeout(window.errorToastTimeout);
      }
    });
  }

  function processQrImageFile(file) {
    if (!file || !file.type.startsWith('image/')) return;
    const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.vi;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imgData.data, imgData.width, imgData.height);

          if (code && code.data) {
            lastScannedQrData = code.data;
            
            // Add to QR history
            try {
              chrome.runtime.sendMessage({
                action: 'add-qr-to-history',
                type: 'scan',
                content: code.data
              });
            } catch (err) {
              console.warn('Failed to save local QR scan to history:', err);
            }
            
            qrUploadPromptContainer.style.display = 'none';
            qrResultContainer.style.display = 'flex';
            qrResultText.textContent = code.data;

            navigator.clipboard.writeText(code.data).then(() => {
              statusMsg.style.color = '#4caf50';
              statusMsg.textContent = dict.statusQrSuccess;
              setTimeout(() => {
                statusMsg.textContent = '';
                statusMsg.style.color = '';
              }, 3000);
            }).catch(err => {
              console.warn('Failed to copy QR text', err);
            });

            if (code.data.startsWith('http://') || code.data.startsWith('https://')) {
              btnOpenQrResult.style.display = 'inline-block';
            } else {
              btnOpenQrResult.style.display = 'none';
            }
          } else {
            showError(dict.statusNoQrFound);
          }
        } catch (err) {
          console.warn(err);
          showError(dict.statusQrLoadError);
        }
      };
      img.onerror = () => {
        showError(dict.statusQrLoadError);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // QR CODE GENERATOR EVENTS
  if (btnQrGenerate) {
    btnQrGenerate.addEventListener('click', () => {
      const text = qrGenInput.value.trim();
      if (!text) {
        qrGenInput.focus();
        return;
      }

      try {
        const qr = qrcode(0, 'M');
        // Use Byte mode for non-ASCII (Unicode) text like Chinese, Japanese, etc.
        const hasNonAscii = /[^ -]/.test(text);
        if (hasNonAscii) {
          qr.addData(text, 'Byte');
        } else {
          qr.addData(text);
        }
        qr.make();

        const imgUrl = qr.createDataURL(5, 8); // cellSize=5, margin=8
        
        // Add to QR history
        try {
          chrome.runtime.sendMessage({
            action: 'add-qr-to-history',
            type: 'generate',
            content: text
          });
        } catch (err) {
          console.warn('Failed to save generated QR to history:', err);
        }

        qrGenResultImage.innerHTML = `<img src="${imgUrl}" alt="QR Code" style="max-width: 140px; display: block; margin: 0 auto; border: 4px solid white; border-radius: 4px; box-sizing: border-box;">`;
        qrGenResultContainer.style.display = 'flex';

        // Setup download button
        btnDownloadQrGen.onclick = () => {
          const a = document.createElement('a');
          a.href = imgUrl;
          a.download = 'qrcode.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        };
      } catch (err) {
        console.warn('Failed to generate QR Code:', err);
      }
    });
  }

  // Storage listener for active tab changes or language updates
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      if (changes.uiLang) {
        const l = changes.uiLang.newValue || 'en';
        applyUiLocalization(l);
        dropdown.updateLabel();
      }
      if (changes.apiKeys) {
        apiKeys = changes.apiKeys.newValue || [];
      }
    }
  });

  // Dropdown helper functions
  function initSearchableDropdown(inputEl, listEl, getItemsFn, onChange) {
    let selectedValue = 'Vietnamese';
    let activeLabel = 'Tiếng Việt';

    function renderList(filterText = '') {
      listEl.innerHTML = '';
      const itemsList = getItemsFn();
      const filtered = itemsList.filter(lang => {
        const labelClean = removeAccents(lang.label);
        const valClean = removeAccents(lang.value);
        const filterClean = removeAccents(filterText.trim());
        return labelClean.includes(filterClean) || valClean.includes(filterClean);
      });

      if (filtered.length === 0) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'dropdown-item';
        emptyDiv.style.color = '#9aa0a6';
        emptyDiv.style.cursor = 'default';
        emptyDiv.textContent = currentUiLang === 'vi' ? 'Không tìm thấy' : 'No results found';
        listEl.appendChild(emptyDiv);
        return;
      }

      filtered.forEach(lang => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.textContent = lang.label;
        item.setAttribute('data-value', lang.value);
        item.addEventListener('click', (e) => {
          selectedValue = lang.value;
          activeLabel = lang.label;
          inputEl.value = activeLabel;
          listEl.style.display = 'none';
          onChange(selectedValue);
          e.stopPropagation();
        });
        listEl.appendChild(item);
      });
    }

    inputEl.addEventListener('focus', () => {
      inputEl.value = '';
      renderList('');
      listEl.style.display = 'block';
    });

    inputEl.addEventListener('input', () => {
      renderList(inputEl.value);
    });

    document.addEventListener('click', (e) => {
      if (!inputEl.contains(e.target) && !listEl.contains(e.target)) {
        listEl.style.display = 'none';
        inputEl.value = activeLabel;
      }
    });

    return {
      setValue: (val) => {
        const itemsList = getItemsFn();
        const found = itemsList.find(l => l.value === val);
        if (found) {
          selectedValue = found.value;
          activeLabel = found.label;
          inputEl.value = activeLabel;
        }
      },
      updateLabel: () => {
        const itemsList = getItemsFn();
        const found = itemsList.find(l => l.value === selectedValue);
        if (found) {
          activeLabel = found.label;
          inputEl.value = activeLabel;
        }
      },
      getValue: () => selectedValue
    };
  }
});
