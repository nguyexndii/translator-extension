const LOCALIZATION = {
  vi: {
    title: 'Lịch sử dịch thuật',
    subtitle: 'Quản lý các bản dịch đã thực hiện',
    placeholderSearch: 'Tìm kiếm trong lịch sử...',
    optionAllLangs: 'Tất cả ngôn ngữ',
    badgeCount: 'bản dịch',
    btnBackToSettings: 'Cài đặt',
    btnClearAll: 'Xóa tất cả',
    btnLoadMore: 'Xem thêm',
    copyright: 'Screen Translator - Lịch sử dịch thuật lưu trữ tối đa 200 mục gần nhất.',
    emptyHistory: 'Chưa có lịch sử dịch thuật nào.',
    confirmClear: 'Bạn có chắc chắn muốn xóa toàn bộ lịch sử không?',
    copySuccess: 'Đã sao chép bản dịch!',
    copyOriginalSuccess: 'Đã sao chép văn bản gốc!',
    deleteTitle: 'Xóa mục này',
    copyTitle: 'Sao chép bản dịch',
    doubleClickCopyOriginal: 'Nhấn đúp chuột để sao chép văn bản gốc',
    doubleClickCopyTranslation: 'Nhấn đúp chuột để sao chép bản dịch'
  },
  en: {
    title: 'Translation History',
    subtitle: 'Manage your previous translations',
    placeholderSearch: 'Search in history...',
    optionAllLangs: 'All languages',
    badgeCount: 'translations',
    btnBackToSettings: 'Settings',
    btnClearAll: 'Clear All',
    btnLoadMore: 'Load More',
    copyright: 'Screen Translator - History stores up to 200 latest entries.',
    emptyHistory: 'No translation history yet.',
    confirmClear: 'Are you sure you want to clear all history?',
    copySuccess: 'Translation copied!',
    copyOriginalSuccess: 'Original text copied!',
    deleteTitle: 'Delete this item',
    copyTitle: 'Copy translation',
    doubleClickCopyOriginal: 'Double click to copy original',
    doubleClickCopyTranslation: 'Double click to copy translation'
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
  const historyCount = document.getElementById('historyCount');
  const btnClearAll = document.getElementById('btnClearAll');
  const historyList = document.getElementById('historyList');
  const btnLoadMore = document.getElementById('btnLoadMore');
  const btnBackToSettings = document.getElementById('btnBackToSettings');
  const txtPageTitle = document.getElementById('txtPageTitle');
  const txtTitle = document.getElementById('txtTitle');
  const txtSubtitle = document.getElementById('txtSubtitle');
  const txtFooterCopyright = document.getElementById('txtFooterCopyright');

  let currentUiLang = 'en';
  let historyData = [];
  let displayedCount = 20;
  const pageStep = 20;

  // Initialize theme
  chrome.storage.local.get(['theme', 'uiLang'], (result) => {
    // UI Language
    currentUiLang = result.uiLang || 'en';
    applyLocalization();

    // Theme Toggle
    if (result.theme === 'light') {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }

    loadHistory();
  });

  // Navigate to settings page
  btnBackToSettings.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('options.html') });
  });

  // Apply UI strings based on selected display language
  function applyLocalization() {
    const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.en;
    txtPageTitle.textContent = `${dict.title} - Screen Translator`;
    txtTitle.textContent = dict.title;
    txtSubtitle.textContent = dict.subtitle;
    searchBar.placeholder = dict.placeholderSearch;
    btnBackToSettings.textContent = dict.btnBackToSettings;
    btnClearAll.textContent = dict.btnClearAll;
    btnLoadMore.textContent = dict.btnLoadMore;
    txtFooterCopyright.textContent = dict.copyright;

    // Reset default filter options
    langFilter.options[0].textContent = dict.optionAllLangs;
  }

  // Load history from chrome storage
  function loadHistory() {
    chrome.storage.local.get(['translationHistory'], (result) => {
      historyData = result.translationHistory || [];
      populateFilterOptions();
      renderHistory();
    });
  }

  // Populate target language filter options
  function populateFilterOptions() {
    const currentFilter = langFilter.value;
    const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.en;
    langFilter.innerHTML = `<option value="all">${dict.optionAllLangs}</option>`;
    
    const targetLangs = [...new Set(historyData.map(item => item.targetLang).filter(Boolean))];
    targetLangs.sort().forEach(lang => {
      const option = document.createElement('option');
      option.value = lang;
      option.textContent = getFullLanguageName(lang, currentUiLang);
      langFilter.appendChild(option);
    });

    // Restore previous selection if still available
    if ([...langFilter.options].some(opt => opt.value === currentFilter)) {
      langFilter.value = currentFilter;
    }
  }

  // Render items to DOM with filtering and search
  function renderHistory() {
    const searchQuery = removeAccents(searchBar.value.trim());
    const filterLang = langFilter.value;
    const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.en;

    // Filter items
    const filteredItems = historyData.filter(item => {
      // 1. Language Filter
      if (filterLang !== 'all' && item.targetLang !== filterLang) {
        return false;
      }
      // 2. Search Query
      if (searchQuery) {
        const origClean = removeAccents(item.original);
        const transClean = removeAccents(item.translated);
        if (!origClean.includes(searchQuery) && !transClean.includes(searchQuery)) {
          return false;
        }
      }
      return true;
    });

    // Update count badge
    historyCount.textContent = `${filteredItems.length} ${dict.badgeCount}`;

    historyList.innerHTML = '';

    if (filteredItems.length === 0) {
      historyList.innerHTML = `
        <div class="history-empty">
          <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="9" y1="15" x2="15" y2="15"></line>
            <line x1="9" y1="19" x2="15" y2="19"></line>
            <polyline points="9 11 10 11 11 11"></polyline>
          </svg>
          <p>${dict.emptyHistory}</p>
        </div>
      `;
      btnLoadMore.style.display = 'none';
      return;
    }

    // Paginate visible entries to avoid lag
    const visibleItems = filteredItems.slice(0, displayedCount);

    visibleItems.forEach(item => {
      const itemEl = document.createElement('div');
      itemEl.className = 'history-item';
      
      const srcFull = getFullLanguageName(item.sourceLang, currentUiLang);
      const tgtFull = getFullLanguageName(item.targetLang, currentUiLang);
      const formattedTime = item.timestamp ? new Date(item.timestamp).toLocaleString(currentUiLang === 'vi' ? 'vi-VN' : 'en-US') : '';
      
      // Split original and translated text by lines
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

      itemEl.innerHTML = `
        <div class="history-item-header">
          <div class="history-item-meta">
            <span class="history-item-langs">${srcFull} ➔ ${tgtFull}</span>
            <span class="history-item-time">${formattedTime}</span>
          </div>
          <div class="history-item-actions">
            <!-- Copy Translated -->
            <button class="btn-item-action copy-translated-btn" title="${dict.copyTitle}">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            <!-- Delete -->
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

      // Copy Action
      itemEl.querySelector('.copy-translated-btn').addEventListener('click', () => {
        copyToClipboard(item.translated, dict.copySuccess);
      });

      // Delete Action
      itemEl.querySelector('.delete-btn').addEventListener('click', () => {
        deleteItem(item.id);
      });

      // Double Click copy listeners
      itemEl.querySelector('.history-original').addEventListener('dblclick', () => {
        copyToClipboard(item.original, dict.copyOriginalSuccess);
      });

      itemEl.querySelector('.history-translated').addEventListener('dblclick', () => {
        copyToClipboard(item.translated, dict.copySuccess);
      });

      // Hover Highlight Logic
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

    // Show/Hide load more button
    if (filteredItems.length > displayedCount) {
      btnLoadMore.style.display = 'block';
    } else {
      btnLoadMore.style.display = 'none';
    }
  }

  // Copy to clipboard helper
  function copyToClipboard(text, successMsg) {
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

  // Delete individual item
  function deleteItem(id) {
    const updatedHistory = historyData.filter(item => item.id !== id);
    chrome.storage.local.set({ translationHistory: updatedHistory }, () => {
      loadHistory();
    });
  }

  // Clear all history
  btnClearAll.addEventListener('click', () => {
    const dict = LOCALIZATION[currentUiLang] || LOCALIZATION.en;
    if (confirm(dict.confirmClear)) {
      chrome.storage.local.set({ translationHistory: [] }, () => {
        loadHistory();
      });
    }
  });

  // Load more pagination click handler
  btnLoadMore.addEventListener('click', () => {
    displayedCount += pageStep;
    renderHistory();
  });

  // Filters listeners
  searchBar.addEventListener('input', () => {
    displayedCount = pageStep; // Reset display limit
    renderHistory();
  });

  langFilter.addEventListener('change', () => {
    displayedCount = pageStep; // Reset display limit
    renderHistory();
  });

  // Listen for background changes (live sync)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'local') {
      if (changes.translationHistory) {
        historyData = changes.translationHistory.newValue || [];
        populateFilterOptions();
        renderHistory();
      }
      if (changes.theme) {
        if (changes.theme.newValue === 'light') {
          document.documentElement.classList.add('light-mode');
        } else {
          document.documentElement.classList.remove('light-mode');
        }
        localStorage.setItem('theme', changes.theme.newValue || 'dark');
      }
      if (changes.uiLang) {
        currentUiLang = changes.uiLang.newValue || 'en';
        applyLocalization();
        populateFilterOptions();
        renderHistory();
      }
    }
  });

  // Global selection change listener for aligned highlights
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    
    // Clear all segment-selected classes first
    document.querySelectorAll('.history-line-segment.segment-selected').forEach(seg => {
      seg.classList.remove('segment-selected');
    });

    if (!selection || selection.isCollapsed) return;

    // Find parent history-item container
    let anchorNode = selection.anchorNode;
    let itemEl = null;
    while (anchorNode) {
      if (anchorNode.classList && anchorNode.classList.contains('history-item')) {
        itemEl = anchorNode;
        break;
      }
      anchorNode = anchorNode.parentNode;
    }

    if (!itemEl) return;

    try {
      const origDiv = itemEl.querySelector('.history-original');
      const transDiv = itemEl.querySelector('.history-translated');
      const segments = itemEl.querySelectorAll('.history-line-segment');
      
      segments.forEach(seg => {
        if (selection.intersectsNode(seg)) {
          const index = seg.getAttribute('data-index');
          const origSeg = origDiv.querySelector(`.history-line-segment[data-index="${index}"]`);
          const transSeg = transDiv.querySelector(`.history-line-segment[data-index="${index}"]`);
          if (origSeg) origSeg.classList.add('segment-selected');
          if (transSeg) transSeg.classList.add('segment-selected');
        }
      });
    } catch (err) {
      console.error('Error resolving selected segments:', err);
    }
  });
});
