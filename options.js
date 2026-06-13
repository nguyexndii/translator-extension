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
    const key = lang.toLowerCase() === 'italian' ? 'italic' : lang.toLowerCase();
    const mapping = LANGUAGE_MAP[key];
    const label = mapping ? mapping[uiLang] : lang;
    return { value: lang, label: label };
  });
  list.sort((a, b) => a.label.localeCompare(b.label, uiLang));
  return list;
}

const UI_LANG_DETAILS = {
  vi: {
    flagHtml: `<svg class="flag-icon" viewBox="0 0 26 14" width="18" height="12" style="border-radius: 2px; box-shadow: 0 0 1px rgba(0,0,0,0.3); display: inline-block; vertical-align: middle; margin-right: 6px;"><rect width="26" height="14" fill="#da251d"/><polygon points="13,2.5 13.9,5.5 17.1,5.5 14.5,7.4 15.5,10.5 13,8.6 10.5,10.5 11.5,7.4 8.9,5.5 12.1,5.5" fill="#ffff00"/></svg>`,
    name: 'Tiếng Việt'
  },
  en: {
    flagHtml: `<svg class="flag-icon" viewBox="0 0 26 14" width="18" height="12" style="border-radius: 2px; box-shadow: 0 0 1px rgba(0,0,0,0.3); display: inline-block; vertical-align: middle; margin-right: 6px;"><rect width="26" height="14" fill="#b22234"/><rect width="26" height="1" y="1" fill="#ffffff"/><rect width="26" height="1" y="3" fill="#ffffff"/><rect width="26" height="1" y="5" fill="#ffffff"/><rect width="26" height="1" y="7" fill="#ffffff"/><rect width="26" height="1" y="9" fill="#ffffff"/><rect width="26" height="1" y="13" fill="#ffffff"/><rect width="11" height="8" fill="#3c3b6e"/><circle cx="3" cy="2.5" r="0.6" fill="#fff"/><circle cx="8" cy="2.5" r="0.6" fill="#fff"/><circle cx="5.5" cy="4" r="0.6" fill="#fff"/><circle cx="3" cy="5.5" r="0.6" fill="#fff"/><circle cx="8" cy="5.5" r="0.6" fill="#fff"/></svg>`,
    name: 'English'
  }
};

const OPTIONS_LOCALIZATION = {
  vi: {
    title: 'Cài đặt Screen Translator',
    subtitle: 'Thiết lập khóa API và các tùy chọn dịch thuật',
    secApi: 'Cài đặt API Keys',
    descApi: 'API Keys được lưu trữ cục bộ trên trình duyệt của bạn và không bao giờ được gửi đi bất kỳ đâu ngoại trừ máy chủ dịch thuật.',
    btnAddKey: 'Thêm khóa API',
    secLang: 'Cài đặt chung',
    lblTargetLang: 'Dịch sang ngôn ngữ:',
    lblTheme: 'Chế độ giao diện (Theme):',
    secShortcut: 'Phím tắt dịch thuật',
    descShortcut: 'Danh sách phím tắt mặc định dùng để kích hoạt các chế độ dịch:',
    lblShortcutCrop: 'Chọn vùng màn hình để dịch:',
    lblShortcutText: 'Dịch văn bản bôi đen:',
    lblShortcutHistory: 'Mở trang Lịch sử dịch thuật:',
    secBrowserShortcut: 'Cài đặt phím tắt trình duyệt',
    descBrowserShortcut: 'Nếu bạn muốn thay đổi tổ hợp phím nóng hoặc cấu hình phạm vi hoạt động của phím tắt:',
    btnChangeShortcut: 'Thay đổi phím tắt trong trình duyệt',
    btnSave: 'Lưu cài đặt',
    statusSaved: 'Đã lưu cài đặt thành công!',
    statusNoKeysErr: 'Vui lòng nhập ít nhất một API Key!',
    exitWarning: 'Bạn có thay đổi chưa lưu, bạn có chắc chắn muốn rời đi?',
    shortcutNotSet: 'Chưa gán',
    secGuide: 'Tìm hiểu cách dùng',
    btnShowKey: 'Hiện',
    btnHideKey: 'Ẩn',
    themeDark: 'Tối',
    themeLight: 'Sáng',
    footerModel: 'Sử dụng model: gemini-3.1-flash-lite-preview (Tốc độ tối ưu, hỗ trợ đa phương thức)',
    footerCopyright: 'Phát triển cho mục đích dịch trực tiếp màn hình.',
    guideHtml: `
      <div class="guide-item">
        <div class="guide-step">1. Dịch vùng màn hình (Chụp ảnh dịch)</div>
        <p class="guide-text">Nhấn tổ hợp phím <span id="guideShortcutCrop"><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd></span> hoặc nhấp nút tương ứng trong Popup, sau đó giữ và kéo chuột để khoanh vùng văn bản cần dịch. Bản dịch sẽ hiển thị đè trực tiếp lên chữ gốc. Khi di chuột vào ô dịch, phần nền và văn bản dịch sẽ mờ đi để bạn dễ dàng đối chiếu với nội dung gốc phía dưới.</p>
      </div>
      <div class="guide-item">
        <div class="guide-step">2. Dịch văn bản bôi đen (Highlight)</div>
        <p class="guide-text">Bôi đen đoạn văn bản trên trang web rồi nhấn tổ hợp phím <span id="guideShortcutText"><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd></span>, nhấp chuột vào biểu tượng dịch nổi hoặc chọn lệnh dịch từ menu chuột phải. Khung chứa bản dịch sẽ xuất hiện ngay dưới vùng chọn. Để tối giản giao diện, thông tin chi tiết về ngôn ngữ dịch đã được lược bỏ.</p>
      </div>
      <div class="guide-item">
        <div class="guide-step">3. Dịch văn bản tự do trong Popup</div>
        <p class="guide-text">Nhấp vào biểu tượng tiện ích hoặc nhấn tổ hợp phím <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>W</kbd> để mở nhanh cửa sổ dịch. Ô nhập liệu có tích hợp <strong>nút dán (paste)</strong> ở góc dưới bên phải giúp bạn dán nhanh nội dung đã sao chép từ clipboard chỉ với một cú click, sau đó chọn ngôn ngữ muốn dịch để nhận kết quả tức thời.</p>
      </div>
      <div class="guide-item">
        <div class="guide-step">4. Trang quản lý Lịch sử dịch thuật</div>
        <p class="guide-text">Bạn có thể truy cập trang Lịch sử dịch thuật độc lập bằng cách nhấp vào biểu tượng Lịch sử ở góc trên của Popup để xem lại toàn bộ các bản dịch cũ. Trang quản lý hỗ trợ tìm kiếm nhanh theo từ khóa, lọc theo ngôn ngữ bản dịch, sao chép nhanh và tự động phân trang để tránh gây chậm trình duyệt.</p>
      </div>
      <div class="guide-item">
        <div class="guide-step">5. Quản lý phím tắt hệ thống</div>
        <p class="guide-text">Tiện ích sử dụng hệ thống phím tắt mặc định của Chrome. Bạn có thể tự do thay đổi tổ hợp phím hoặc chuyển đổi chế độ hoạt động (trong tab hiện tại hoặc toàn hệ thống) bằng cách nhấp vào nút <strong>"Thay đổi phím tắt trong trình duyệt"</strong> hoặc truy cập trực tiếp liên kết <a href="#" class="chrome-link">Thiết lập phím tắt Chrome</a>.</p>
      </div>
    `
  },
  en: {
    title: 'Screen Translator Settings',
    subtitle: 'Configure your API keys and translation options',
    secApi: 'API Keys Settings',
    descApi: 'API Keys are stored locally on your browser and are never sent anywhere except to the translation server.',
    btnAddKey: 'Add API Key',
    secLang: 'General Settings',
    lblTargetLang: 'Translate to language:',
    lblTheme: 'Theme Mode:',
    secShortcut: 'Translation Shortcuts',
    descShortcut: 'Default shortcuts used to trigger translation modes:',
    lblShortcutCrop: 'Select screen region to translate:',
    lblShortcutText: 'Translate highlighted text:',
    lblShortcutHistory: 'Open Translation History:',
    secBrowserShortcut: 'Browser Shortcut Settings',
    descBrowserShortcut: 'If you want to change the hotkeys or configure their global scope:',
    btnChangeShortcut: 'Change shortcuts in browser',
    btnSave: 'Save Settings',
    statusSaved: 'Settings saved successfully!',
    statusNoKeysErr: 'Please enter at least one API Key!',
    exitWarning: 'You have unsaved changes. Are you sure you want to leave?',
    shortcutNotSet: 'Not assigned',
    secGuide: 'Learn How to Use',
    btnShowKey: 'Show',
    btnHideKey: 'Hide',
    themeDark: 'Dark',
    themeLight: 'Light',
    footerModel: 'Using model: gemini-3.1-flash-lite-preview (Optimized speed, multimodal support)',
    footerCopyright: 'Developed for screen translation.',
    guideHtml: `
      <div class="guide-item">
        <div class="guide-step">1. Screen Area Translation (OCR)</div>
        <p class="guide-text">Press <span id="guideShortcutCrop"><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd></span> or click the translate button in the popup, then hold and drag your mouse to crop the text area. The translation will be overlaid right on top of the original text. Hovering over any translation box will fade out its background and text, allowing you to easily read the original content underneath.</p>
      </div>
      <div class="guide-item">
        <div class="guide-step">2. Highlighted Text Translation</div>
        <p class="guide-text">Highlight any text on the webpage and press <span id="guideShortcutText"><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>D</kbd></span>, click the floating translation icon, or select the translation option from the right-click context menu. The translation will appear immediately below the selection. Source and target language badges are hidden to keep the UI clean.</p>
      </div>
      <div class="guide-item">
        <div class="guide-step">3. Free Text Translation (Popup)</div>
        <p class="guide-text">Click the extension icon or press <kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>W</kbd> to quickly open the popup. The input box features a **paste button** in the bottom-right corner, allowing you to paste copied text from your clipboard with a single click. Select your target language to get instant results.</p>
      </div>
      <div class="guide-item">
        <div class="guide-step">4. Dedicated Translation History</div>
        <p class="guide-text">Click the History icon in the popup header to open a dedicated tab managing all your translations. It supports real-time text searching, language filtering, quick copy, and smart pagination to prevent browser lag.</p>
      </div>
      <div class="guide-item">
        <div class="guide-step">5. Customize Browser Shortcuts</div>
        <p class="guide-text">The extension uses default Chrome hotkeys. You can change the key bindings or set their scope to global (to use shortcuts outside the browser) by clicking the <strong>"Change shortcuts in browser"</strong> button above, or by clicking directly on the <a href="#" class="chrome-link">Chrome Shortcuts settings</a> link.</p>
      </div>
    `
  }
};

// Helper to remove accents for search
function removeAccents(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

document.addEventListener('DOMContentLoaded', () => {
  const apiKeysContainer = document.getElementById('apiKeysContainer');
  const btnAddApiKey = document.getElementById('btnAddApiKey');
  const optTargetLangSearch = document.getElementById('optTargetLangSearch');
  const optTargetLangList = document.getElementById('optTargetLangList');
  const btnSave = document.getElementById('btnSave');
  const btnChangeShortcuts = document.getElementById('btnChangeShortcuts');
  const saveStatus = document.getElementById('saveStatus');
  const selTheme = document.getElementById('selTheme');
  const saveStatusRow = document.querySelector('.save-status-row');

  // Header language selector elements
  const btnLangSelect = document.getElementById('btnLangSelect');
  const currentLangFlag = document.getElementById('currentLangFlag');
  const currentLangText = document.getElementById('currentLangText');
  const uiLangDropdownList = document.getElementById('uiLangDropdownList');

  let isDirty = false;
  let targetDropdown = null;
  let currentUiLang = 'en';
  let loadedApiKeys = [];
  let loadedTargetLang = 'Vietnamese';

  // Unsaved changes warning
  window.addEventListener('beforeunload', (e) => {
    if (isDirty) {
      const msg = OPTIONS_LOCALIZATION[currentUiLang].exitWarning;
      e.preventDefault();
      e.returnValue = msg;
      return msg;
    }
  });

  function checkIfDirty() {
    const inputs = apiKeysContainer.querySelectorAll('.api-key-input');
    const currentKeys = [];
    inputs.forEach(input => {
      const val = input.value.trim();
      if (val) {
        currentKeys.push(val);
      }
    });

    const currentTargetLang = targetDropdown ? targetDropdown.getValue() : loadedTargetLang;

    let keysChanged = false;
    if (currentKeys.length !== loadedApiKeys.length) {
      keysChanged = true;
    } else {
      for (let i = 0; i < currentKeys.length; i++) {
        if (currentKeys[i] !== loadedApiKeys[i]) {
          keysChanged = true;
          break;
        }
      }
    }

    const langChanged = currentTargetLang !== loadedTargetLang;
    isDirty = keysChanged || langChanged;

    if (saveStatusRow) {
      if (isDirty) {
        saveStatusRow.classList.add('visible');
      } else {
        saveStatusRow.classList.remove('visible');
      }
    }
  }

  // Initialize Searchable Dropdown for Target Language
  targetDropdown = initSearchableDropdown(optTargetLangSearch, optTargetLangList, () => getLocalizedLanguagesList(currentUiLang), (newVal) => {
    checkIfDirty();
  });

  // Header UI Language Selector setup
  btnLangSelect.addEventListener('click', (e) => {
    e.stopPropagation();
    const isShown = uiLangDropdownList.style.display === 'block';
    uiLangDropdownList.style.display = isShown ? 'none' : 'block';
  });

  document.addEventListener('click', () => {
    uiLangDropdownList.style.display = 'none';
  });

  uiLangDropdownList.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.stopPropagation();
      const val = item.getAttribute('data-value');
      uiLangDropdownList.style.display = 'none';
      
      // Update uiLang immediately in storage to sync with other views
      chrome.storage.local.set({ uiLang: val }, () => {
        applyUiLocalization(val);
        updateUiLangHeaderButton(val);
        targetDropdown.updateLabel();
      });
    });
  });

  function updateUiLangHeaderButton(lang) {
    const details = UI_LANG_DETAILS[lang] || UI_LANG_DETAILS.en;
    currentLangFlag.innerHTML = details.flagHtml;
    currentLangText.textContent = details.name;
  }

  // Handle Theme dropdown change with immediate effect
  selTheme.addEventListener('change', () => {
    const themeVal = selTheme.value;
    if (themeVal === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
    localStorage.setItem('theme', themeVal);
    chrome.storage.local.set({ theme: themeVal });
  });

  // Apply UI translations dynamically
  function applyUiLocalization(lang) {
    currentUiLang = lang;
    const dict = OPTIONS_LOCALIZATION[lang] || OPTIONS_LOCALIZATION.vi;

    document.title = dict.title;
    document.getElementById('txtTitle').textContent = dict.title;
    document.getElementById('txtSubtitle').textContent = dict.subtitle;
    document.getElementById('secApi').textContent = dict.secApi;
    document.getElementById('descApi').textContent = dict.descApi;
    btnAddApiKey.textContent = dict.btnAddKey;
    document.getElementById('secLang').textContent = dict.secLang;
    document.getElementById('lblTargetLang').textContent = dict.lblTargetLang;
    document.getElementById('lblTheme').textContent = dict.lblTheme;
    document.getElementById('secShortcut').textContent = dict.secShortcut;
    document.getElementById('descShortcut').textContent = dict.descShortcut;
    document.getElementById('lblShortcutCrop').textContent = dict.lblShortcutCrop;
    document.getElementById('lblShortcutText').textContent = dict.lblShortcutText;
    document.getElementById('lblShortcutHistory').textContent = dict.lblShortcutHistory;
    
    // Dynamic Select Option Translation for Theme mode
    const optDark = selTheme.querySelector('option[value="dark"]');
    const optLight = selTheme.querySelector('option[value="light"]');
    if (optDark) optDark.textContent = dict.themeDark;
    if (optLight) optLight.textContent = dict.themeLight;

    // Dynamic Show/Hide translation for existing API keys
    apiKeysContainer.querySelectorAll('.btn-toggle-show').forEach(btn => {
      const input = btn.previousElementSibling;
      btn.textContent = input.type === 'password' ? dict.btnShowKey : dict.btnHideKey;
      // Re-index placeholder with correct API Key number
      const labelText = btn.parentElement.previousElementSibling.textContent;
      input.placeholder = `${labelText}...`;
    });

    const descBrowserShortcutEl = document.getElementById('descBrowserShortcut');
    if (descBrowserShortcutEl) descBrowserShortcutEl.textContent = dict.descBrowserShortcut;

    btnChangeShortcuts.textContent = dict.btnChangeShortcut;
    btnSave.textContent = dict.btnSave;

    document.getElementById('txtFooterModel').textContent = dict.footerModel;
    document.getElementById('txtFooterCopyright').textContent = dict.footerCopyright;

    // Localize User Guide
    const secGuideEl = document.getElementById('secGuide');
    const guideContentEl = document.getElementById('guideContent');
    if (secGuideEl) {
      secGuideEl.innerHTML = `<span>${dict.secGuide}</span> <span class="toggle-icon">›</span>`;
    }
    if (guideContentEl) {
      guideContentEl.innerHTML = dict.guideHtml;
    }

    // Load actual keyboard shortcuts dynamically
    loadAndDisplayShortcuts();
  }

  // Helper to load and display actual shortcuts from the browser
  function loadAndDisplayShortcuts() {
    const dict = OPTIONS_LOCALIZATION[currentUiLang] || OPTIONS_LOCALIZATION.vi;
    
    if (typeof chrome !== 'undefined' && chrome.commands && chrome.commands.getAll) {
      chrome.commands.getAll((commands) => {
        commands.forEach((cmd) => {
          if (cmd.name === 'trigger-translation') {
            const formatted = formatShortcut(cmd.shortcut, dict.shortcutNotSet, 'Alt + Shift + S');
            const el = document.getElementById('shortcutCropValue');
            if (el) el.innerHTML = formatted;
            
            const elGuide = document.getElementById('guideShortcutCrop');
            if (elGuide) elGuide.innerHTML = formatted;
          } else if (cmd.name === 'trigger-text-translation') {
            const formatted = formatShortcut(cmd.shortcut, dict.shortcutNotSet, 'Alt + Shift + D');
            const el = document.getElementById('shortcutTextValue');
            if (el) el.innerHTML = formatted;

            const elGuide = document.getElementById('guideShortcutText');
            if (elGuide) elGuide.innerHTML = formatted;
          } else if (cmd.name === 'open-history') {
            const formatted = formatShortcut(cmd.shortcut, dict.shortcutNotSet, 'Alt + Shift + H');
            const el = document.getElementById('shortcutHistoryValue');
            if (el) el.innerHTML = formatted;
          }
        });
      });
    }
  }

  function formatShortcut(shortcutStr, notSetText, defaultHint) {
    if (!shortcutStr) {
      return `<span style="color: #c5221f; font-weight: 500;">${notSetText}</span> <span style="color: #9aa0a6; font-style: italic; font-size: 12.5px; margin-left: 6px;">(Default: ${defaultHint})</span>`;
    }
    return shortcutStr.split('+').map(key => `<kbd>${key.trim()}</kbd>`).join(' + ');
  }

  // Load configuration
  chrome.storage.local.get(['apiKeys', 'apiKey1', 'apiKey2', 'targetLang', 'uiLang', 'theme'], (result) => {
    let apiKeys = result.apiKeys || [];
    
    // Migrate old keys to new array format if empty
    if (apiKeys.length === 0) {
      if (result.apiKey1) apiKeys.push(result.apiKey1);
      if (result.apiKey2) apiKeys.push(result.apiKey2);
    }

    loadedApiKeys = [...apiKeys];
    loadedTargetLang = result.targetLang || 'Vietnamese';

    // Render loaded API key inputs
    if (apiKeys.length > 0) {
      apiKeys.forEach((key) => {
        addApiKeyRow(key);
      });
    } else {
      addApiKeyRow('');
    }

    // Set Theme select and UI state
    const themeSetting = result.theme || 'dark';
    selTheme.value = themeSetting;
    if (themeSetting === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }

    // UI Language setup
    const langSetting = result.uiLang || 'en';
    applyUiLocalization(langSetting);
    updateUiLangHeaderButton(langSetting);

    if (result.targetLang) {
      targetDropdown.setValue(result.targetLang);
    } else {
      targetDropdown.setValue('Vietnamese');
    }

    // Reset dirtiness on load
    isDirty = false;
    if (saveStatusRow) {
      saveStatusRow.classList.remove('visible');
    }
  });

  // Listen for storage changes from background or other tabs
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      if (changes.theme) {
        const t = changes.theme.newValue || 'dark';
        selTheme.value = t;
        if (t === 'light') {
          document.documentElement.classList.add('light-mode');
        } else {
          document.documentElement.classList.remove('light-mode');
        }
        localStorage.setItem('theme', t);
      }
      if (changes.uiLang) {
        const l = changes.uiLang.newValue || 'en';
        applyUiLocalization(l);
        updateUiLangHeaderButton(l);
        targetDropdown.updateLabel();
      }
    }
  });

  // Helper to add API Key input row with premium UI structure
  function addApiKeyRow(keyValue = '') {
    const rowCount = apiKeysContainer.querySelectorAll('.api-key-row').length;
    const rowIndex = rowCount + 1;

    const row = document.createElement('div');
    row.className = 'api-key-row';

    const label = document.createElement('div');
    label.className = 'api-key-label';
    label.textContent = `API Key ${rowIndex}`;
    row.appendChild(label);

    const inputContainer = document.createElement('div');
    inputContainer.className = 'api-key-input-container';

    const input = document.createElement('input');
    input.type = 'password';
    input.className = 'api-key-input';
    input.value = keyValue;
    input.placeholder = `API Key ${rowIndex}...`;
    input.addEventListener('input', checkIfDirty);
    inputContainer.appendChild(input);

    const dict = OPTIONS_LOCALIZATION[currentUiLang] || OPTIONS_LOCALIZATION.vi;
    const btnToggle = document.createElement('button');
    btnToggle.type = 'button';
    btnToggle.className = 'btn-toggle-show';
    btnToggle.textContent = dict.btnShowKey;
    btnToggle.addEventListener('click', () => {
      const localDict = OPTIONS_LOCALIZATION[currentUiLang] || OPTIONS_LOCALIZATION.vi;
      if (input.type === 'password') {
        input.type = 'text';
        btnToggle.textContent = localDict.btnHideKey;
      } else {
        input.type = 'password';
        btnToggle.textContent = localDict.btnShowKey;
      }
    });
    inputContainer.appendChild(btnToggle);
    row.appendChild(inputContainer);

    const btnDelete = document.createElement('button');
    btnDelete.type = 'button';
    btnDelete.className = 'btn-delete-row';
    btnDelete.innerHTML = '&times;';
    btnDelete.title = 'Xóa';
    btnDelete.addEventListener('click', () => {
      row.remove();
      checkIfDirty();
      reindexLabels();
    });
    row.appendChild(btnDelete);

    apiKeysContainer.appendChild(row);
  }

  // Helper to re-index labels after deleting rows
  function reindexLabels() {
    const rows = apiKeysContainer.querySelectorAll('.api-key-row');
    rows.forEach((row, index) => {
      const label = row.querySelector('.api-key-label');
      label.textContent = `API Key ${index + 1}`;
      const input = row.querySelector('.api-key-input');
      const dict = OPTIONS_LOCALIZATION[currentUiLang] || OPTIONS_LOCALIZATION.vi;
      input.placeholder = `API Key ${index + 1}...`;
      const btnToggle = row.querySelector('.btn-toggle-show');
      if (btnToggle) {
        btnToggle.textContent = input.type === 'password' ? dict.btnShowKey : dict.btnHideKey;
      }
    });
  }

  // Bind Add Key button
  btnAddApiKey.addEventListener('click', () => {
    addApiKeyRow('');
    checkIfDirty();
  });

  // Bind Save button
  btnSave.addEventListener('click', () => {
    const inputs = apiKeysContainer.querySelectorAll('.api-key-input');
    const keys = [];
    inputs.forEach(input => {
      const val = input.value.trim();
      if (val) {
        keys.push(val);
      }
    });

    const dict = OPTIONS_LOCALIZATION[currentUiLang] || OPTIONS_LOCALIZATION.vi;
    const targetLang = targetDropdown.getValue();

    chrome.storage.local.set({
      apiKeys: keys,
      targetLang: targetLang
    }, () => {
      loadedApiKeys = [...keys];
      loadedTargetLang = targetLang;
      isDirty = false; // reset dirtiness
      showSaveStatus(dict.statusSaved);
    });
  });

  // Bind Change Shortcuts button
  btnChangeShortcuts.addEventListener('click', () => {
    chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
  });

  // Collapsible User Guide toggle
  const secGuideHeader = document.getElementById('secGuide');
  const guideContent = document.getElementById('guideContent');
  if (secGuideHeader && guideContent) {
    secGuideHeader.addEventListener('click', () => {
      secGuideHeader.classList.toggle('active');
      guideContent.classList.toggle('collapsed');
    });

    // Handle chrome:// links click via event delegation
    guideContent.addEventListener('click', (e) => {
      const target = e.target.closest('.chrome-link');
      if (target) {
        e.preventDefault();
        chrome.tabs.create({ url: 'chrome://extensions/shortcuts' });
      }
    });
  }

  function showSaveStatus(text, isError = false) {
    saveStatus.textContent = text;
    saveStatus.style.color = isError ? '#c5221f' : '#0f9d58';
    saveStatus.classList.add('visible');
    setTimeout(() => {
      saveStatus.classList.remove('visible');
      setTimeout(() => {
        if (!saveStatus.classList.contains('visible')) {
          saveStatus.textContent = '';
        }
      }, 250);
      if (!isDirty && !isError && saveStatusRow) {
        saveStatusRow.classList.remove('visible');
      }
    }, 2500);
  }

  // Reusable Searchable Dropdown component controller
  function initSearchableDropdown(inputEl, listEl, getItemsFn, onChange) {
    let selectedValue = '';
    let activeLabel = '';

    function renderList(filterText = '') {
      listEl.innerHTML = '';
      const itemsList = getItemsFn();
      const filtered = itemsList.filter(item => {
        const labelClean = removeAccents(item.label);
        const valClean = removeAccents(item.value);
        const filterClean = removeAccents(filterText);
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

      filtered.forEach(item => {
        const row = document.createElement('div');
        row.className = 'dropdown-item';
        row.textContent = item.label;
        row.setAttribute('data-value', item.value);
        row.addEventListener('click', (e) => {
          selectedValue = item.value;
          activeLabel = item.label;
          inputEl.value = activeLabel;
          listEl.style.display = 'none';
          onChange(selectedValue);
          e.stopPropagation();
        });
        listEl.appendChild(row);
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
