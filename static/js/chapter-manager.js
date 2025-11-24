/**
 * Chapter Manager Module
 * Provides functionality for managing novel chapters in the right sidebar
 */

// Store current novel ID and chapters
let currentNovelId = localStorage.getItem('currentNovelId') || null;
let currentChapterId = null;
let chapters = [];
let novelContent = null;
let saveNovelBtn = null;
let isDragging = false;
let draggedItem = null;

// Notes/Memo functionality
let notesContent = null;
let notesEditor = null;

/**
 * Save notes to local storage
 * @param {string} novelId - The ID of the novel
 * @param {string} content - The notes content
 */
function saveNotes(novelId, content) {
    if (!novelId) return;
    localStorage.setItem(`novel_notes_${novelId}`, content);
}

/**
 * Load notes from local storage
 * @param {string} novelId - The ID of the novel
 * @returns {string} The notes content
 */
function loadNotes(novelId) {
    if (!novelId) return '';
    return localStorage.getItem(`novel_notes_${novelId}`) || '';
}

/**
 * Export notes to a file
 * @param {string} novelId - The ID of the novel
 */
async function exportNotes(novelId) {
    const content = loadNotes(novelId);
    if (!content) {
        alert('没有可导出的笔记内容');
        return;
    }

    try {
        const response = await fetch(`/api/novels/${novelId}/export-notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        if (!response.ok) {
            throw new Error(`导出笔记失败: ${response.statusText}`);
        }

        const result = await response.json();
        alert(result.message || '笔记已成功导出到exports文件夹');
    } catch (error) {
        console.error('Error exporting notes:', error);
        alert('导出笔记失败: ' + error.message);
    }
}

/**
 * Import notes from a file
 * @param {string} novelId - The ID of the novel
 */
function importNotes(novelId) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            saveNotes(novelId, content);
            if (notesEditor) {
                notesEditor.value = content;
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

/**
 * Initialize the chapter manager
 * This function should be called when the right sidebar is set up
 * @param {HTMLElement} sidebar - The right sidebar element
 */
export function initializeChapterManager(sidebar) {
    // Add chapter manager section to the right sidebar
    addChapterManagerSection(sidebar);
    
    // Get references to elements we'll need later
    novelContent = document.getElementById('novel-content');
    saveNovelBtn = document.getElementById('save-novel-btn');
    
    // Setup event listener for novel selection before checking localStorage
    // Listen for novel selection events
    document.addEventListener('novelSelected', (event) => {
        console.log('Novel selected event received:', event.detail);
        if (event.detail && event.detail.novelId) {
            currentNovelId = event.detail.novelId;
            localStorage.setItem('currentNovelId', currentNovelId);
            console.log('Chapter manager updated novel ID:', currentNovelId);
            currentChapterId = null;
            loadChapters(currentNovelId);
            
            // Load notes for the selected novel
            if (notesEditor) {
                notesEditor.value = loadNotes(currentNovelId);
            }
        }
    });
    
    // Check if there's an existing novel in the main script
    if (window.currentNovelId) {
        console.log('Found existing novel ID in window:', window.currentNovelId);
        currentNovelId = window.currentNovelId;
        loadChapters(currentNovelId);
        
        // Load notes for the existing novel
        if (notesEditor) {
            notesEditor.value = loadNotes(currentNovelId);
        }
    }
    // Otherwise check localStorage as fallback
    else {
        currentNovelId = localStorage.getItem('currentNovelId');
        console.log('Chapter manager initialized with novel ID from localStorage:', currentNovelId);
        
        if (currentNovelId) {
            // Verify the novel exists by calling the API
            fetch(`/api/novels/${currentNovelId}`)
                .then(response => {
                    if (response.ok) {
                        console.log('Verified novel exists:', currentNovelId);
                        loadChapters(currentNovelId);
                        
                        // Load notes for the verified novel
                        if (notesEditor) {
                            notesEditor.value = loadNotes(currentNovelId);
                        }
                    } else {
                        console.error('Novel ID in localStorage is invalid, removing:', currentNovelId);
                        localStorage.removeItem('currentNovelId');
                        currentNovelId = null;
                    }
                })
                .catch(error => {
                    console.error('Error verifying novel:', error);
                    localStorage.removeItem('currentNovelId');
                    currentNovelId = null;
                });
        }
    }
    
    // Listen for novel save event
    if (saveNovelBtn) {
        const originalClickHandler = saveNovelBtn.onclick;
        saveNovelBtn.onclick = async function(e) {
            // Call the original handler if it exists
            if (originalClickHandler) {
                originalClickHandler.call(this, e);
            }
            
            // If a chapter is selected, also update its content
            if (currentChapterId && novelContent) {
                console.log('Saving content to chapter:', currentChapterId);
                await saveCurrentContent();
            }
        };
    }
    
    // Intercept novel content changes to mark unsaved changes
    if (novelContent) {
        novelContent.addEventListener('input', () => {
            novelContent.dataset.hasChanges = 'true';
        });
    }
}

/**
 * Add the chapter manager section to the sidebar
 * @param {HTMLElement} sidebar - The right sidebar element
 */
function addChapterManagerSection(sidebar) {
    // Add notes section first
    const notesSection = document.createElement('div');
    notesSection.className = 'notes-manager';
    notesSection.id = 'notes-manager';
    
    // Create notes header
    const notesHeader = document.createElement('h3');
    const notesTitleSpan = document.createElement('span');
    notesTitleSpan.className = 'notes-manager-title';
    notesTitleSpan.innerHTML = '<i class="fas fa-sticky-note"></i> 笔记备忘';
    notesHeader.appendChild(notesTitleSpan);
    notesSection.appendChild(notesHeader);
    
    // Create notes buttons container
    const notesButtonsContainer = document.createElement('div');
    notesButtonsContainer.className = 'notes-manager-buttons';
    
    // Add export button
    const exportBtn = document.createElement('button');
    exportBtn.className = 'notes-btn export-notes-btn';
    exportBtn.innerHTML = `
      <span class="notes-btn-icon">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="exportGradient" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stop-color="#4f8cff"/>
              <stop offset="1" stop-color="#00e0c6"/>
            </linearGradient>
          </defs>
          <circle cx="11" cy="11" r="10" fill="url(#exportGradient)"/>
          <path d="M11 6v7m0 0l-3-3m3 3l3-3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="6" y="16" width="10" height="2" rx="1" fill="#fff"/>
        </svg>
      </span>`;
    exportBtn.title = '导出笔记';
    exportBtn.onclick = () => exportNotes(currentNovelId);
    notesButtonsContainer.appendChild(exportBtn);
    
    // Add import button
    const importBtn = document.createElement('button');
    importBtn.className = 'notes-btn import-notes-btn';
    importBtn.innerHTML = `
      <span class="notes-btn-icon">
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="importGradient" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse">
              <stop stop-color="#ff7b7b"/>
              <stop offset="1" stop-color="#ffb86c"/>
            </linearGradient>
          </defs>
          <circle cx="11" cy="11" r="10" fill="url(#importGradient)"/>
          <path d="M11 16V9m0 0l-3 3m3-3 3 3" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <rect x="6" y="4" width="10" height="2" rx="1" fill="#fff"/>
        </svg>
      </span>`;
    importBtn.title = '导入笔记';
    importBtn.onclick = () => importNotes(currentNovelId);
    notesButtonsContainer.appendChild(importBtn);
    
    notesSection.appendChild(notesButtonsContainer);
    
    // Add notes editor
    const notesEditorContainer = document.createElement('div');
    notesEditorContainer.className = 'notes-editor-container';
    
    notesEditor = document.createElement('textarea');
    notesEditor.className = 'notes-editor';
    notesEditor.placeholder = '在这里记录你的笔记和备忘...';
    notesEditor.value = loadNotes(currentNovelId);
    
    // Add auto-save functionality
    notesEditor.addEventListener('input', () => {
        saveNotes(currentNovelId, notesEditor.value);
    });
    
    notesEditorContainer.appendChild(notesEditor);
    notesSection.appendChild(notesEditorContainer);
    
    // Add the notes section after the editor toolbar
    const toolbarElement = sidebar.querySelector('.editor-toolbar');
    if (toolbarElement) {
        const toolbarSection = toolbarElement.closest('.right-sidebar-section');
        if (toolbarSection && toolbarSection.nextSibling) {
            sidebar.insertBefore(notesSection, toolbarSection.nextSibling);
        } else {
            sidebar.appendChild(notesSection);
        }
    } else {
        sidebar.appendChild(notesSection);
    }

    // Create chapter manager section
    const section = document.createElement('div');
    section.className = 'chapter-manager';
    section.id = 'chapter-manager';
    
    // Create header with title and help icon
    const header = document.createElement('h3');
    
    const titleSpan = document.createElement('span');
    titleSpan.className = 'chapter-manager-title';
    titleSpan.innerHTML = '<i class="fas fa-list-alt"></i> 章节管理';
    
    header.appendChild(titleSpan);
    section.appendChild(header);
    
    // Create buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = 'chapter-manager-buttons';
    
    // Add "New Chapter" button
    const newChapterBtn = document.createElement('button');
    newChapterBtn.className = 'chapter-btn new-chapter-btn';
    newChapterBtn.innerHTML = '<i class="fas fa-plus"></i> 新建章节';
    newChapterBtn.onclick = () => createNewChapter();
    buttonsContainer.appendChild(newChapterBtn);
    
    // Add "Sort Chapters" button
    const sortChaptersBtn = document.createElement('button');
    sortChaptersBtn.className = 'chapter-btn sort-chapters-btn';
    sortChaptersBtn.innerHTML = '<i class="fas fa-sort"></i> 排序章节';
    sortChaptersBtn.onclick = () => toggleSortMode();
    buttonsContainer.appendChild(sortChaptersBtn);
    
    section.appendChild(buttonsContainer);
    
    // Add chapters list container
    const chaptersListContainer = document.createElement('div');
    chaptersListContainer.id = 'chapters-list-container';
    
    // Add chapter list
    const chaptersList = document.createElement('ul');
    chaptersList.className = 'chapter-list';
    chaptersList.id = 'chapter-list';
    chaptersList.innerHTML = '<li class="chapter-list-empty">请先选择一部小说</li>';
    
    chaptersListContainer.appendChild(chaptersList);
    section.appendChild(chaptersListContainer);
    
    // Add the section after the notes section
    if (notesSection.nextSibling) {
        sidebar.insertBefore(section, notesSection.nextSibling);
    } else {
        sidebar.appendChild(section);
    }

    // 在章节管理section后插入自定义提示词按钮
    const promptTools = document.createElement('div');
    promptTools.className = 'prompt-tools';
    promptTools.innerHTML = '<button id="smart-prompt-btn" class="btn btn-prompt"><i class="fas fa-lightbulb"></i> 自定义提示词</button>';
    if (section.nextSibling) {
        sidebar.insertBefore(promptTools, section.nextSibling);
    } else {
        sidebar.appendChild(promptTools);
    }
    // 绑定点击事件，显示自定义提示词区域
    const smartPromptBtn = promptTools.querySelector('#smart-prompt-btn');
    if (smartPromptBtn) {
        smartPromptBtn.onclick = function() {
            // 隐藏所有view
            document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
            // 显示自定义提示词区域
            const promptGen = document.getElementById('prompt-generator-area');
            if (promptGen) promptGen.classList.remove('hidden');
        };
    }
}

/**
 * Load chapters for a specific novel
 * @param {string} novelId - The ID of the novel
 */
async function loadChapters(novelId) {
    if (!novelId) {
        console.error('Invalid novel ID for loading chapters');
        return;
    }
    
    console.log('Loading chapters for novel ID:', novelId);
    
    const chapterList = document.getElementById('chapter-list');
    if (!chapterList) return;
    
    chapterList.innerHTML = '<li class="chapter-list-empty">加载中...</li>';
    
    try {
        const response = await fetch(`/api/novels/${novelId}/chapters`);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to load chapters: ${response.status} ${response.statusText}`, errorText);
            throw new Error(`Failed to load chapters: ${response.statusText}`);
        }
        
        chapters = await response.json();
        console.log('Loaded chapters:', chapters);
        
        // Sort chapters by their order
        chapters.sort((a, b) => a.order - b.order);
        
        renderChapterList();
        
    } catch (error) {
        console.error('Error loading chapters:', error);
        chapterList.innerHTML = '<li class="chapter-list-empty">加载章节失败: ' + error.message + '</li>';
    }
}

/**
 * Render the chapter list based on the loaded chapters
 */
function renderChapterList() {
    const chapterList = document.getElementById('chapter-list');
    if (!chapterList) return;
    
    if (!chapters || chapters.length === 0) {
        chapterList.innerHTML = '<li class="chapter-list-empty">暂无章节</li>';
        return;
    }
    
    chapterList.innerHTML = '';
    
    chapters.forEach(chapter => {
        const chapterItem = document.createElement('li');
        chapterItem.className = 'chapter-item chapter-item-color-' + (chapters.indexOf(chapter) % 5); // Add class based on index for coloring
        chapterItem.dataset.id = chapter.id;
        if (chapter.id === currentChapterId) {
            chapterItem.classList.add('active');
        }
        
        // Make the chapter item draggable for sorting
        chapterItem.draggable = true;
        
        // Create title element
        const titleElement = document.createElement('div');
        titleElement.className = 'chapter-title';
        titleElement.textContent = chapter.title;
        chapterItem.appendChild(titleElement);
        
        // Create actions container
        const actionsElement = document.createElement('div');
        actionsElement.className = 'chapter-actions';
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'chapter-action-btn edit';
        editBtn.innerHTML = '<i class="fas fa-edit"></i>';
        editBtn.title = '编辑章节标题';
        editBtn.onclick = (e) => {
            e.stopPropagation();
            editChapterTitle(chapter.id, chapter.title);
        };
        actionsElement.appendChild(editBtn);
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'chapter-action-btn delete';
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.title = '删除章节';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            confirmDeleteChapter(chapter.id, chapter.title);
        };
        actionsElement.appendChild(deleteBtn);
        
        chapterItem.appendChild(actionsElement);
        
        // Click handler for selecting the chapter
        chapterItem.onclick = () => selectChapter(chapter.id);
        
        // Drag and drop event handlers
        chapterItem.addEventListener('dragstart', handleDragStart);
        chapterItem.addEventListener('dragover', handleDragOver);
        chapterItem.addEventListener('dragenter', handleDragEnter);
        chapterItem.addEventListener('dragleave', handleDragLeave);
        chapterItem.addEventListener('drop', handleDrop);
        chapterItem.addEventListener('dragend', handleDragEnd);
        
        chapterList.appendChild(chapterItem);
    });
}

/**
 * Create a new chapter for the current novel
 */
async function createNewChapter() {
    // Try to get the novel ID from multiple sources
    const novelId = currentNovelId || window.currentNovelId || localStorage.getItem('currentNovelId');
    
    console.log('Creating chapter using novel ID:', novelId, 
                'Local currentNovelId:', currentNovelId, 
                'Window currentNovelId:', window.currentNovelId,
                'localStorage currentNovelId:', localStorage.getItem('currentNovelId'));
    
    if (!novelId) {
        alert('请先选择一部小说');
        return;
    }
    
    try {
        console.log('Creating new chapter for novel:', novelId);
        
        // First verify that the novel exists
        const checkResponse = await fetch(`/api/novels/${novelId}`);
        if (!checkResponse.ok) {
            throw new Error(`Novel not found: ${novelId}. Please refresh the page and try again.`);
        }
        
        const requestData = {
            title: '新章节'
        };
        
        console.log('Request data:', JSON.stringify(requestData));
        
        const response = await fetch(`/api/novels/${novelId}/chapters`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            console.error('Server response:', response.status, errorData);
            throw new Error(`Failed to create chapter: ${response.statusText}. Server response: ${errorData}`);
        }
        
        const newChapter = await response.json();
        console.log('New chapter created:', newChapter);
        
        chapters.push(newChapter);
        renderChapterList();
        
        // Automatically select the new chapter
        selectChapter(newChapter.id);
        
    } catch (error) {
        console.error('Error creating chapter:', error);
        alert('创建章节失败: ' + error.message);
    }
}

/**
 * Select and load a chapter
 * @param {string} chapterId - The ID of the chapter to select
 */
async function selectChapter(chapterId) {
    if (!currentNovelId || !chapterId) return;
    
    // If current content has unsaved changes, prompt user to save
    if (novelContent && novelContent.dataset.hasChanges === 'true') {
        if (confirm('当前内容有未保存的更改，是否保存？')) {
            await saveCurrentContent();
        }
    }
    
    try {
        const response = await fetch(`/api/novels/${currentNovelId}/chapters/${chapterId}`);
        
        if (!response.ok) {
            throw new Error(`Failed to load chapter: ${response.statusText}`);
        }
        
        const chapter = await response.json();
        currentChapterId = chapterId;
        
        // Update the novel content textarea
        if (novelContent) {
            novelContent.value = chapter.content || '';
            novelContent.dataset.lastSaved = chapter.content || '';
            
            // Update word count if the function exists
            if (window.updateWordCount) {
                window.updateWordCount();
            }
        }
        
        // Update active state in the UI
        updateChapterActiveState();
        
    } catch (error) {
        console.error('Error loading chapter content:', error);
        alert('加载章节内容失败');
    }
}

/**
 * Update the active state of chapter items in the list
 */
function updateChapterActiveState() {
    const chapterItems = document.querySelectorAll('.chapter-item');
    chapterItems.forEach(item => {
        if (item.dataset.id === currentChapterId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

/**
 * Save the current content to the selected chapter
 */
async function saveCurrentContent() {
    if (!currentNovelId || !currentChapterId || !novelContent) return;
    
    try {
        await updateChapterContent(currentNovelId, currentChapterId, novelContent.value);
    } catch (error) {
        console.error('Error saving chapter content:', error);
        alert('保存章节内容失败');
    }
}

/**
 * Update a chapter's content
 * @param {string} novelId - The ID of the novel
 * @param {string} chapterId - The ID of the chapter
 * @param {string} content - The new content
 */
async function updateChapterContent(novelId, chapterId, content) {
    try {
        const response = await fetch(`/api/novels/${novelId}/chapters/${chapterId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: content
            })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to update chapter: ${response.statusText}`);
        }
        
        if (novelContent) {
            novelContent.dataset.lastSaved = content;
            novelContent.dataset.hasChanges = 'false';
        }
        
        return true;
    } catch (error) {
        console.error('Error updating chapter content:', error);
        return false;
    }
}

/**
 * Edit a chapter's title
 * @param {string} chapterId - The ID of the chapter
 * @param {string} currentTitle - The current title of the chapter
 */
function editChapterTitle(chapterId, currentTitle) {
    const chapterItem = document.querySelector(`.chapter-item[data-id="${chapterId}"]`);
    if (!chapterItem) return;
    
    const titleElement = chapterItem.querySelector('.chapter-title');
    if (!titleElement) return;
    
    // Save the original content
    const originalContent = titleElement.innerHTML;
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'chapter-edit-input';
    input.value = currentTitle;
    input.maxLength = 50;
    
    // Replace the title element with input
    titleElement.innerHTML = '';
    titleElement.appendChild(input);
    
    // Focus on the input
    input.focus();
    
    // Handle input events
    input.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            updateChapterTitle(chapterId, input.value);
        } else if (e.key === 'Escape') {
            titleElement.innerHTML = originalContent;
        }
    });
    
    input.addEventListener('blur', () => {
        updateChapterTitle(chapterId, input.value);
    });
    
    // Prevent the item click event
    input.addEventListener('click', (e) => e.stopPropagation());
}

/**
 * Update a chapter's title
 * @param {string} chapterId - The ID of the chapter
 * @param {string} newTitle - The new title for the chapter
 */
async function updateChapterTitle(chapterId, newTitle) {
    if (!currentNovelId || !chapterId) return;
    
    // Trim and validate title
    newTitle = newTitle.trim();
    if (!newTitle) {
        newTitle = '无标题章节';
    }
    
    try {
        const response = await fetch(`/api/novels/${currentNovelId}/chapters/${chapterId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: newTitle
            })
        });
        
        if (!response.ok) {
            throw new Error(`Failed to update chapter title: ${response.statusText}`);
        }
        
        // Update local chapter data
        const chapter = chapters.find(ch => ch.id === chapterId);
        if (chapter) {
            chapter.title = newTitle;
        }
        
        // Update UI
        const chapterItem = document.querySelector(`.chapter-item[data-id="${chapterId}"]`);
        if (chapterItem) {
            const titleElement = chapterItem.querySelector('.chapter-title');
            if (titleElement) {
                titleElement.textContent = newTitle;
            }
        }
        
    } catch (error) {
        console.error('Error updating chapter title:', error);
        alert('更新章节标题失败');
        
        // Reload the chapter list to restore valid state
        loadChapters(currentNovelId);
    }
}

/**
 * Show confirmation dialog for deleting a chapter
 * @param {string} chapterId - The ID of the chapter
 * @param {string} chapterTitle - The title of the chapter
 */
function confirmDeleteChapter(chapterId, chapterTitle) {
    // Create backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'chapter-confirm-dialog-backdrop';
    document.body.appendChild(backdrop);
    
    // Create dialog
    const dialog = document.createElement('div');
    dialog.className = 'chapter-confirm-dialog';
    dialog.innerHTML = `
        <div class="chapter-confirm-dialog-title">确认删除</div>
        <div class="chapter-confirm-dialog-message">确定要删除章节"${chapterTitle}"吗？<br>此操作不可撤销。</div>
        <div class="chapter-confirm-dialog-buttons">
            <button class="btn btn-secondary" id="cancel-delete-btn">取消</button>
            <button class="btn btn-danger" id="confirm-delete-btn">删除</button>
        </div>
    `;
    document.body.appendChild(dialog);
    
    // Handle button clicks
    document.getElementById('cancel-delete-btn').onclick = () => {
        document.body.removeChild(backdrop);
        document.body.removeChild(dialog);
    };
    
    document.getElementById('confirm-delete-btn').onclick = () => {
        deleteChapter(chapterId);
        document.body.removeChild(backdrop);
        document.body.removeChild(dialog);
    };
}

/**
 * Delete a chapter
 * @param {string} chapterId - The ID of the chapter to delete
 */
async function deleteChapter(chapterId) {
    if (!currentNovelId || !chapterId) return;
    
    try {
        const response = await fetch(`/api/novels/${currentNovelId}/chapters/${chapterId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`Failed to delete chapter: ${response.statusText}`);
        }
        
        // Remove from local data
        chapters = chapters.filter(ch => ch.id !== chapterId);
        
        // Update UI
        renderChapterList();
        
        // Clear content if the deleted chapter was selected
        if (chapterId === currentChapterId) {
            currentChapterId = null;
            if (novelContent) {
                novelContent.value = '';
            }
        }
        
    } catch (error) {
        console.error('Error deleting chapter:', error);
        alert('删除章节失败');
    }
}

/**
 * Toggle chapter sort mode
 */
function toggleSortMode() {
    const chapterList = document.getElementById('chapter-list');
    if (!chapterList) return;
    
    const chapterItems = chapterList.querySelectorAll('.chapter-item');
    
    // Check if we're already in sort mode
    const sortingEnabled = chapterList.classList.contains('sorting-enabled');
    
    if (sortingEnabled) {
        // Turn off sorting mode
        chapterList.classList.remove('sorting-enabled');
        
        // Update sort button text
        const sortBtn = document.querySelector('.chapter-btn:nth-child(2)');
        if (sortBtn) {
            sortBtn.innerHTML = '<i class="fas fa-sort"></i> 排序章节';
        }
    } else {
        // Turn on sorting mode
        chapterList.classList.add('sorting-enabled');
        
        // Update sort button text
        const sortBtn = document.querySelector('.chapter-btn:nth-child(2)');
        if (sortBtn) {
            sortBtn.innerHTML = '<i class="fas fa-check"></i> 完成排序';
        }
    }
}

// Drag and drop handlers for chapter sorting

function handleDragStart(e) {
    if (!e.target.classList.contains('chapter-item')) return;
    
    isDragging = true;
    draggedItem = e.target;
    e.target.classList.add('dragging');
    
    // Required for Firefox
    e.dataTransfer.setData('text/plain', '');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    if (isDragging) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
}

function handleDragEnter(e) {
    if (!isDragging) return;
    
    let target = e.target;
    while (target && !target.classList.contains('chapter-item')) {
        target = target.parentElement;
    }
    
    if (target && target !== draggedItem) {
        target.classList.add('drag-over');
    }
}

function handleDragLeave(e) {
    if (!isDragging) return;
    
    let target = e.target;
    while (target && !target.classList.contains('chapter-item')) {
        target = target.parentElement;
    }
    
    if (target) {
        target.classList.remove('drag-over');
    }
}

function handleDrop(e) {
    e.preventDefault();
    if (!isDragging) return;
    
    let dropTarget = e.target;
    while (dropTarget && !dropTarget.classList.contains('chapter-item')) {
        dropTarget = dropTarget.parentElement;
    }
    
    if (dropTarget && dropTarget !== draggedItem) {
        // Get all chapter items
        const chapterList = document.getElementById('chapter-list');
        const items = Array.from(chapterList.querySelectorAll('.chapter-item'));
        
        // Remove the drag-over class
        dropTarget.classList.remove('drag-over');
        
        // Get positions
        const draggedPos = items.indexOf(draggedItem);
        const dropPos = items.indexOf(dropTarget);
        
        // Reorder chapters array
        const [moved] = chapters.splice(draggedPos, 1);
        chapters.splice(dropPos, 0, moved);
        
        // Re-render the list
        renderChapterList();
        
        // Send the new order to the server
        saveChaptersOrder();
    }
}

function handleDragEnd() {
    if (!isDragging) return;
    
    isDragging = false;
    draggedItem = null;
    
    // Remove drag classes
    document.querySelectorAll('.chapter-item').forEach(item => {
        item.classList.remove('dragging');
        item.classList.remove('drag-over');
    });
}

/**
 * Save the current chapter order to the server
 */
async function saveChaptersOrder() {
    if (!currentNovelId || !chapters.length) return;
    
    // Prepare the data for reordering
    const orderData = chapters.map((chapter, index) => ({
        id: chapter.id,
        order: index
    }));
    
    try {
        const response = await fetch(`/api/novels/${currentNovelId}/chapters/reorder`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            throw new Error(`Failed to reorder chapters: ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('Error saving chapter order:', error);
        alert('保存章节顺序失败');
        
        // Reload the chapters to restore the last known valid state
        loadChapters(currentNovelId);
    }
}