const LANGUAGE_MAP = {
  'vietnamese': { vi: 'Tiếng Việt', en: 'Vietnamese' },
  'english': { vi: 'Tiếng Anh', en: 'English' },
  'japanese': { vi: 'Tiếng Nhật', en: 'Japanese' },
  'chinese': { vi: 'Tiếng Trung', en: 'Chinese' },
  'korean': { vi: 'Tiếng Hàn', en: 'Korean' },
  'french': { vi: 'Tiếng Pháp', en: 'French' },
  'german': { vi: 'Tiếng Đức', en: 'German' },
  'spanish': { vi: 'Tiếng Tây Ban Nha', en: 'Spanish' },
  'italian': { vi: 'Tiếng Ý', en: 'Italian' },
  'russian': { vi: 'Tiếng Nga', en: 'Russian' },
  'portuguese': { vi: 'Tiếng Bồ Đào Nha', en: 'Portuguese' },
  'thai': { vi: 'Tiếng Thái', en: 'Thai' },
  'indonesian': { vi: 'Tiếng Indonesia', en: 'Indonesian' },
  'malay': { vi: 'Tiếng Mã Lai', en: 'Malay' },
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

const UI_LANG_DETAILS = {
  vi: { flag: '🇻🇳' },
  en: { flag: '🇺🇸' }
};

const LOCALIZATION = {
  vi: {
    appName: 'Screen Translator',
    btnOptions: 'Cài đặt',
    btnTranslate: 'Chọn vùng màn hình để dịch',
    btnTextSelectTranslate: 'Dịch văn bản bôi đen',
    divider: 'hoặc dịch văn bản nhanh',
    lblTranslateTo: 'Dịch sang:',
    placeholderSearch: 'Tìm kiếm...',
    placeholderText: 'Nhập hoặc dán văn bản cần dịch tại đây...',
    btnTextTranslate: 'Dịch văn bản',
    lblTranslation: 'Bản dịch:',
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
    btnTranslate: 'Select screen region to translate',
    btnTextSelectTranslate: 'Translate highlighted text',
    divider: 'or quick text translation',
    lblTranslateTo: 'Translate to:',
    placeholderSearch: 'Search...',
    placeholderText: 'Type or paste text to translate here...',
    btnTextTranslate: 'Translate text',
    lblTranslation: 'Translation:',
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
  const targetLangSearch = document.getElementById('targetLangSearch');
  const targetLangList = document.getElementById('targetLangList');
  const btnTranslate = document.getElementById('btnTranslate');
  const btnTextSelectTranslate = document.getElementById('btnTextSelectTranslate');
  const btnHistory = document.getElementById('btnHistory');
  const btnOptions = document.getElementById('btnOptions');
  const textInput = document.getElementById('textInput');
  const btnTextTranslate = document.getElementById('btnTextTranslate');
  const textOutputContainer = document.getElementById('textOutputContainer');
  const textOutput = document.getElementById('textOutput');
  const statusMsg = document.getElementById('status');

  let apiKeys = [];
  let dropdown = null;
  let currentUiLang = 'en';

  dropdown = initSearchableDropdown(targetLangSearch, targetLangList, () => getLocalizedLanguagesList(currentUiLang), (newVal) => {
    chrome.storage.local.set({ targetLang: newVal });
  });

  function applyUiLocalization(lang) {
    currentUiLang = lang;
    const dict = LOCALIZATION[lang] || LOCALIZATION.vi;

    document.querySelector('header h1').textContent = dict.appName;
    btnOptions.title = dict.btnOptions;
    btnTranslate.textContent = dict.btnTranslate;
    btnTextSelectTranslate.textContent = dict.btnTextSelectTranslate;
    document.querySelector('.divider').textContent = dict.divider;
    document.querySelector('.lang-row label').textContent = dict.lblTranslateTo;
    targetLangSearch.placeholder = dict.placeholderSearch;
    textInput.placeholder = dict.placeholderText;
    btnTextTranslate.textContent = dict.btnTextTranslate;
    document.querySelector('.output-container label').textContent = dict.lblTranslation;

    if (btnHistory) btnHistory.title = dict.lblHistoryTitle;
  }

  chrome.storage.local.get(['theme'], (result) => {
    if (result.theme === 'light') {
      document.documentElement.classList.add('light-mode');
    }
  });

  chrome.storage.local.get(['apiKeys', 'apiKey1', 'apiKey2', 'targetLang', 'uiLang', 'lastPopupInput', 'lastPopupOutput'], (result) => {
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

    if (result.lastPopupInput) {
      textInput.value = result.lastPopupInput;
    }
    if (result.lastPopupOutput) {
      textOutputContainer.style.display = 'block';
      renderTextOutput(result.lastPopupOutput);
    }
  });

  textInput.addEventListener('input', () => {
    chrome.storage.local.set({ lastPopupInput: textInput.value });
    if (!textInput.value.trim()) {
      chrome.storage.local.remove(['lastPopupOutput']);
      textOutputContainer.style.display = 'none';
      textOutput.textContent = '';
    }
  });

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

  function showError(text) {
    statusMsg.textContent = text;
    setTimeout(() => {
      statusMsg.textContent = '';
    }, 4000);
  }

  btnOptions.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  });

  if (btnHistory) {
    btnHistory.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('history.html') });
    });
  }

  const btnPaste = document.getElementById('btnPaste');
  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        textInput.value = text;
        textInput.focus();
      } catch (err) {
        console.error('Không thể đọc clipboard:', err);
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
    const rawText = textInput.value.trim();
    if (!rawText) {
      textInput.focus();
      return;
    }

    if (apiKeys.length === 0 || !apiKeys[0]) {
      showError(dict.statusNoKey);
      setTimeout(() => {
        chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
      }, 1000);
      return;
    }

    statusMsg.textContent = '';
    textOutputContainer.style.display = 'block';
    textOutput.textContent = dict.textLoading;
    textOutput.className = 'loading';
    textOutput.style.color = '';

    const targetLang = dropdown.getValue();

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
          chrome.storage.local.set({ lastPopupOutput: response.translatedText });
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
