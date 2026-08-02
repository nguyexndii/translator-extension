const LOCALIZATION = {
  vi: {
    titleTranslate: 'Lịch sử Dịch thuật',
    titleQr: 'Lịch sử Quét & Tạo Mã QR',
    subtitleTranslate: 'Quản lý các bản dịch đã thực hiện',
    subtitleQr: 'Quản lý các mã QR đã quét hoặc tạo',
    placeholderSearchTranslate: 'Tìm kiếm trong lịch sử dịch...',
    placeholderSearchQr: 'Tìm kiếm trong lịch sử QR...',
    optionAllLangs: 'Tất cả ngôn ngữ',
    badgeCountTranslate: 'bản dịch',
    badgeCountQr: 'mã QR',
    btnBackToSettings: 'Cài đặt',
    btnClearAll: 'Xóa tất cả',
    btnLoadMore: 'Xem thêm',
    copyright: 'Screen Translator - Lịch sử lưu trữ không giới hạn.',
    emptyTranslateHistory: 'Chưa có lịch sử dịch thuật nào.',
    emptyQrHistory: 'Chưa có lịch sử mã QR nào.',
    confirmClearTranslate: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử dịch thuật không?',
    confirmClearQr: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử mã QR không?',
    copySuccess: 'Đã sao chép nội dung!',
    copyOriginalSuccess: 'Đã sao chép văn bản gốc!',
    deleteTitle: 'Xóa mục này',
    copyTitle: 'Sao chép',
    btnCopy: 'Sao chép',
    btnOpenLink: 'Mở liên kết',
    qrTypeScan: 'Quét mã QR',
    qrTypeGenerate: 'Tạo mã QR',
    tabTranslate: 'Lịch sử Dịch',
    tabQr: 'Lịch sử QR',
    doubleClickCopyOriginal: 'Nhấn đúp chuột để sao chép văn bản gốc',
    doubleClickCopyTranslation: 'Nhấn đúp chuột để sao chép bản dịch',
    modalTitle: 'Xác nhận xóa',
    modalTextTranslate: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử dịch thuật không? Thao tác này không thể hoàn tác.',
    modalTextQr: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử mã QR không? Thao tác này không thể hoàn tác.',
    btnModalCancel: 'Hủy',
    btnModalConfirm: 'Xóa tất cả'
  },
  en: {
    titleTranslate: 'Translation History',
    titleQr: 'QR Code History',
    subtitleTranslate: 'Manage your previous translations',
    subtitleQr: 'Manage scanned or generated QR codes',
    placeholderSearchTranslate: 'Search translation history...',
    placeholderSearchQr: 'Search QR code history...',
    optionAllLangs: 'All languages',
    badgeCountTranslate: 'translations',
    badgeCountQr: 'QR codes',
    btnBackToSettings: 'Settings',
    btnClearAll: 'Clear All',
    btnLoadMore: 'Load More',
    copyright: 'Screen Translator - Unlimited history storage.',
    emptyTranslateHistory: 'No translation history yet.',
    emptyQrHistory: 'No QR code history yet.',
    confirmClearTranslate: 'Are you sure you want to clear all translation history?',
    confirmClearQr: 'Are you sure you want to clear all QR history?',
    copySuccess: 'Content copied!',
    copyOriginalSuccess: 'Original text copied!',
    deleteTitle: 'Delete this item',
    copyTitle: 'Copy',
    btnCopy: 'Copy',
    btnOpenLink: 'Open link',
    qrTypeScan: 'Scanned QR',
    qrTypeGenerate: 'Generated QR',
    tabTranslate: 'Translation',
    tabQr: 'QR Code',
    doubleClickCopyOriginal: 'Double click to copy original',
    doubleClickCopyTranslation: 'Double click to copy translation',
    modalTitle: 'Confirm Delete',
    modalTextTranslate: 'Are you sure you want to clear all translation history? This action cannot be undone.',
    modalTextQr: 'Are you sure you want to clear all QR history? This action cannot be undone.',
    btnModalCancel: 'Cancel',
    btnModalConfirm: 'Clear All'
  }
};

const LANGUAGE_MAP = {
  'vietnamese': 'Tiếng Việt',
  'english': 'Tiếng Anh',
  'japanese': 'Tiếng Nhật',
  'chinese': 'Tiếng Trung',
  'korean': 'Tiếng Hàn',
  'french': 'Tiếng Pháp',
  'german': 'Tiếng Đức',
  'spanish': 'Tiếng Tây Ban Nha',
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

function getFullLanguageName(langName, uiLang) {
  if (!langName) return uiLang === 'vi' ? 'Tự động' : 'Auto';
  const cleanName = langName.trim().toLowerCase();
  if (uiLang === 'vi') {
    return LANGUAGE_MAP[cleanName] || langName.charAt(0).toUpperCase() + langName.slice(1);
  }
  return langName.charAt(0).toUpperCase() + langName.slice(1);
}

function removeAccents(str) {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

document.addEventListener('DOMContentLoaded', () => {
  const searchBar = document.getElementById('searchBar');
  const langFilter = document.getElementById('langFilter');
  const filterDropdownContainer = document.getElementById('filterDropdownContainer');
  const historyCount = document.getElementById('historyCount');
  const btnClearAll = document.getElementById('btnClearAll');
  const historyList = document.getElementById('historyList');
  const btnBackToSettings = document.getElementById('btnBackToSettings');
  const txtPageTitle = document.getElementById('txtPageTitle');
  const txtTitle = document.getElementById('txtTitle');
  const txtSubtitle = document.getElementById('txtSubtitle');
  const txtFooterCopyright = document.getElementById('txtFooterCopyright');

  const tabTranslate = document.getElementById('tabTranslate');
  const tabQr = document.getElementById('tabQr');

  let currentUiLang = 'en';
  let activeTab = 'translate'; // 'translate' or 'qr'
  let translationHistoryData = [];
  let qrHistoryData = [];
  let currentFilteredItems = [];
  let currentlyRenderedIndex = 0;
  const batchSize = 25;
  let isInfiniteLoading = false;

  // Initialize theme and language
  chrome.storage.local.get(['theme', 'uiLang'], (result) => {
    currentUiLang = result.uiLang || 'en';
    applyLocalization();

    if (result.theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }

    loadHistory();
  });

  // Tab switching event listeners
  if (tabTranslate && tabQr) {
    tabTranslate.addEventListener('click', () => {
      if (activeTab === 'translate') return;
      activeTab = 'translate';
      tabTranslate.classList.add('active');
      tabQr.classList.remove('active');
      if (filterDropdownContainer) filterDropdownContainer.style.display = 'block';
      searchBar.value = '';
      applyLocalization();
      loadHistory();
    });

    tabQr.addEventListener('click', () => {
      if (activeTab === 'qr') return;
      activeTab = 'qr';
      tabQr.classList.add('active');
      tabTranslate.classList.remove('active');
      if (filterDropdownContainer) filterDropdownContainer.style.display = 'none';
      searchBar.value = '';
      applyLocalization();
      loadHistory();
    });
  }

  // Navigate to settings page
  if (btnBackToSettings) {
    btnBackToSettings.addEventListener('click', () => {
      chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
    });
  }

  // Apply UI strings based on selected display language and active tab
  function applyLocalization() {
    const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.en;
    
    if (activeTab === 'translate') {
      txtPageTitle.textContent = `${dict.titleTranslate} - Screen Translator`;
      txtTitle.textContent = dict.titleTranslate;
      txtSubtitle.textContent = dict.subtitleTranslate;
      searchBar.placeholder = dict.placeholderSearchTranslate;
    } else {
      txtPageTitle.textContent = `${dict.titleQr} - Screen Translator`;
      txtTitle.textContent = dict.titleQr;
      txtSubtitle.textContent = dict.subtitleQr;
      searchBar.placeholder = dict.placeholderSearchQr;
    }

    btnBackToSettings.textContent = dict.btnBackToSettings;
    
    const txtBtnClearAllEl = document.getElementById('txtBtnClearAll');
    if (txtBtnClearAllEl) txtBtnClearAllEl.textContent = dict.btnClearAll;
    
    txtFooterCopyright.textContent = dict.copyright;

    const txtTabTranslateEl = document.getElementById('txtTabTranslate');
    const txtTabQrEl = document.getElementById('txtTabQr');
    if (txtTabTranslateEl) txtTabTranslateEl.textContent = dict.tabTranslate;
    if (txtTabQrEl) txtTabQrEl.textContent = dict.tabQr;

    const modalConfirmTitle = document.getElementById('modalConfirmTitle');
    const modalConfirmText = document.getElementById('modalConfirmText');
    const btnModalCancel = document.getElementById('btnModalCancel');
    const btnModalConfirm = document.getElementById('btnModalConfirm');

    if (modalConfirmTitle) modalConfirmTitle.textContent = dict.modalTitle;
    if (modalConfirmText) {
      modalConfirmText.textContent = activeTab === 'translate' ? dict.modalTextTranslate : dict.modalTextQr;
    }
    if (btnModalCancel) btnModalCancel.textContent = dict.btnModalCancel;
    if (btnModalConfirm) btnModalConfirm.textContent = dict.btnModalConfirm;

    if (langFilter && langFilter.options[0]) {
      langFilter.options[0].textContent = dict.optionAllLangs;
    }
  }

  // Load history from chrome storage
  function loadHistory() {
    chrome.storage.local.get(['translationHistory', 'qrHistory'], (result) => {
      translationHistoryData = result.translationHistory || [];
      qrHistoryData = result.qrHistory || [];

      if (activeTab === 'translate') {
        populateFilterOptions();
      }
      renderHistory();
    });
  }

  // Populate target language filter options (for translation tab)
  function populateFilterOptions() {
    const currentFilter = langFilter.value;
    const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.en;
    langFilter.innerHTML = `<option value="all">${dict.optionAllLangs}</option>`;
    
    const targetLangs = [...new Set(translationHistoryData.map(item => item.targetLang).filter(Boolean))];
    targetLangs.sort().forEach(lang => {
      const option = document.createElement('option');
      option.value = lang;
      option.textContent = getFullLanguageName(lang, currentUiLang);
      langFilter.appendChild(option);
    });

    if ([...langFilter.options].some(opt => opt.value === currentFilter)) {
      langFilter.value = currentFilter;
    }
  }

  // Render items to DOM with filtering and search
  function renderHistory() {
    const searchQuery = removeAccents(searchBar.value.trim());
    const filterLang = langFilter.value;
    const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.en;

    const sourceData = activeTab === 'translate' ? translationHistoryData : qrHistoryData;

    // Filter items
    currentFilteredItems = sourceData.filter(item => {
      if (activeTab === 'translate') {
        if (filterLang !== 'all' && item.targetLang !== filterLang) {
          return false;
        }
        if (searchQuery) {
          const origClean = removeAccents(item.original);
          const transClean = removeAccents(item.translated);
          if (!origClean.includes(searchQuery) && !transClean.includes(searchQuery)) {
            return false;
          }
        }
      } else {
        if (searchQuery) {
          const contentClean = removeAccents(item.content);
          if (!contentClean.includes(searchQuery)) {
            return false;
          }
        }
      }
      return true;
    });

    // Update count badge
    const badgeUnit = activeTab === 'translate' ? dict.badgeCountTranslate : dict.badgeCountQr;
    historyCount.textContent = `${currentFilteredItems.length} ${badgeUnit}`;

    historyList.innerHTML = '';
    currentlyRenderedIndex = 0;

    if (currentFilteredItems.length === 0) {
      const emptyText = activeTab === 'translate' ? dict.emptyTranslateHistory : dict.emptyQrHistory;
      historyList.innerHTML = `
        <div class="history-empty">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="9" y1="15" x2="15" y2="15"></line>
            <line x1="9" y1="19" x2="15" y2="19"></line>
            <polyline points="9 11 10 11 11 11"></polyline>
          </svg>
          <p>${emptyText}</p>
        </div>
      `;
      return;
    }

    appendNextBatch(false);
  }

  function appendNextBatch(isScrollEvent = false) {
    if (isInfiniteLoading || currentlyRenderedIndex >= currentFilteredItems.length) return;
    isInfiniteLoading = true;

    const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.en;
    const batch = currentFilteredItems.slice(currentlyRenderedIndex, currentlyRenderedIndex + batchSize);

    if (activeTab === 'translate') {
      batch.forEach((item, staggerIndex) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'history-item';
        if (isScrollEvent) {
          itemEl.classList.add('infinite-item-enter');
          itemEl.style.animationDelay = `${staggerIndex * 25}ms`;
        }
        
        const srcFull = getFullLanguageName(item.sourceLang, currentUiLang);
        const tgtFull = getFullLanguageName(item.targetLang, currentUiLang);
        const formattedTime = item.timestamp ? new Date(item.timestamp).toLocaleString(currentUiLang === 'vi' ? 'vi-VN' : 'en-US') : '';
        
        const origLines = (item.original || '').split('\n');
        const transLines = (item.translated || '').split('\n');
        const maxLines = Math.max(origLines.length, transLines.length);
        
        let origHtml = '';
        let transHtml = '';
        
        for (let i = 0; i < maxLines; i++) {
          const origText = origLines[i] || '';
          const transText = transLines[i] || '';
          
          origHtml += `<div class="history-line-segment" data-index="${i}">${escapeHtml(origText) || '&nbsp;'}</div>`;
          transHtml += `<div class="history-line-segment" data-index="${i}">${escapeHtml(transText) || '&nbsp;'}</div>`;
        }

        const sourceBadgeHtml = item.detectedSource ? `<span class="history-item-badge" style="font-size:10.5px; background:rgba(138,180,248,0.15); color:#8ab4f8; padding:2px 6px; border-radius:4px; margin-left:6px; font-weight:500;">${escapeHtml(item.detectedSource)}</span>` : '';

        itemEl.innerHTML = `
          <div class="history-item-header">
            <div class="history-item-meta">
              <span class="history-item-langs">${srcFull} ➔ ${tgtFull}${sourceBadgeHtml}</span>
              <span class="history-item-time">${formattedTime}</span>
            </div>
            <div class="history-item-actions">
              <button class="btn-item-action copy-translated-btn" title="${dict.copyTitle}">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </button>
              <button class="btn-item-action delete-btn" title="${dict.deleteTitle}">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="history-item-body">
            <div class="history-original" title="${dict.doubleClickCopyOriginal}">${origHtml}</div>
            <div class="history-translated" title="${dict.doubleClickCopyTranslation}">${transHtml}</div>
          </div>
        `;

        itemEl.querySelector('.copy-translated-btn').addEventListener('click', () => {
          copyToClipboard(item.translated, dict.copySuccess);
        });

        itemEl.querySelector('.delete-btn').addEventListener('click', () => {
          deleteTranslationItem(item.id);
        });

        itemEl.querySelector('.history-original').addEventListener('dblclick', () => {
          copyToClipboard(item.original, dict.copyOriginalSuccess);
        });

        itemEl.querySelector('.history-translated').addEventListener('dblclick', () => {
          copyToClipboard(item.translated, dict.copySuccess);
        });

        const origDiv = itemEl.querySelector('.history-original');
        const transDiv = itemEl.querySelector('.history-translated');
        
        const setHighlight = (index, highlight) => {
          if (index === null || index === undefined) return;
          const origSeg = origDiv.querySelector(`.history-line-segment[data-index="${index}"]`);
          const transSeg = transDiv.querySelector(`.history-line-segment[data-index="${index}"]`);
          if (origSeg) {
            if (highlight) origSeg.classList.add('segment-highlight');
            else origSeg.classList.remove('segment-highlight');
          }
          if (transSeg) {
            if (highlight) transSeg.classList.add('segment-highlight');
            else transSeg.classList.remove('segment-highlight');
          }
        };

        itemEl.addEventListener('mouseover', (e) => {
          const segment = e.target.closest('.history-line-segment');
          if (segment) {
            const index = segment.getAttribute('data-index');
            setHighlight(index, true);
          }
        });
        
        itemEl.addEventListener('mouseout', (e) => {
          const segment = e.target.closest('.history-line-segment');
          if (segment) {
            const index = segment.getAttribute('data-index');
            setHighlight(index, false);
          }
        });

        historyList.appendChild(itemEl);
      });

    } else {
      // QR Code History Card Rendering
      batch.forEach((item, staggerIndex) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'qr-item';
        if (isScrollEvent) {
          itemEl.classList.add('infinite-item-enter');
          itemEl.style.animationDelay = `${staggerIndex * 25}ms`;
        }

        const isScan = item.type === 'scan';
        const badgeText = isScan ? dict.qrTypeScan : dict.qrTypeGenerate;
        const formattedTime = item.timestamp ? new Date(item.timestamp).toLocaleString(currentUiLang === 'vi' ? 'vi-VN' : 'en-US') : '';
        const isUrl = /^https?:\/\//i.test((item.content || '').trim());

        itemEl.innerHTML = `
          <div class="qr-item-header">
            <span class="qr-type-badge ${isScan ? 'scan' : 'generate'}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                ${isScan 
                  ? '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"></path>' 
                  : '<rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect>'}
              </svg>
              ${badgeText}
            </span>
            <span class="qr-item-time">${formattedTime}</span>
          </div>
          <div class="qr-item-body">${escapeHtml(item.content)}</div>
          <div class="qr-item-actions">
            ${isUrl ? `
              <button class="btn-qr-action open-url-btn">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                <span>${dict.btnOpenLink}</span>
              </button>
            ` : ''}
            <button class="btn-qr-action copy-qr-btn">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
              <span>${dict.btnCopy}</span>
            </button>
            <button class="btn-item-action delete-qr-btn" title="${dict.deleteTitle}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        `;

        if (isUrl) {
          itemEl.querySelector('.open-url-btn').addEventListener('click', () => {
            window.open(item.content, '_blank');
          });
        }

        itemEl.querySelector('.copy-qr-btn').addEventListener('click', () => {
          copyToClipboard(item.content, dict.copySuccess);
        });

        itemEl.querySelector('.delete-qr-btn').addEventListener('click', () => {
          deleteQrItem(item.id);
        });

        historyList.appendChild(itemEl);
      });
    }

    currentlyRenderedIndex += batch.length;
    isInfiniteLoading = false;
  }

  // Setup IntersectionObserver for smooth 60 FPS Infinite Scroll
  const sentinel = document.getElementById('infiniteScrollSentinel');
  if (sentinel && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (currentlyRenderedIndex < currentFilteredItems.length) {
            appendNextBatch(true);
          }
        }
      });
    }, {
      root: null,
      rootMargin: '350px 0px',
      threshold: 0
    });
    observer.observe(sentinel);
  }

  // Fallback scroll listener
  window.addEventListener('scroll', () => {
    if (currentlyRenderedIndex >= currentFilteredItems.length || isInfiniteLoading) return;
    const scrollPosition = window.innerHeight + window.scrollY;
    const threshold = document.documentElement.offsetHeight - 450;
    if (scrollPosition >= threshold) {
      appendNextBatch(true);
    }
  });

  // Filter input listeners
  searchBar.addEventListener('input', () => {
    renderHistory();
  });

  if (langFilter) {
    langFilter.addEventListener('change', () => {
      renderHistory();
    });
  }

  // Clipboard Helper
  function copyToClipboard(text, successMsg) {
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
    });
  }

  // Toast controller
  function showToast(message) {
    let toast = document.querySelector('.toast-msg');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2000);
  }

  // Delete individual translation item
  function deleteTranslationItem(id) {
    const updatedHistory = translationHistoryData.filter(item => item.id !== id);
    chrome.storage.local.set({ translationHistory: updatedHistory }, () => {
      loadHistory();
    });
  }

  // Delete individual QR item
  function deleteQrItem(id) {
    const updatedHistory = qrHistoryData.filter(item => item.id !== id);
    chrome.storage.local.set({ qrHistory: updatedHistory }, () => {
      loadHistory();
    });
  }

  // Clear all modal handlers
  const clearConfirmModal = document.getElementById('clearConfirmModal');
  const btnModalCancel = document.getElementById('btnModalCancel');
  const btnModalConfirm = document.getElementById('btnModalConfirm');

  if (btnClearAll) {
    btnClearAll.addEventListener('click', () => {
      if (clearConfirmModal) clearConfirmModal.style.display = 'flex';
    });
  }

  if (btnModalCancel) {
    btnModalCancel.addEventListener('click', () => {
      if (clearConfirmModal) clearConfirmModal.style.display = 'none';
    });
  }

  if (btnModalConfirm) {
    btnModalConfirm.addEventListener('click', () => {
      if (clearConfirmModal) clearConfirmModal.style.display = 'none';
      if (activeTab === 'translate') {
        chrome.storage.local.set({ translationHistory: [] }, () => {
          loadHistory();
        });
      } else {
        chrome.storage.local.set({ qrHistory: [] }, () => {
          loadHistory();
        });
      }
    });
  }

  if (clearConfirmModal) {
    clearConfirmModal.addEventListener('click', (e) => {
      if (e.target === clearConfirmModal) {
        clearConfirmModal.style.display = 'none';
      }
    });
  }
});
