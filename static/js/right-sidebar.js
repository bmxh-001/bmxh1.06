/**
 * Right Sidebar Functionality
 * Handles the right sidebar setup, toggle, and content management
 */

import { initializeChapterManager } from './chapter-manager.js';

// Initialize right sidebar when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupRightSidebar();
});

/**
 * Set up the right sidebar structure and toggle functionality
 */
function setupRightSidebar() {
    // Create the right sidebar element
    const rightSidebar = document.createElement('div');
    rightSidebar.className = 'right-sidebar';
    rightSidebar.id = 'right-sidebar';
    
    // Add toggle button with arrow icon
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-right-sidebar-btn';
    toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    toggleBtn.title = '折叠右侧栏';
    toggleBtn.setAttribute('aria-label', '折叠右侧栏');
    
    // Create a dedicated toggle button container that sits in the center of the content area
    const toggleContainer = document.createElement('div');
    toggleContainer.className = 'right-sidebar-toggle-container';
    toggleContainer.style.position = 'absolute';
    toggleContainer.style.right = '0';
    toggleContainer.style.top = '50%';
    toggleContainer.style.transform = 'translateY(-50%)';
    toggleContainer.style.zIndex = '100';
    toggleContainer.style.width = '20px';
    toggleContainer.style.height = '40px';
    toggleContainer.style.display = 'flex';
    toggleContainer.style.alignItems = 'center';
    toggleContainer.style.justifyContent = 'center';
    
    // Add the button to the toggle container
    toggleContainer.appendChild(toggleBtn);
    
    // Add the editor toolbar
    addEditorToolbar(rightSidebar);
    
    // Initialize the chapter manager
    initializeChapterManager(rightSidebar);
    
    // Get the content area and main content elements
    const mainContent = document.querySelector('.main-content');
    const contentArea = document.querySelector('.content-area');
    
    if (!mainContent || !contentArea) {
        console.warn('Main content or content area elements not found');
        return;
    }
    
    // Position the toggle container in the content area
    contentArea.style.position = 'relative';
    contentArea.appendChild(toggleContainer);
    
    // Append right sidebar to main content
    mainContent.appendChild(rightSidebar);
    
    // Initialize the expanded/collapsed state from localStorage
    const isCollapsed = localStorage.getItem('rightSidebarCollapsed') === 'true';
    if (isCollapsed) {
        rightSidebar.classList.add('collapsed');
        toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        toggleBtn.title = '展开右侧栏';
        toggleBtn.setAttribute('aria-label', '展开右侧栏');
    }
    
    // Toggle button click event
    toggleBtn.addEventListener('click', () => {
        rightSidebar.classList.toggle('collapsed');
        const isNowCollapsed = rightSidebar.classList.contains('collapsed');
        
        // Update icon direction and title based on state
        if (isNowCollapsed) {
            toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            toggleBtn.title = '展开右侧栏';
            toggleBtn.setAttribute('aria-label', '展开右侧栏');
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            toggleBtn.title = '折叠右侧栏';
            toggleBtn.setAttribute('aria-label', '折叠右侧栏');
        }
        
        // Save state to localStorage
        localStorage.setItem('rightSidebarCollapsed', isNowCollapsed);
        
        // Trigger resize event for any components that need to adjust
        window.dispatchEvent(new Event('resize'));
    });
}

/**
 * Add editor toolbar section to the sidebar
 * @param {HTMLElement} sidebar - The right sidebar element
 */
function addEditorToolbar(sidebar) {
    const toolbarSection = document.createElement('div');
    toolbarSection.className = 'right-sidebar-section';
    
    const heading = document.createElement('h3');
    heading.textContent = '编辑工具';
    toolbarSection.appendChild(heading);
    
    // Create toolbar container
    const toolbar = document.createElement('div');
    toolbar.className = 'editor-toolbar';
    
    // Add toolbar groups and buttons
    
    // Group 0: Fullscreen
    const fullscreenGroup = createToolbarGroup([
        { icon: 'fas fa-expand', tooltip: '全屏模式', action: 'fullscreen' }
    ]);
    toolbar.appendChild(fullscreenGroup);
    
    // Group 1: Undo/Redo
    const undoRedoGroup = createToolbarGroup([
        { icon: 'fas fa-undo', tooltip: '撤销 (Ctrl+Z)', action: 'undo' },
        { icon: 'fas fa-redo', tooltip: '重做 (Ctrl+Y)', action: 'redo' }
    ]);
    toolbar.appendChild(undoRedoGroup);
    
    // Group 2: Save
    const saveGroup = createToolbarGroup([
        { icon: 'fas fa-save', tooltip: '保存 (Ctrl+S)', action: 'save' }
    ]);
    toolbar.appendChild(saveGroup);
    
    // Group 3: Export Chapters
    const exportGroup = createToolbarGroup([
        { icon: 'fas fa-file-export', tooltip: '导出章节', action: 'export-chapters' }
    ]);
    toolbar.appendChild(exportGroup);
    
    // Remove other toolbar groups - keeping only undo, redo, and save functionality
    
    toolbarSection.appendChild(toolbar);
    sidebar.appendChild(toolbarSection);
    
    // Setup toolbar button click handlers
    setupToolbarActions(toolbar);
    
    // Set up fullscreen functionality for the fullscreen button
    const fullscreenBtn = toolbar.querySelector('.toolbar-btn[data-action="fullscreen"]');
    if (fullscreenBtn) {
        setupFullscreenToggle(fullscreenBtn);
    }
}

/**
 * Create a toolbar group with the given buttons
 * @param {Array} buttons - Array of button configurations
 * @returns {HTMLElement} - The toolbar group element
 */
function createToolbarGroup(buttons) {
    const group = document.createElement('div');
    group.className = 'toolbar-group';
    
    buttons.forEach(btn => {
        const button = document.createElement('button');
        button.className = 'toolbar-btn';
        button.dataset.action = btn.action;
        let svg = '';
        // 精美渐变SVG图标
        if (btn.action === 'fullscreen') {
            svg = `<span class="toolbar-btn-icon"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fullscreenGradient" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#7f53ff"/><stop offset="1" stop-color="#647dee"/></linearGradient></defs><circle cx="11" cy="11" r="10" fill="url(#fullscreenGradient)"/><path d="M7 9V7h2M15 9V7h-2M7 13v2h2M15 13v2h-2" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
        } else if (btn.action === 'undo') {
            svg = `<span class="toolbar-btn-icon"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="undoGradient" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#43cea2"/><stop offset="1" stop-color="#185a9d"/></linearGradient></defs><circle cx="11" cy="11" r="10" fill="url(#undoGradient)"/><path d="M7 11H15M7 11l3-3M7 11l3 3" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
        } else if (btn.action === 'redo') {
            svg = `<span class="toolbar-btn-icon"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="redoGradient" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#fa709a"/><stop offset="1" stop-color="#fee140"/></linearGradient></defs><circle cx="11" cy="11" r="10" fill="url(#redoGradient)"/><path d="M15 11H7M15 11l-3-3M15 11l-3 3" stroke="#fff" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
        } else if (btn.action === 'save') {
            svg = `<span class="toolbar-btn-icon"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="saveGradient" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#11998e"/><stop offset="1" stop-color="#38ef7d"/></linearGradient></defs><circle cx="11" cy="11" r="10" fill="url(#saveGradient)"/><rect x="7" y="7" width="8" height="8" rx="2" fill="#fff"/><path d="M9 7v2h4V7" stroke="#11998e" stroke-width="1.2" stroke-linecap="round"/><rect x="9" y="11" width="4" height="2" rx="0.7" fill="#11998e"/></svg></span>`;
        } else if (btn.action === 'export-chapters') {
            svg = `<span class="toolbar-btn-icon"><svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="exportGradient" x1="0" y1="0" x2="22" y2="22" gradientUnits="userSpaceOnUse"><stop stop-color="#f7971e"/><stop offset="1" stop-color="#ffd200"/></linearGradient></defs><circle cx="11" cy="11" r="10" fill="url(#exportGradient)"/><rect x="7" y="6" width="8" height="6" rx="2" fill="#fff"/><path d="M11 12v3m0 0l-2-2m2 2l2-2" stroke="#f7971e" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>`;
        }
        button.innerHTML = svg;
        button.title = btn.tooltip || '';
        group.appendChild(button);
    });
    return group;
}

/**
 * Setup click handlers for toolbar buttons
 * @param {HTMLElement} toolbar - The toolbar element
 */
function setupToolbarActions(toolbar) {
    const buttons = toolbar.querySelectorAll('.toolbar-btn');
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            performEditorAction(action);
        });
    });
}

/**
 * Perform editor action on the novel content
 * @param {string} action - The action to perform
 */
function performEditorAction(action) {
    const novelContent = document.getElementById('novel-content');
    if (!novelContent) return;
    
    // Handle only undo, redo, save, and fullscreen actions
    switch (action) {
        case 'undo':
            document.execCommand('undo');
            break;
            
        case 'redo':
            document.execCommand('redo');
            break;
            
        case 'save':
            // Trigger the save functionality from the main script
            const saveBtn = document.getElementById('save-novel-btn');
            if (saveBtn) saveBtn.click();
            break;
            
        case 'export-chapters':
            exportChapters();
            break;
            
        case 'fullscreen':
            // The fullscreen action is handled separately by setupFullscreenToggle
            // This case is just here for completeness
            break;
            
        default:
            // Ignore other actions
            break;
    }
    
    // Ensure the textarea keeps focus (except for fullscreen action)
    if (action !== 'fullscreen') {
        novelContent.focus();
    }
}

/**
 * Export chapters to a text file
 */
async function exportChapters() {
    const currentNovelId = localStorage.getItem('currentNovelId');
    if (!currentNovelId) {
        alert('请先选择或创建一个小说');
        return;
    }

    try {
        // Get all chapters
        const response = await fetch(`/api/novels/${currentNovelId}/chapters`);
        if (!response.ok) {
            throw new Error('Failed to fetch chapters');
        }
        const chapters = await response.json();

        if (!chapters || chapters.length === 0) {
            alert('没有可导出的章节');
            return;
        }

        // Create export dialog
        const dialog = document.createElement('div');
        dialog.className = 'export-dialog';
        dialog.style.position = 'fixed';
        dialog.style.top = '50%';
        dialog.style.left = '50%';
        dialog.style.transform = 'translate(-50%, -50%)';
        dialog.style.backgroundColor = 'white';
        dialog.style.padding = '20px';
        dialog.style.borderRadius = '8px';
        dialog.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        dialog.style.zIndex = '1000';

        // Add title
        const title = document.createElement('h3');
        title.textContent = '导出章节';
        title.style.marginBottom = '15px';
        dialog.appendChild(title);

        // Add chapter selection
        const chapterList = document.createElement('div');
        chapterList.style.maxHeight = '300px';
        chapterList.style.overflowY = 'auto';
        chapterList.style.marginBottom = '15px';

        chapters.forEach(chapter => {
            const chapterItem = document.createElement('div');
            chapterItem.style.display = 'flex';
            chapterItem.style.alignItems = 'center';
            chapterItem.style.padding = '8px';
            chapterItem.style.borderBottom = '1px solid #eee';

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.style.marginRight = '10px';

            const chapterTitle = document.createElement('span');
            chapterTitle.textContent = chapter.title;

            chapterItem.appendChild(checkbox);
            chapterItem.appendChild(chapterTitle);
            chapterList.appendChild(chapterItem);
        });

        dialog.appendChild(chapterList);

        // Add buttons
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.justifyContent = 'flex-end';
        buttonContainer.style.gap = '10px';

        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = '取消';
        cancelBtn.style.padding = '8px 16px';
        cancelBtn.style.border = '1px solid #ddd';
        cancelBtn.style.borderRadius = '4px';
        cancelBtn.style.backgroundColor = 'white';
        cancelBtn.style.cursor = 'pointer';

        const exportBtn = document.createElement('button');
        exportBtn.textContent = '导出';
        exportBtn.style.padding = '8px 16px';
        exportBtn.style.border = 'none';
        exportBtn.style.borderRadius = '4px';
        exportBtn.style.backgroundColor = '#4f46e5';
        exportBtn.style.color = 'white';
        exportBtn.style.cursor = 'pointer';

        buttonContainer.appendChild(cancelBtn);
        buttonContainer.appendChild(exportBtn);
        dialog.appendChild(buttonContainer);

        // Add overlay
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.right = '0';
        overlay.style.bottom = '0';
        overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
        overlay.style.zIndex = '999';

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        // Handle export
        exportBtn.onclick = async () => {
            const selectedChapters = Array.from(chapterList.children)
                .filter(item => item.querySelector('input[type="checkbox"]').checked)
                .map(item => item.querySelector('span').textContent);

            if (selectedChapters.length === 0) {
                alert('请至少选择一个章节');
                return;
            }

            try {
                // Get content for selected chapters
                const chapterContents = await Promise.all(
                    selectedChapters.map(async (title) => {
                        const chapter = chapters.find(c => c.title === title);
                        if (!chapter) return '';
                        const response = await fetch(`/api/novels/${currentNovelId}/chapters/${chapter.id}`);
                        if (!response.ok) return '';
                        const data = await response.json();
                        return `\n\n${title}\n\n${data.content}`;
                    })
                );

                // Create text content
                const textContent = chapterContents.join('');

                // Save to server instead of downloading
                const response = await fetch('/api/save-text-file', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        content: textContent,
                        filename: `小说章节_${new Date().toLocaleDateString()}.txt`
                    })
                });

                if (!response.ok) {
                    throw new Error('Failed to save file');
                }

                const result = await response.json();
                alert(result.message);

                // Close dialog
                document.body.removeChild(overlay);
                document.body.removeChild(dialog);
            } catch (error) {
                console.error('Error exporting chapters:', error);
                alert('导出章节失败');
            }
        };

        // Handle cancel
        cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
            document.body.removeChild(dialog);
        };

        // Close on overlay click
        overlay.onclick = () => {
            document.body.removeChild(overlay);
            document.body.removeChild(dialog);
        };

    } catch (error) {
        console.error('Error preparing export:', error);
        alert('准备导出失败');
    }
}

/**
 * Add find and replace section to the sidebar
 * @param {HTMLElement} sidebar - The right sidebar element
 */
function addFindReplaceSection(sidebar) {
    const section = document.createElement('div');
    section.className = 'right-sidebar-section';
    
    const heading = document.createElement('h3');
    heading.textContent = '查找与替换';
    section.appendChild(heading);
    
    const container = document.createElement('div');
    container.className = 'find-replace-container';
    
    // Find input
    const findDiv = document.createElement('div');
    findDiv.className = 'find-replace-input';
    
    const findLabel = document.createElement('label');
    findLabel.textContent = '查找:';
    findLabel.style.minWidth = '40px';
    
    const findInput = document.createElement('input');
    findInput.type = 'text';
    findInput.id = 'find-input';
    findInput.placeholder = '输入查找内容...';
    
    findDiv.appendChild(findLabel);
    findDiv.appendChild(findInput);
    
    // Replace input
    const replaceDiv = document.createElement('div');
    replaceDiv.className = 'find-replace-input';
    
    const replaceLabel = document.createElement('label');
    replaceLabel.textContent = '替换:';
    replaceLabel.style.minWidth = '40px';
    
    const replaceInput = document.createElement('input');
    replaceInput.type = 'text';
    replaceInput.id = 'replace-input';
    replaceInput.placeholder = '输入替换内容...';
    
    replaceDiv.appendChild(replaceLabel);
    replaceDiv.appendChild(replaceInput);
    
    // Actions
    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'find-replace-actions';
    
    const findNextBtn = document.createElement('button');
    findNextBtn.textContent = '查找下一个';
    findNextBtn.id = 'find-next-btn';
    
    const replaceBtn = document.createElement('button');
    replaceBtn.textContent = '替换';
    replaceBtn.id = 'replace-btn';
    
    const replaceAllBtn = document.createElement('button');
    replaceAllBtn.textContent = '全部替换';
    replaceAllBtn.id = 'replace-all-btn';
    
    actionsDiv.appendChild(findNextBtn);
    actionsDiv.appendChild(replaceBtn);
    actionsDiv.appendChild(replaceAllBtn);
    
    // Add elements to container
    container.appendChild(findDiv);
    container.appendChild(replaceDiv);
    container.appendChild(actionsDiv);
    
    section.appendChild(container);
    sidebar.appendChild(section);
    
    // Setup find and replace actions
    setupFindReplaceActions(findInput, replaceInput, findNextBtn, replaceBtn, replaceAllBtn);
}

/**
 * Setup find and replace functionality
 * @param {HTMLElement} findInput - The find input element
 * @param {HTMLElement} replaceInput - The replace input element
 * @param {HTMLElement} findNextBtn - The find next button
 * @param {HTMLElement} replaceBtn - The replace button
 * @param {HTMLElement} replaceAllBtn - The replace all button
 */
function setupFindReplaceActions(findInput, replaceInput, findNextBtn, replaceBtn, replaceAllBtn) {
    let lastSearchPos = -1;
    
    // Find next function
    findNextBtn.addEventListener('click', () => {
        const novelContent = document.getElementById('novel-content');
        if (!novelContent) return;
        
        const searchText = findInput.value;
        if (!searchText) return;
        
        const content = novelContent.value;
        const currentPos = lastSearchPos >= 0 ? lastSearchPos : novelContent.selectionStart;
        
        // Search from current position
        const foundPos = content.indexOf(searchText, currentPos + 1);
        
        if (foundPos >= 0) {
            // Text found, select it
            novelContent.setSelectionRange(foundPos, foundPos + searchText.length);
            novelContent.focus();
            lastSearchPos = foundPos;
        } else {
            // Try searching from the beginning
            const foundFromStart = content.indexOf(searchText);
            if (foundFromStart >= 0 && foundFromStart !== lastSearchPos) {
                // Text found from beginning
                novelContent.setSelectionRange(foundFromStart, foundFromStart + searchText.length);
                novelContent.focus();
                lastSearchPos = foundFromStart;
                alert('已从头开始查找');
            } else {
                // Not found
                alert(`未找到"${searchText}"`);
                lastSearchPos = -1;
            }
        }
    });
    
    // Replace function
    replaceBtn.addEventListener('click', () => {
        const novelContent = document.getElementById('novel-content');
        if (!novelContent) return;
        
        const searchText = findInput.value;
        const replaceText = replaceInput.value;
        if (!searchText) return;
        
        const start = novelContent.selectionStart;
        const end = novelContent.selectionEnd;
        const selectedText = novelContent.value.substring(start, end);
        
        // Check if selected text matches search text
        if (selectedText === searchText) {
            // Replace selected text
            const beforeText = novelContent.value.substring(0, start);
            const afterText = novelContent.value.substring(end);
            
            novelContent.value = beforeText + replaceText + afterText;
            novelContent.setSelectionRange(start, start + replaceText.length);
            novelContent.focus();
            
            // Reset search position
            lastSearchPos = start;
            
            // Find next automatically
            findNextBtn.click();
        } else {
            // Selected text doesn't match, find first
            findNextBtn.click();
        }
    });
    
    // Replace all function
    replaceAllBtn.addEventListener('click', () => {
        const novelContent = document.getElementById('novel-content');
        if (!novelContent) return;
        
        const searchText = findInput.value;
        const replaceText = replaceInput.value;
        if (!searchText) return;
        
        // Replace all occurrences
        const content = novelContent.value;
        const newContent = content.split(searchText).join(replaceText);
        
        if (content !== newContent) {
            // Count replacements
            const count = (content.match(new RegExp(searchText, 'g')) || []).length;
            
            // Update content
            novelContent.value = newContent;
            novelContent.focus();
            
            // Reset search position
            lastSearchPos = -1;
            
            // Notify user
            alert(`已替换${count}处文本`);
        } else {
            alert(`未找到"${searchText}"`);
        }
    });
    
    // Reset search position when find input changes
    findInput.addEventListener('input', () => {
        lastSearchPos = -1;
    });
    
    // Handle enter key in inputs
    findInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            findNextBtn.click();
            e.preventDefault();
        }
    });
    
    replaceInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            replaceBtn.click();
            e.preventDefault();
        }
    });
}

/**
 * Add AI assistant tools section to the sidebar
 * @param {HTMLElement} sidebar - The right sidebar element
 */
function addAIToolsSection(sidebar) {
    const section = document.createElement('div');
    section.className = 'right-sidebar-section';
    
    const heading = document.createElement('h3');
    heading.textContent = 'AI 辅助功能';
    section.appendChild(heading);
    
    const container = document.createElement('div');
    container.className = 'ai-assistant-tools';
    
    // Create AI tool buttons
    const aiTools = [
        { icon: 'fas fa-magic', text: '文本续写', action: 'continue' },
        { icon: 'fas fa-sync-alt', text: '润色文本', action: 'polish' },
        { icon: 'fas fa-file-alt', text: '生成摘要', action: 'summarize' },
        { icon: 'fas fa-theater-masks', text: '风格转换', action: 'style-transfer' }
    ];
    
    aiTools.forEach(tool => {
        const button = document.createElement('button');
        button.className = 'ai-tool-btn';
        button.dataset.action = tool.action;
        button.innerHTML = `<i class="${tool.icon}"></i> ${tool.text}`;
        
        button.addEventListener('click', () => {
            performAiAction(tool.action);
        });
        
        container.appendChild(button);
    });
    
    // Add style transfer options (hidden by default)
    const styleTransferOptions = document.createElement('div');
    styleTransferOptions.className = 'style-transfer-options';
    styleTransferOptions.style.display = 'none';
    styleTransferOptions.style.marginTop = '8px';
    styleTransferOptions.style.paddingLeft = '20px';
    
    const styleOptions = ['正式学术', '散文诗意', '幽默诙谐', '简洁直接'];
    
    styleOptions.forEach(style => {
        const styleBtn = document.createElement('button');
        styleBtn.className = 'ai-tool-btn';
        styleBtn.style.fontSize = '0.85em';
        styleBtn.style.padding = '6px 8px';
        styleBtn.style.marginBottom = '5px';
        styleBtn.dataset.style = style;
        styleBtn.textContent = style;
        
        styleBtn.addEventListener('click', () => {
            performStyleTransfer(style);
        });
        
        styleTransferOptions.appendChild(styleBtn);
    });
    
    container.appendChild(styleTransferOptions);
    
    // Find the "style-transfer" button and add click event to toggle options
    container.addEventListener('click', (e) => {
        const button = e.target.closest('.ai-tool-btn[data-action="style-transfer"]');
        if (button) {
            // Toggle style options
            styleTransferOptions.style.display = 
                styleTransferOptions.style.display === 'none' ? 'block' : 'none';
        }
    });
    
    section.appendChild(container);
    sidebar.appendChild(section);
}

/**
 * Perform AI-assisted action
 * @param {string} action - The AI action to perform
 */
function performAiAction(action) {
    const novelContent = document.getElementById('novel-content');
    if (!novelContent) return;
    
    const selectedText = getSelectedOrLastParagraph(novelContent);
    
    // Different actions based on selected AI tool
    switch (action) {
        case 'continue':
            // Check if we need to trigger the continue button from the main UI
            const continueBtn = document.getElementById('continue-btn');
            if (continueBtn) {
                continueBtn.click();
            } else {
                alert('续写功能需要先确保小说生成页面已加载');
            }
            break;
            
        case 'polish':
            // Polish selected text
            if (selectedText) {
                // Here we would typically call the API to polish text
                // For now, simulate by showing message
                alert(`即将润色文本：${selectedText.substring(0, 20)}...`);
                
                // In a real implementation, this would call the generation API
                // and replace the selected text with the polished version
            } else {
                alert('请先选择要润色的文本');
            }
            break;
            
        case 'summarize':
            // Generate summary
            if (selectedText) {
                // Here we would call the API to generate a summary
                alert(`即将生成摘要：${selectedText.substring(0, 20)}...`);
                
                // In a real implementation, this would call the generation API
                // and show the summary in a dialog or insert it
            } else {
                alert('请先选择要生成摘要的文本');
            }
            break;
            
        // Style transfer is handled by the sub-buttons
    }
}

/**
 * Perform style transfer on selected text
 * @param {string} style - The target style
 */
function performStyleTransfer(style) {
    const novelContent = document.getElementById('novel-content');
    if (!novelContent) return;
    
    const selectedText = getSelectedOrLastParagraph(novelContent);
    
    if (selectedText) {
        // Here we would call the API to transform the text style
        alert(`即将将文本转换为${style}风格：${selectedText.substring(0, 20)}...`);
        
        // In a real implementation, this would call the generation API
        // and replace the selected text with the styled version
    } else {
        alert('请先选择要转换风格的文本');
    }
}

/**
 * Get selected text or last paragraph if nothing is selected
 * @param {HTMLElement} textarea - The textarea element
 * @returns {string} The selected text or last paragraph
 */
function getSelectedOrLastParagraph(textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    if (start !== end) {
        // Return selected text
        return textarea.value.substring(start, end);
    } else {
        // If no selection, get the last paragraph
        const content = textarea.value;
        const paragraphs = content.split('\n\n');
        
        if (paragraphs.length > 0) {
            return paragraphs[paragraphs.length - 1];
        }
        
        return '';
    }
}

/**
 * Add view control section to the sidebar
 * @param {HTMLElement} sidebar - The right sidebar element
 */
function addViewControls(sidebar) {
    const section = document.createElement('div');
    section.className = 'view-controls';
    
    // Zoom controls
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    
    // Create zoom out button
    const zoomOutBtn = document.createElement('button');
    zoomOutBtn.className = 'zoom-btn';
    zoomOutBtn.innerHTML = '<i class="fas fa-search-minus"></i>';
    zoomOutBtn.title = '缩小';
    
    // Create zoom level display
    const zoomLevel = document.createElement('span');
    zoomLevel.className = 'zoom-level';
    zoomLevel.textContent = '100%';
    zoomLevel.id = 'zoom-level';
    
    // Create zoom in button
    const zoomInBtn = document.createElement('button');
    zoomInBtn.className = 'zoom-btn';
    zoomInBtn.innerHTML = '<i class="fas fa-search-plus"></i>';
    zoomInBtn.title = '放大';
    
    zoomControls.appendChild(zoomOutBtn);
    zoomControls.appendChild(zoomLevel);
    zoomControls.appendChild(zoomInBtn);
    
    // Fullscreen button
    const fullscreenBtn = document.createElement('button');
    fullscreenBtn.className = 'fullscreen-btn';
    fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    fullscreenBtn.title = '全屏模式';
    
    // Add elements to section
    section.appendChild(zoomControls);
    section.appendChild(fullscreenBtn);
    
    sidebar.appendChild(section);
    
    // Set up zoom functionality
    setupZoomControls(zoomInBtn, zoomOutBtn, zoomLevel);
    
    // Set up fullscreen functionality
    setupFullscreenToggle(fullscreenBtn);
}

/**
 * Set up zoom control functionality
 * @param {HTMLElement} zoomInBtn - The zoom in button
 * @param {HTMLElement} zoomOutBtn - The zoom out button
 * @param {HTMLElement} zoomLevel - The zoom level display element
 */
function setupZoomControls(zoomInBtn, zoomOutBtn, zoomLevel) {
    // Default zoom level
    let currentZoom = 100;
    
    // Zoom in
    zoomInBtn.addEventListener('click', () => {
        if (currentZoom < 200) {
            currentZoom += 10;
            updateZoom();
        }
    });
    
    // Zoom out
    zoomOutBtn.addEventListener('click', () => {
        if (currentZoom > 50) {
            currentZoom -= 10;
            updateZoom();
        }
    });
    
    // Update zoom level and apply to content
    function updateZoom() {
        zoomLevel.textContent = `${currentZoom}%`;
        
        const novelContent = document.getElementById('novel-content');
        if (novelContent) {
            novelContent.style.fontSize = `${currentZoom / 100}em`;
        }
        
        // Save zoom level in localStorage
        localStorage.setItem('novelContentZoom', currentZoom);
    }
    
    // Load saved zoom level on init
    const savedZoom = localStorage.getItem('novelContentZoom');
    if (savedZoom) {
        currentZoom = parseInt(savedZoom, 10);
        updateZoom();
    }
}

/**
 * Set up fullscreen toggle functionality
 * @param {HTMLElement} fullscreenBtn - The fullscreen toggle button
 */
function setupFullscreenToggle(fullscreenBtn) {
    let isFullscreen = false;
    
    fullscreenBtn.addEventListener('click', () => {
        const contentArea = document.querySelector('.content-area');
        const appContainer = document.querySelector('.app-container');
        
        if (!contentArea) return;
        
        if (!isFullscreen) {
            // Enter fullscreen
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            }
            
            // Update UI
            // Check if we're using the symbol or Font Awesome icon
            if (fullscreenBtn.innerHTML.includes('fa-')) {
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                fullscreenBtn.innerHTML = '⤓'; // Use compress symbol
            }
            fullscreenBtn.title = '退出全屏';
            
            // Update tooltip if it exists
            const tooltip = fullscreenBtn.querySelector('.tooltip');
            if (tooltip) {
                tooltip.textContent = '退出全屏';
            }
            
            isFullscreen = true;
            
            // Optional: Hide header or other elements for cleaner fullscreen
            if (appContainer) {
                appContainer.classList.add('fullscreen-mode');
            }
        } else {
            // Exit fullscreen
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
            
            // Update UI
            // Check if we're using the symbol or Font Awesome icon
            if (fullscreenBtn.innerHTML.includes('fa-')) {
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            } else {
                fullscreenBtn.innerHTML = '⛶'; // Use fullscreen symbol
            }
            fullscreenBtn.title = '全屏模式';
            
            // Update tooltip if it exists
            const tooltip = fullscreenBtn.querySelector('.tooltip');
            if (tooltip) {
                tooltip.textContent = '全屏模式';
            }
            
            isFullscreen = false;
            
            // Restore hidden elements
            if (appContainer) {
                appContainer.classList.remove('fullscreen-mode');
            }
        }
    });
    
    // Listen for fullscreen change events from browser
    document.addEventListener('fullscreenchange', () => {
        isFullscreen = !!document.fullscreenElement;
        
        // Update button icon
        if (isFullscreen) {
            // Check if we're using the symbol or Font Awesome icon
            if (fullscreenBtn.innerHTML.includes('fa-')) {
                fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                fullscreenBtn.innerHTML = '⤓'; // Use compress symbol
            }
            fullscreenBtn.title = '退出全屏';
            
            // Update tooltip if it exists
            const tooltip = fullscreenBtn.querySelector('.tooltip');
            if (tooltip) {
                tooltip.textContent = '退出全屏';
            }
        } else {
            // Check if we're using the symbol or Font Awesome icon
            if (fullscreenBtn.innerHTML.includes('fa-')) {
                fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
            } else {
                fullscreenBtn.innerHTML = '⛶'; // Use fullscreen symbol
            }
            fullscreenBtn.title = '全屏模式';
            
            // Update tooltip if it exists
            const tooltip = fullscreenBtn.querySelector('.tooltip');
            if (tooltip) {
                tooltip.textContent = '全屏模式';
            }
            
            // Restore UI
            const appContainer = document.querySelector('.app-container');
            if (appContainer) {
                appContainer.classList.remove('fullscreen-mode');
            }
        }
    });
}

/**
 * Add default sections to the right sidebar
 * @param {HTMLElement} sidebar - The right sidebar element
 */
function addDefaultSections(sidebar) {
    // Add a notes section
    addSection(sidebar, '笔记', createNotesContent());
    
    // Add a reference section
    addSection(sidebar, '参考资料', createReferenceContent());
    
    // Add a statistics section
    addSection(sidebar, '统计信息', createStatsContent());
}

/**
 * Add a section to the sidebar
 * @param {HTMLElement} sidebar - The sidebar element
 * @param {string} title - The section title
 * @param {HTMLElement} content - The section content
 */
function addSection(sidebar, title, content) {
    const section = document.createElement('div');
    section.className = 'right-sidebar-section';
    
    const heading = document.createElement('h3');
    heading.textContent = title;
    section.appendChild(heading);
    
    const contentContainer = document.createElement('div');
    contentContainer.className = 'right-sidebar-content';
    contentContainer.appendChild(content);
    section.appendChild(contentContainer);
    
    sidebar.appendChild(section);
}

/**
 * Create notes content element
 * @returns {HTMLElement} The notes content element
 */
function createNotesContent() {
    const notesContainer = document.createElement('div');
    
    const textarea = document.createElement('textarea');
    textarea.id = 'sidebar-notes';
    textarea.placeholder = '在这里记录你的笔记...';
    textarea.rows = 10;
    textarea.style.width = '100%';
    textarea.style.padding = '8px';
    textarea.style.border = '1px solid #e2e8f0';
    textarea.style.borderRadius = '4px';
    textarea.style.resize = 'vertical';
    
    // Load saved notes from localStorage
    const savedNotes = localStorage.getItem('userNotes');
    if (savedNotes) {
        textarea.value = savedNotes;
    }
    
    // Save notes when content changes
    textarea.addEventListener('input', () => {
        localStorage.setItem('userNotes', textarea.value);
    });
    
    notesContainer.appendChild(textarea);
    return notesContainer;
}

/**
 * Create reference content element
 * @returns {HTMLElement} The reference content element
 */
function createReferenceContent() {
    const refContainer = document.createElement('div');
    
    // Add a list of references
    const refList = document.createElement('ul');
    refList.style.listStyle = 'none';
    refList.style.padding = '0';
    refList.style.margin = '0';
    
    // Add sample reference items
    const refItems = [
        { title: '角色设定参考', id: 'character-ref' },
        { title: '世界观设定', id: 'world-ref' },
        { title: '写作风格指南', id: 'style-ref' }
    ];
    
    refItems.forEach(item => {
        const li = document.createElement('li');
        li.style.padding = '5px 0';
        
        const link = document.createElement('a');
        link.href = '#';
        link.textContent = item.title;
        link.id = item.id;
        link.style.textDecoration = 'none';
        link.style.color = '#3182ce';
        link.style.display = 'block';
        
        link.addEventListener('click', (e) => {
            e.preventDefault();
            // Handle reference item click (placeholder for future functionality)
            alert(`将来会打开${item.title}内容`);
        });
        
        li.appendChild(link);
        refList.appendChild(li);
    });
    
    refContainer.appendChild(refList);
    return refContainer;
}

/**
 * Create statistics content element
 * @returns {HTMLElement} The statistics content element
 */
function createStatsContent() {
    const statsContainer = document.createElement('div');
    
    // Create statistics display
    const statsList = document.createElement('ul');
    statsList.style.listStyle = 'none';
    statsList.style.padding = '0';
    statsList.style.margin = '0';
    
    // Add stat items (word count, chapter count, etc.)
    const statItems = [
        { label: '总字数', id: 'total-word-count', value: '0' },
        { label: '当前章节', id: 'current-chapter', value: '第1章' },
        { label: '写作时长', id: 'writing-time', value: '0分钟' }
    ];
    
    statItems.forEach(item => {
        const li = document.createElement('li');
        li.style.padding = '8px 0';
        li.style.borderBottom = '1px solid #edf2f7';
        
        const label = document.createElement('span');
        label.textContent = item.label + ': ';
        label.style.fontWeight = '600';
        
        const value = document.createElement('span');
        value.id = item.id;
        value.textContent = item.value;
        value.style.color = '#4a5568';
        
        li.appendChild(label);
        li.appendChild(value);
        statsList.appendChild(li);
    });
    
    statsContainer.appendChild(statsList);
    
    // Update statistics when novel content changes
    setTimeout(() => {
        const novelContent = document.getElementById('novel-content');
        if (novelContent) {
            const updateStats = () => {
                // Update word count
                const wordCount = novelContent.value.trim().length;
                const wordCountElement = document.getElementById('total-word-count');
                if (wordCountElement) {
                    wordCountElement.textContent = wordCount.toString();
                }
            };
            
            novelContent.addEventListener('input', updateStats);
            // Initial update
            updateStats();
        }
    }, 1000);
    
    return statsContainer;
}

// Export functions for potential use in other modules
export { setupRightSidebar }; 