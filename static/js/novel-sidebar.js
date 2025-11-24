function setupNovelSidebar() {
    // Get sidebar elements
    const sidebarSaveBtn = document.getElementById('sidebar-save-btn');
    const sidebarExportBtn = document.getElementById('sidebar-export-btn');
    const sidebarAnalyzeBtn = document.getElementById('sidebar-analyze-btn');
    const sidebarGenerateBtn = document.getElementById('sidebar-generate-btn');
    const sidebarContinueBtn = document.getElementById('sidebar-continue-btn');
    const sidebarRewriteBtn = document.getElementById('sidebar-rewrite-btn');
    const sidebarInspirationBtn = document.getElementById('sidebar-inspiration-btn');
    const exportDropdown = document.querySelector('.export-dropdown');
    const exportOptions = document.querySelectorAll('.export-option');
    const currentNovelTitle = document.getElementById('current-novel-title');
    const sidebarWordCount = document.getElementById('sidebar-word-count');

    // Update sidebar with novel info when a novel is loaded
    function updateNovelSidebarInfo(title, wordCount) {
        currentNovelTitle.textContent = title || '未选择小说';
        sidebarWordCount.textContent = wordCount || '0';
    }

    // Toggle export dropdown
    sidebarExportBtn.addEventListener('click', () => {
        exportDropdown.classList.toggle('hidden');
    });

    // Handle export format selection
    exportOptions.forEach(option => {
        option.addEventListener('click', (event) => {
            const format = event.currentTarget.dataset.format;
            if (currentNovelId) {
                exportNovel(format);
            } else {
                alert('请先选择或创建一个小说');
            }
            exportDropdown.classList.add('hidden');
        });
    });

    // Attach event listeners to sidebar buttons
    sidebarSaveBtn.addEventListener('click', () => {
        if (currentNovelId) {
            saveNovelContent();
        } else {
            alert('请先选择或创建一个小说');
        }
    });

    sidebarAnalyzeBtn.addEventListener('click', () => {
        if (currentNovelId) {
            analyzeAndSplitNovel();
        } else {
            alert('请先选择或创建一个小说');
        }
    });

    sidebarGenerateBtn.addEventListener('click', () => {
        if (currentNovelId) {
            generateText(false);
        } else {
            alert('请先选择或创建一个小说');
        }
    });

    sidebarContinueBtn.addEventListener('click', () => {
        if (currentNovelId) {
            generateText(true);
        } else {
            alert('请先选择或创建一个小说');
        }
    });

    sidebarRewriteBtn.addEventListener('click', () => {
        if (currentNovelId) {
            rewriteNovelContent();
        } else {
            alert('请先选择或创建一个小说');
        }
    });

    sidebarInspirationBtn.addEventListener('click', () => {
        if (currentNovelId) {
            document.getElementById('inspiration-btn').click();
        } else {
            alert('请先选择或创建一个小说');
        }
    });

    // Override the updateWordCount function to update both displays
    const originalUpdateWordCount = updateWordCount;
    updateWordCount = function() {
        // Call the original function first
        originalUpdateWordCount();
        
        // Then update the sidebar word count
        if (novelContent) {
            const text = novelContent.value || '';
            const count = text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
            sidebarWordCount.textContent = count;
        }
    };

    // Override the loadNovel function to update the sidebar
    const originalLoadNovel = loadNovel;
    loadNovel = async function(novelId) {
        await originalLoadNovel(novelId);
        
        // After loading the novel, update the sidebar
        if (currentNovelId) {
            updateNovelSidebarInfo(writingNovelTitle.textContent, document.getElementById('word-count-display').textContent.replace('字数: ', ''));
        }
    };

    // Initialize the sidebar with current novel info if any
    if (currentNovelId) {
        updateNovelSidebarInfo(writingNovelTitle.textContent, document.getElementById('word-count-display').textContent.replace('字数: ', ''));
    }
} 