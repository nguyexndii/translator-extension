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
    lblTheme: 'Chế độ giao diện:',
    secShortcut: 'Phím tắt dịch thuật',
    descShortcut: 'Danh sách phím tắt mặc định dùng để kích hoạt các chế độ dịch:',
    lblShortcutPopup: 'Mở cửa sổ dịch nhanh (Popup):',
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
    lblShortcutQr: 'Chụp quét mã QR trên màn hình:',
    secBackup: 'Sao lưu & Khôi phục dữ liệu',
    descBackup: 'Xuất tệp sao lưu dữ liệu lịch sử dịch và lịch sử mã QR để cất giữ hoặc chuyển sang máy tính khác.',
    lblBtnExportBackup: 'Xuất tệp sao lưu (.json)',
    lblBtnImportBackup: 'Nhập tệp khôi phục (.json)',
    statusExportSuccess: 'Đã xuất tệp sao lưu lịch sử thành công!',
    statusImportSuccess: 'Đã khôi phục lịch sử thành công!',
    statusImportError: 'Tệp sao lưu không hợp lệ hoặc bị lỗi!',
    footerCopyright: 'Phát triển cho mục đích dịch trực tiếp màn hình.',
    guideHtml: `
      <div class="guide-item">
        <div class="guide-step">1. Dịch vùng màn hình (Chụp ảnh dịch)</div>
        <p class="guide-text">Nhấn tổ hợp phím <span id="guideShortcutCrop"><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd></span> hoặc nhấp nút tương ứng trong Popup, sau đó giữ và kéo chuột để khoanh vùng văn bản cần dịch. Bản dịch sẽ hiển thị đè trực tiếp lên chữ gốc. Khi di chuột vào ô dịch, phần nền và văn bản dịch sẽ mờ đi để bạn dễ dàng đối chiếu với nội dung gốc phía dưới.</p>
      </div>
      <div class="guide-item">
        <div class="guide-step">2. Dịch văn bản bôi đen (Highlight)</div>
        <p class="guide-text">Bôi đen đoạn văn bản trên trang web rồi nhấn tổ hợp phím <span id="guideShortcutText"><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd></span>, nhấp chuột vào biểu tượng dịch nổi hoặc chọn lệnh dịch từ menu chuột phải. Khung chứa bản dịch sẽ xuất hiện ngay dưới vùng chọn. Để tối giản giao diện, thông tin chi tiết về ngôn ngữ dịch đã được lược bỏ.</p>
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
    lblShortcutPopup: 'Open quick translation popup:',
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
    lblShortcutQr: 'Capture and scan QR on screen:',
    secBackup: 'Backup & Restore Data',
    descBackup: 'Export backup files of translation history and QR history to store or transfer to another computer.',
    lblBtnExportBackup: 'Export Backup (.json)',
    lblBtnImportBackup: 'Import Backup (.json)',
    statusExportSuccess: 'History backup exported successfully!',
    statusImportSuccess: 'History restored successfully!',
    statusImportError: 'Invalid or corrupted backup file!',
    footerCopyright: 'Developed for screen translation.',
    guideHtml: `
      <div class="guide-item">
        <div class="guide-step">1. Screen Area Translation (OCR)</div>
        <p class="guide-text">Press <span id="guideShortcutCrop"><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>S</kbd></span> or click the translate button in the popup, then hold and drag your mouse to crop the text area. The translation will be overlaid right on top of the original text. Hovering over any translation box will fade out its background and text, allowing you to easily read the original content underneath.</p>
      </div>
      <div class="guide-item">
        <div class="guide-step">2. Highlighted Text Translation</div>
        <p class="guide-text">Highlight any text on the webpage and press <span id="guideShortcutText"><kbd>Alt</kbd> + <kbd>Shift</kbd> + <kbd>F</kbd></span>, click the floating translation icon, or select the translation option from the right-click context menu. The translation will appear immediately below the selection. Source and target language badges are hidden to keep the UI clean.</p>
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

  function applyUiLocalization(lang) {
    currentUiLang = lang;
    const dict = OPTIONS_LOCALIZATION[lang] || OPTIONS_LOCALIZATION.vi;

    // Fast, crisp & smooth transition on container
    const container = document.querySelector('.options-container') || document.body;
    container.classList.remove('lang-refresh-anim');
    void container.offsetWidth; // Force reflow
    container.classList.add('lang-refresh-anim');
    setTimeout(() => {
      container.classList.remove('lang-refresh-anim');
    }, 250);

    document.title = dict.title;
    const setElemText = (id, text) => {
      const el = document.getElementById(id);
      if (el && text !== undefined) el.textContent = text;
    };

    setElemText('txtTitle', dict.title);
    setElemText('txtSubtitle', dict.subtitle);
    setElemText('secApi', dict.secApi);
    setElemText('descApi', dict.descApi);
    if (btnAddApiKey) btnAddApiKey.textContent = dict.btnAddKey;
    setElemText('secLang', dict.secLang);
    setElemText('lblTargetLang', dict.lblTargetLang);
    setElemText('lblTheme', dict.lblTheme);
    setElemText('secShortcut', dict.secShortcut);
    setElemText('descShortcut', dict.descShortcut);
    setElemText('lblShortcutPopup', dict.lblShortcutPopup);
    setElemText('lblShortcutCrop', dict.lblShortcutCrop);
    setElemText('lblShortcutText', dict.lblShortcutText);
    setElemText('lblShortcutQr', dict.lblShortcutQr);
    setElemText('descBrowserShortcut', dict.descBrowserShortcut);

    // Backup & Restore section localization
    setElemText('secBackup', dict.secBackup);
    setElemText('descBackup', dict.descBackup);
    setElemText('lblBtnExportBackup', dict.lblBtnExportBackup);
    setElemText('lblBtnImportBackup', dict.lblBtnImportBackup);
    
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

    if (btnChangeShortcuts) btnChangeShortcuts.textContent = dict.btnChangeShortcut;
    if (btnSave) btnSave.textContent = dict.btnSave;

    setElemText('txtFooterCopyright', dict.footerCopyright);

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
          if (cmd.name === '_execute_action') {
            const formatted = cmd.shortcut 
              ? formatShortcut(cmd.shortcut, dict.shortcutNotSet, 'Alt + Shift + W')
              : formatShortcut('Alt + Shift + W', dict.shortcutNotSet, 'Alt + Shift + W');
            const el = document.getElementById('shortcutPopupValue');
            if (el) el.innerHTML = formatted;
          } else if (cmd.name === 'trigger-translation') {
            const formatted = formatShortcut(cmd.shortcut, dict.shortcutNotSet, 'Alt + Shift + S');
            const el = document.getElementById('shortcutCropValue');
            if (el) el.innerHTML = formatted;
            
            const elGuide = document.getElementById('guideShortcutCrop');
            if (elGuide) elGuide.innerHTML = formatted;
          } else if (cmd.name === 'trigger-text-translation') {
            const formatted = formatShortcut(cmd.shortcut, dict.shortcutNotSet, 'Alt + Shift + F');
            const el = document.getElementById('shortcutTextValue');
            if (el) el.innerHTML = formatted;

            const elGuide = document.getElementById('guideShortcutText');
            if (elGuide) elGuide.innerHTML = formatted;
          } else if (cmd.name === 'trigger-qr-translation') {
            const formatted = formatShortcut(cmd.shortcut, dict.shortcutNotSet, 'Alt + Shift + K');
            const el = document.getElementById('shortcutQrValue');
            if (el) el.innerHTML = formatted;
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
  chrome.storage.local.get(['apiKeys', 'apiKey1', 'apiKey2', 'targetLang', 'uiLang', 'theme', 'overlayFontSize'], (result) => {
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

    // Overlay font size
    const overlayFontSizeEl = document.getElementById('overlayFontSize');
    const overlayFontSizeValueEl = document.getElementById('overlayFontSizeValue');
    if (overlayFontSizeEl && overlayFontSizeValueEl) {
      const savedFontSize = result.overlayFontSize || 13;
      overlayFontSizeEl.value = savedFontSize;
      overlayFontSizeValueEl.textContent = savedFontSize + 'px';
      overlayFontSizeEl.addEventListener('input', (e) => {
        const v = e.target.value;
        overlayFontSizeValueEl.textContent = v + 'px';
        chrome.storage.local.set({ overlayFontSize: parseInt(v, 10) });
      });
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

    // Check query params to focus and highlight API key input
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('focusKey') === 'true') {
      setTimeout(() => {
        const firstInput = apiKeysContainer.querySelector('.api-key-input');
        if (firstInput) {
          firstInput.focus();
          firstInput.classList.add('api-key-input-highlight');
          setTimeout(() => {
            firstInput.classList.remove('api-key-input-highlight');
          }, 4500);
        }
      }, 300);
    }

    // Backup & Restore Handlers (Complete History & Settings)
    const btnExportBackup = document.getElementById('btnExportBackup');
    const btnImportBackup = document.getElementById('btnImportBackup');
    const importFileInput = document.getElementById('importFileInput');

    function showTopRightToast(title, message, isError = false) {
      let toast = document.getElementById('topRightToast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'topRightToast';
        toast.className = 'top-right-toast';
        document.body.appendChild(toast);
      }

      const iconSvg = isError
        ? '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>'
        : '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';

      toast.className = `top-right-toast ${isError ? 'error' : 'success'}`;
      toast.innerHTML = `
        <div class="top-right-toast-icon">${iconSvg}</div>
        <div class="top-right-toast-content">
          <div class="top-right-toast-title"></div>
          <div class="top-right-toast-msg"></div>
        </div>
      `;

      toast.querySelector('.top-right-toast-title').textContent = title;
      toast.querySelector('.top-right-toast-msg').textContent = message;

      void toast.offsetWidth;
      toast.classList.add('show');

      if (window.topRightToastTimeout) clearTimeout(window.topRightToastTimeout);
      window.topRightToastTimeout = setTimeout(() => {
        toast.classList.remove('show');
      }, 4000);
    }

    if (btnExportBackup) {
      btnExportBackup.addEventListener('click', () => {
        chrome.storage.local.get(['translationHistory', 'qrHistory', 'targetLang', 'uiLang', 'theme'], (allData) => {
          const dict = OPTIONS_LOCALIZATION[currentUiLang] || OPTIONS_LOCALIZATION.vi;
          const backupData = {
            app: 'Screen Translator',
            version: '1.0',
            exportDate: new Date().toISOString(),
            translationHistory: allData.translationHistory || [],
            qrHistory: allData.qrHistory || [],
            settings: {
              targetLang: allData.targetLang || 'Vietnamese',
              uiLang: allData.uiLang || 'en',
              theme: allData.theme || 'dark'
            }
          };

          const jsonStr = JSON.stringify(backupData, null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);

          const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
          const a = document.createElement('a');
          a.href = url;
          a.download = 'screen_translator_backup_' + dateStr + '.json';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          const title = currentUiLang === 'vi' ? 'Sao lưu dữ liệu' : 'Data Backup';
          showTopRightToast(title, dict.statusExportSuccess, false);
        });
      });
    }

    if (btnImportBackup && importFileInput) {
      btnImportBackup.addEventListener('click', () => {
        importFileInput.value = '';
        importFileInput.click();
      });

      importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const dict = OPTIONS_LOCALIZATION[currentUiLang] || OPTIONS_LOCALIZATION.vi;
        const reader = new FileReader();

        reader.onload = (event) => {
          try {
            const importedData = JSON.parse(event.target.result);
            if (!importedData) throw new Error('Invalid format');

            let importedTranslationHistory = null;
            let importedQrHistory = null;

            if (Array.isArray(importedData)) {
              importedTranslationHistory = importedData;
            } else {
              if (Array.isArray(importedData.translationHistory)) {
                importedTranslationHistory = importedData.translationHistory;
              } else if (Array.isArray(importedData.history)) {
                importedTranslationHistory = importedData.history;
              } else if (Array.isArray(importedData.translations)) {
                importedTranslationHistory = importedData.translations;
              }

              if (Array.isArray(importedData.qrHistory)) {
                importedQrHistory = importedData.qrHistory;
              }
            }

            if (!importedTranslationHistory && !importedQrHistory) {
              throw new Error('No valid history data found in file');
            }

            chrome.storage.local.get(['translationHistory', 'qrHistory'], (existingData) => {
              const keysToSave = {};

              if (importedTranslationHistory) {
                const existingList = existingData.translationHistory || [];
                const mergedMap = new Map();

                importedTranslationHistory.forEach(item => {
                  if (item && (item.original || item.translated)) {
                    const key = item.id || (item.timestamp + '_' + (item.original || ''));
                    mergedMap.set(key, item);
                  }
                });

                existingList.forEach(item => {
                  if (item && (item.original || item.translated)) {
                    const key = item.id || (item.timestamp + '_' + (item.original || ''));
                    if (!mergedMap.has(key)) {
                      mergedMap.set(key, item);
                    }
                  }
                });

                const mergedArray = Array.from(mergedMap.values());
                mergedArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                keysToSave.translationHistory = mergedArray;
              }

              if (importedQrHistory) {
                const existingQr = existingData.qrHistory || [];
                const mergedQrMap = new Map();

                importedQrHistory.forEach(item => {
                  if (item && item.content) {
                    const key = item.id || (item.timestamp + '_' + item.content);
                    mergedQrMap.set(key, item);
                  }
                });

                existingQr.forEach(item => {
                  if (item && item.content) {
                    const key = item.id || (item.timestamp + '_' + item.content);
                    if (!mergedQrMap.has(key)) {
                      mergedQrMap.set(key, item);
                    }
                  }
                });

                const mergedQrArray = Array.from(mergedQrMap.values());
                mergedQrArray.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                keysToSave.qrHistory = mergedQrArray;
              }

              if (importedData.settings) {
                if (importedData.settings.targetLang) keysToSave.targetLang = importedData.settings.targetLang;
                if (importedData.settings.theme) keysToSave.theme = importedData.settings.theme;
              }

              chrome.storage.local.set(keysToSave, () => {
                const totalCount = (importedTranslationHistory ? importedTranslationHistory.length : 0) + (importedQrHistory ? importedQrHistory.length : 0);
                const title = currentUiLang === 'vi' ? 'Khôi phục dữ liệu' : 'Data Restore';
                const successMsg = currentUiLang === 'vi' 
                  ? `Đã khôi phục thành công ${totalCount} mục lịch sử!` 
                  : `Successfully restored ${totalCount} history items!`;

                showTopRightToast(title, successMsg, false);
              });
            });

          } catch (err) {
            console.warn('Backup import error:', err);
            const title = currentUiLang === 'vi' ? 'Lỗi khôi phục' : 'Restore Error';
            const errorMsg = dict.statusImportError || (currentUiLang === 'vi' ? 'Tệp sao lưu không hợp lệ hoặc bị lỗi!' : 'Invalid or corrupted backup file!');
            showTopRightToast(title, errorMsg, true);
          }
        };

        reader.readAsText(file);
      });
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
    let highlightedIndex = -1;
    let currentFiltered = [];

    function updateHighlight() {
      const items = listEl.querySelectorAll('.dropdown-item');
      items.forEach((item, idx) => {
        if (idx === highlightedIndex) {
          item.classList.add('active');
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('active');
        }
      });
    }

    function selectItem(idx) {
      if (idx < 0 || idx >= currentFiltered.length) return;
      const item = currentFiltered[idx];
      selectedValue = item.value;
      activeLabel = item.label;
      inputEl.value = activeLabel;
      listEl.style.display = 'none';
      highlightedIndex = -1;
      inputEl.blur();
      onChange(selectedValue);
    }

    function renderList(filterText = '') {
      listEl.innerHTML = '';
      const itemsList = getItemsFn();
      const filterClean = removeAccents(filterText.trim());

      currentFiltered = itemsList.filter(item => {
        const labelClean = removeAccents(item.label || '');
        const valClean = removeAccents(item.value || '');
        const codeClean = removeAccents(item.code || '');
        return labelClean.includes(filterClean) || valClean.includes(filterClean) || (codeClean && codeClean.includes(filterClean));
      });

      if (currentFiltered.length === 0) {
        highlightedIndex = -1;
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'dropdown-item';
        emptyDiv.style.color = '#9aa0a6';
        emptyDiv.style.cursor = 'default';
        emptyDiv.textContent = currentUiLang === 'vi' ? 'Không tìm thấy' : 'No results found';
        listEl.appendChild(emptyDiv);
        return;
      }

      if (highlightedIndex < 0 || highlightedIndex >= currentFiltered.length) {
        highlightedIndex = 0;
      }

      currentFiltered.forEach((item, idx) => {
        const row = document.createElement('div');
        row.className = 'dropdown-item';
        if (idx === highlightedIndex) {
          row.classList.add('active');
        }
        row.textContent = item.label;
        row.setAttribute('data-value', item.value);

        row.addEventListener('mouseenter', () => {
          highlightedIndex = idx;
          updateHighlight();
        });

        row.addEventListener('click', (e) => {
          selectItem(idx);
          e.stopPropagation();
        });

        listEl.appendChild(row);
      });

      updateHighlight();
    }

    inputEl.addEventListener('focus', () => {
      inputEl.value = '';
      highlightedIndex = 0;
      renderList('');
      listEl.style.display = 'block';
    });

    inputEl.addEventListener('input', () => {
      highlightedIndex = 0;
      renderList(inputEl.value);
      listEl.style.display = 'block';
    });

    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (listEl.style.display === 'none') {
          listEl.style.display = 'block';
          renderList(inputEl.value);
          return;
        }
        if (currentFiltered.length === 0) return;
        if (highlightedIndex < 0) {
          highlightedIndex = 0;
        } else if (highlightedIndex >= currentFiltered.length - 1) {
          highlightedIndex = 0; // Wrap around to top
        } else {
          highlightedIndex++;
        }
        updateHighlight();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (listEl.style.display === 'none') {
          listEl.style.display = 'block';
          renderList(inputEl.value);
          return;
        }
        if (currentFiltered.length === 0) return;
        if (highlightedIndex <= 0) {
          highlightedIndex = currentFiltered.length - 1; // Wrap around to bottom
        } else {
          highlightedIndex--;
        }
        updateHighlight();
      } else if (e.key === 'Enter') {
        if (listEl.style.display === 'block') {
          e.preventDefault();
          e.stopPropagation();
          if (highlightedIndex >= 0 && highlightedIndex < currentFiltered.length) {
            selectItem(highlightedIndex);
          } else if (currentFiltered.length > 0) {
            selectItem(0);
          }
        }
      } else if (e.key === 'Escape') {
        if (listEl.style.display === 'block') {
          e.preventDefault();
          listEl.style.display = 'none';
          inputEl.value = activeLabel;
          inputEl.blur();
        }
      }
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
