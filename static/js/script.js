// Import API Key Management
import { setApiKey, getApiKey } from './api-keys.js';

document.addEventListener('DOMContentLoaded', () => {
    // Initialize API key input
    initializeApiKeyInput();
    
    // Add CSS for sidebar selects and collapsible sidebar
    const style = document.createElement('style');
    style.textContent = `
        .select-container {
            padding: 5px 0;
            width: 100%;
        }
        .sidebar-select {
            width: 100%;
            padding: 6px 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: #f8f9fa;
            color: #333;
            font-size: 0.9rem;
            cursor: pointer;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sidebar-select:hover, .sidebar-select:focus {
            border-color: #3182ce;
            box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.1);
            outline: none;
        }
        .sidebar-select option {
            padding: 6px;
        }
        
        /* Collapsible sidebar styles */
        .main-content {
            display: flex;
            transition: all 0.3s ease;
        }
        
        .sidebar {
            width: 180px !important;
            flex-shrink: 0;
            position: relative;
            transition: width 0.3s ease;
            overflow-x: hidden;
            overflow-y: auto;
        }
        
        .content-area {
            flex-grow: 1;
            transition: all 0.3s ease;
        }
        
        .sidebar.collapsed {
            width: 40px !important;
            overflow-y: auto; /* Add this */
            overflow-x: hidden; /* Keep horizontal overflow hidden */
        }
        
        .sidebar.collapsed .sidebar-section h2 {
            font-size: 0;
            padding: 8px 0;
            text-align: center;
        }
        
        .sidebar.collapsed .sidebar-section h2:after {
            font-family: "Font Awesome 5 Free";
            font-weight: 900;
            content: "\\f0c9"; /* fa-bars */
            font-size: 16px;
            display: inline-block;
        }
        
        .sidebar.collapsed .select-container,
        .sidebar.collapsed ul li,
        .sidebar.collapsed .sidebar-section > *:not(h2) {
            display: none;
        }
        
        /* Show icons in collapsed mode for visual reference */
        .sidebar.collapsed .sidebar-section h2[data-section="novels"]:after {
            content: "\\f02d"; /* fa-book */
        }
        
        .sidebar.collapsed .sidebar-section h2[data-section="characters"]:after {
            content: "\\f007"; /* fa-user */
        }
        
        .sidebar.collapsed .sidebar-section h2[data-section="glossary"]:after {
            content: "\\f02e"; /* fa-bookmark */
        }
        
        .sidebar.collapsed .sidebar-section h2[data-section="styles"]:after {
            content: "\\f1fc"; /* fa-paint-brush */
        }
        
        .sidebar.collapsed .sidebar-section h2[data-section="tools"]:after {
            content: "\\f7d9"; /* fa-toolbox */
        }
        
        .toggle-sidebar-btn {
            position: absolute;
            /* top: 8px; Removed fixed top */
            top: 50%; /* Position top edge at midpoint */
            right: 6px; 
            background: rgba(0, 0, 0, 0.1); 
            border: 1px solid rgba(0,0,0,0.2); 
            border-radius: 50%;
            width: 26px; 
            height: 26px; 
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 100;
            font-size: 12px; 
            padding: 0;
            transform: translateY(-50%); /* Shift up by half its height for centering */
            transition: transform 0.3s ease, background-color 0.2s ease, box-shadow 0.2s ease;
            color: #333; 
            box-shadow: 0 1px 3px rgba(0,0,0,0.1); 
        }
        
        .sidebar.collapsed .toggle-sidebar-btn {
            /* Combine vertical centering and rotation */
            transform: translateY(-50%) rotate(180deg);
            right: 7px; 
            /* top: 7px; Removed fixed top for collapsed state */
        }
        
        .toggle-sidebar-btn:hover {
            background: #e2e8f0;
            color: #2d3748;
        }
        
        /* Add hover effect to collapsed sidebar */
        .sidebar.collapsed:hover {
            width: 180px !important;
            box-shadow: 4px 0 8px rgba(0, 0, 0, 0.1);
            z-index: 10;
        }
        
        .sidebar.collapsed:hover .sidebar-section h2 {
            font-size: 1em;
            text-align: left;
            padding: 10px 15px;
        }
        
        .sidebar.collapsed:hover .sidebar-section h2:after {
            display: none;
        }
        
        .sidebar.collapsed:hover .select-container,
        .sidebar.collapsed:hover ul li,
        .sidebar.collapsed:hover .sidebar-section > *:not(h2) {
            display: block;
        }
        
        /* Quick animation for expanding content */
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        .sidebar.collapsed:hover .select-container,
        .sidebar.collapsed:hover ul li,
        .sidebar.collapsed:hover .sidebar-section > *:not(h2) {
            animation: fadeIn 0.3s ease;
        }
    `;
    document.head.appendChild(style);
    
    // Setup sidebar toggle functionality
    setupSidebarToggle();
    
    const modelSelect = document.getElementById('model-select');
    const novelList = document.getElementById('novel-list');
    const statusIndicator = document.getElementById('status-indicator');
    const newNovelBtn = document.getElementById('new-novel-btn');
    const importNovelBtn = document.getElementById('import-novel-btn');
    const importFileInput = document.getElementById('import-file-input');
    const generateBtn = document.getElementById('generate-btn');
    const continueBtn = document.getElementById('continue-btn');
    const promptInput = document.getElementById('prompt-input');
    const novelContent = document.getElementById('novel-content');
    const outputText = document.getElementById('output-text');
    const generatedOutputDiv = document.getElementById('generated-output');
    const writingArea = document.getElementById('writing-area');
    const welcomeScreen = document.getElementById('welcome-screen');
    const writingNovelTitle = document.getElementById('writing-novel-title');
    const toolboxArea = document.getElementById('toolbox-area');
    const toolboxBtns = document.querySelectorAll('.tool-btn');
    const toolboxTitle = document.getElementById('toolbox-title');
    const toolboxPrompt = document.getElementById('toolbox-prompt');
    const toolboxGenerateBtn = document.getElementById('toolbox-generate-btn');
    const toolboxOutputText = document.getElementById('toolbox-output-text');
    const toolboxOutputDiv = document.getElementById('toolbox-output');
    const saveNovelBtn = document.getElementById('save-novel-btn');
    // Character Library elements
    const characterList = document.getElementById('character-list');
    const characterLibraryList = document.getElementById('character-library-list');
    const characterLibraryArea = document.getElementById('character-library-area');
    const openCharacterLibraryBtn = document.getElementById('open-character-library-btn');
    const characterDetail = document.getElementById('character-detail');
    const addToNovelBtn = document.getElementById('add-to-novel-btn');
    const deleteCharacterBtn = document.getElementById('delete-character-btn');
    const saveCharacterBtn = document.getElementById('save-character-btn');
    const newCharacterBtn = document.getElementById('new-character-btn');
    const editCharacterBtn = document.getElementById('edit-character-btn');
    const characterViewPanel = document.getElementById('character-view-panel');
    const characterEditPanel = document.getElementById('character-edit-panel');
    const characterForm = document.getElementById('character-form');
    const characterNameInput = document.getElementById('character-name-input');
    const characterDescriptionInput = document.getElementById('character-description-input');
    const characterCancelBtn = document.getElementById('character-cancel-btn');
    const characterSaveBtn = document.getElementById('character-save-btn');
    const characterEditTitle = document.getElementById('character-edit-title');
    const copyToolboxOutputBtn = document.getElementById('copy-toolbox-output-btn');
    // Metadata Inputs
    const charactersInput = document.getElementById('characters-input');
    const knowledgeInput = document.getElementById('knowledge-input');
    const stylePromptInput = document.getElementById('style-prompt-input');
    // Export Buttons
    const exportTxtBtn = document.getElementById('export-txt-btn');
    const exportJsonBtn = document.getElementById('export-json-btn');
    const exportDocxBtn = document.getElementById('export-docx-btn');
    const saveToGlossaryBtn = document.getElementById('save-to-glossary-btn'); // New button
    // Word Count Display
    const wordCountDisplay = document.getElementById('word-count-display');
    // Glossary Library elements
    const glossaryList = document.getElementById('glossary-list');
    const glossaryLibraryList = document.getElementById('glossary-library-list');
    const glossaryArea = document.getElementById('glossary-area');
    const openGlossaryBtn = document.getElementById('open-glossary-btn');
    const glossaryDetail = document.getElementById('glossary-detail');
    const newGlossaryEntryBtn = document.getElementById('new-glossary-entry-btn');
    const glossaryCategoryFilter = document.getElementById('glossary-category-filter');
    const editGlossaryBtn = document.getElementById('edit-glossary-btn');
    const addGlossaryToNovelBtn = document.getElementById('add-glossary-to-novel-btn');
    const deleteGlossaryBtn = document.getElementById('delete-glossary-btn');
    const glossaryViewPanel = document.getElementById('glossary-view-panel');
    const glossaryEditPanel = document.getElementById('glossary-edit-panel');
    const glossaryForm = document.getElementById('glossary-form');
    const glossaryTermInput = document.getElementById('glossary-term-input');
    const glossaryCategoryInput = document.getElementById('glossary-category-input');
    const glossaryDescriptionInput = document.getElementById('glossary-description-input');
    const glossaryCancelBtn = document.getElementById('glossary-cancel-btn');
    const glossarySaveBtn = document.getElementById('glossary-save-btn');
    const glossaryEditTitle = document.getElementById('glossary-edit-title');
    // Style Library elements
    const styleList = document.getElementById('style-list');
    const styleLibraryList = document.getElementById('style-library-list');
    const styleArea = document.getElementById('style-area');
    const openStyleLibraryBtn = document.getElementById('open-style-library-btn');
    const styleDetail = document.getElementById('style-detail');
    const newStyleBtn = document.getElementById('new-style-btn');
    const importMdStyleBtn = document.getElementById('import-md-style-btn');
    const styleCategoryFilter = document.getElementById('style-category-filter');
    const editStyleBtn = document.getElementById('edit-style-btn');
    const addStyleToNovelBtn = document.getElementById('add-style-to-novel-btn');
    const deleteStyleBtn = document.getElementById('delete-style-btn');
    const styleViewPanel = document.getElementById('style-view-panel');
    const styleEditPanel = document.getElementById('style-edit-panel');
    const styleForm = document.getElementById('style-form');
    const styleNameInput = document.getElementById('style-name-input');
    const styleCategoryInput = document.getElementById('style-category-input');
    const styleContentInput = document.getElementById('style-content-input');
    const styleCancelBtn = document.getElementById('style-cancel-btn');
    const styleSaveBtn = document.getElementById('style-save-btn');
    const styleEditTitle = document.getElementById('style-edit-title');

    // Collapsible settings in writing area
    const toggleWritingSettingsBtn = document.getElementById('toggle-writing-settings-btn');
    const collapsibleWritingSettings = document.getElementById('collapsible-writing-settings');

    if (toggleWritingSettingsBtn && collapsibleWritingSettings) {
        toggleWritingSettingsBtn.addEventListener('click', () => {
            collapsibleWritingSettings.classList.toggle('collapsed');
            toggleWritingSettingsBtn.classList.toggle('collapsed');
            const isCollapsed = collapsibleWritingSettings.classList.contains('collapsed');
            toggleWritingSettingsBtn.setAttribute('aria-expanded', !isCollapsed);
        });
        // To start expanded by default, no class is added initially.
        // If you want it to start collapsed, uncomment below:
        // collapsibleWritingSettings.classList.add('collapsed');
        // toggleWritingSettingsBtn.classList.add('collapsed');
        // toggleWritingSettingsBtn.setAttribute('aria-expanded', 'false');
    }

    // Global variables
    let currentNovelId = localStorage.getItem('currentNovelId') || null; // Try to get from localStorage first
    let currentChapterId = null; // Track current chapter ID
    let characterTags = []; // Replace with character data structure
    let glossaryTags = []; // Replace with glossary data structure
    let styleTags = []; // Replace with style data structure
    let wsSendQueue = []; // Queue for messages waiting to be sent
    let wsConnectionEstablished = false; // Flag to track WebSocket connection status

    // Expose currentNovelId to window for modules to access
    window.currentNovelId = currentNovelId;

    let currentCharacterId = null; // Track the currently selected character
    let currentGlossaryId = null; // Track the currently selected glossary entry
    let currentStyleId = null; // Track the currently selected style entry
    let isSaving = false;
    let lastGeneratedCharacter = null; // Store the last generated character for saving
    let glossaryEntries = []; // Store all glossary entries
    let glossaryCategories = new Set(); // Store unique categories
    let styleEntries = []; // Store all style entries
    let styleCategories = new Set(); // Store unique categories

    // Add temperature and context length variables
    let currentTemperature = 0.7;

    // --- Initialization ---

    // Initialize API Key Input
    function initializeApiKeyInput() {
        const apiKeyInput = document.getElementById('api-key-input');
        const saveApiKeyBtn = document.getElementById('save-api-key-btn');
        
        // Check API key status on the server
        async function checkApiKeyStatus() {
            try {
                const response = await fetch('/api/api-key-status');
                if (response.ok) {
                    const data = await response.json();
                    if (data.has_key) {
                        // If server has key, show preview
                        apiKeyInput.value = '';
                        apiKeyInput.placeholder = data.key_preview || "API密钥已设置 (点击保存可更新)";
                        updateStatus('API密钥已设置');
                    } else {
                        // Try to use key from localStorage if server has none
                        const localKey = getApiKey();
                        if (localKey) {
                            apiKeyInput.value = localKey;
                        }
                        updateStatus('请设置OpenRouter API密钥');
                    }
                }
            } catch (error) {
                console.error('Error checking API key status:', error);
                // Fallback to localStorage
                const localKey = getApiKey();
                if (localKey) {
                    apiKeyInput.value = localKey;
                }
            }
        }
        
        // Check status when initializing
        checkApiKeyStatus();
        
        // Save API key when button is clicked
        saveApiKeyBtn.addEventListener('click', async () => {
            const newApiKey = apiKeyInput.value.trim();
            if (!newApiKey) {
                updateStatus('请输入API密钥', true);
                return;
            }

            if (!newApiKey.startsWith('sk-')) {
                updateStatus('无效的API密钥格式，OpenRouter API密钥应以\'sk-\'开头', true);
                return;
            }

            try {
                const response = await fetch('/api/set-api-key', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ api_key: newApiKey })
                });
                
                const data = await response.json();
                if (response.ok) {
                    setApiKey(newApiKey);
                    updateStatus('API密钥已成功保存并验证');
                    // Clear input and show placeholder with preview
                    apiKeyInput.value = '';
                    apiKeyInput.placeholder = `${newApiKey.substring(0, 7)}...${newApiKey.slice(-4)} (点击保存可更新)`;
                    // 重新加载模型列表
                    await fetchModels();
                } else {
                    updateStatus(data.error || '保存API密钥时出错', true);
                }
            } catch (error) {
                console.error('Error saving API key:', error);
                updateStatus('保存API密钥时发生错误，请重试', true);
            }
        });
    }

    function updateStatus(message, isError = false) {
        statusIndicator.textContent = message;
        statusIndicator.style.color = isError ? 'red' : '#a0aec0'; // Use CSS color for normal
        console.log(`Status: ${message}`);
        if (isError) console.error(message);
    }

    // 保存用户选择的模型ID到localStorage
    function saveSelectedModel(modelId) {
        if (modelId) {
            localStorage.setItem('selectedModelId', modelId);
            console.log(`Saved selected model ID to localStorage: ${modelId}`);
        }
    }

    // 从localStorage获取用户选择的模型ID
    function getSelectedModel() {
        return localStorage.getItem('selectedModelId');
    }

    async function fetchModels() {
        updateStatus('正在加载模型...');
        try {
            const response = await fetch('/api/models');
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) { /* Ignore if response is not JSON */ }
                throw new Error(errorMsg);
            }
            const models = await response.json();

            modelSelect.innerHTML = '<option value="">-- 请选择模型 --</option>';
            if (models && models.length > 0) {
                models.forEach(model => {
                    const option = document.createElement('option');
                    option.value = model.id; // Use model ID for value
                    option.textContent = model.name; // Use model name for display
                    modelSelect.appendChild(option);
                });

                // 获取用户之前选择的模型ID
                const savedModelId = getSelectedModel();
                
                // 如果有保存的模型ID，尝试选择它
                if (savedModelId) {
                    // 检查保存的模型是否仍然可用
                    const modelExists = Array.from(modelSelect.options).some(option => option.value === savedModelId);
                    
                    if (modelExists) {
                        modelSelect.value = savedModelId;
                        console.log(`Restored saved model selection: ${savedModelId}`);
                    } else {
                        // 如果保存的模型不再可用，选择第一个可用的模型
                        if (models.length > 0) {
                            modelSelect.value = models[0].id;
                            console.log(`Saved model ${savedModelId} not available, selected first model: ${models[0].id}`);
                            // 更新保存的模型ID
                            saveSelectedModel(models[0].id);
                        }
                    }
                } else {
                    // 没有保存的模型ID，选择第一个可用的模型
                    if (models.length > 0) {
                        modelSelect.value = models[0].id;
                        console.log(`Selected first available model: '${models[0].name}' (ID: ${models[0].id}).`);
                    }
                }

                updateStatus('模型加载完毕。');
            } else {
                modelSelect.innerHTML = '<option value="">-- 未找到模型 --</option>';
                updateStatus('未能通过API找到模型。', true);
            }
        } catch (error) {
            console.error('Error fetching models:', error);
            modelSelect.innerHTML = '<option value="">-- 加载模型出错 --</option>';
            const errorText = `加载模型出错: ${error.message}`; // Generic error message
            updateStatus(errorText, true);
        }
    }

    // ... 其他代码 ...

    async function fetchNovels() {
        updateStatus('正在加载小说列表...');
        try {
            const response = await fetch('/api/novels');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const novels = await response.json();
            novelList.innerHTML = ''; // Clear loading message
            if (novels && novels.length > 0) {
                novels.forEach(novel => {
                    const li = document.createElement('li');
                    li.dataset.novelId = novel.id; // Store ID on the li itself

                    const titleSpan = document.createElement('span');
                    titleSpan.textContent = novel.title;
                    titleSpan.classList.add('novel-title');
                    titleSpan.style.flexGrow = '1'; // Allow title to take space
                    titleSpan.style.cursor = 'pointer';
                    titleSpan.addEventListener('click', () => loadNovel(novel.id));

                    // Create edit button
                    const editBtn = document.createElement('button');
                    editBtn.innerHTML = '<i class="fas fa-edit"></i>'; // Use Font Awesome edit icon
                    editBtn.title = `编辑小说名称 '${novel.title}'`;
                    editBtn.classList.add('edit-novel-btn'); // Add class for styling
                    editBtn.style.marginLeft = '5px';
                    editBtn.style.padding = '2px 5px';
                    editBtn.style.border = 'none';
                    editBtn.style.background = 'none';
                    editBtn.style.color = '#3182ce'; // Blue color
                    editBtn.style.cursor = 'pointer';
                    editBtn.style.fontSize = '0.9em';

                    editBtn.addEventListener('click', (event) => {
                        event.stopPropagation(); // Prevent li click event when clicking button
                        editNovelTitle(li, novel.id, titleSpan.textContent);
                    });

                    const deleteBtn = document.createElement('button');
                    deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Use Font Awesome icon
                    deleteBtn.title = `删除小说 '${novel.title}'`;
                    deleteBtn.classList.add('delete-novel-btn'); // Add class for styling
                    deleteBtn.style.marginLeft = '5px';
                    deleteBtn.style.padding = '2px 5px';
                    deleteBtn.style.border = 'none';
                    deleteBtn.style.background = 'none';
                    deleteBtn.style.color = '#e53e3e'; // Red color
                    deleteBtn.style.cursor = 'pointer';
                    deleteBtn.style.fontSize = '0.9em';

                    deleteBtn.addEventListener('click', (event) => {
                        event.stopPropagation(); // Prevent li click event when clicking button
                        if (confirm(`您确定要删除小说 "${novel.title}" 吗？此操作无法撤销。`)) {
                            deleteNovelById(novel.id);
                        }
                    });

                    li.appendChild(titleSpan);
                    li.appendChild(editBtn);
                    li.appendChild(deleteBtn);
                    novelList.appendChild(li);
                });
                updateStatus('小说列表加载完毕。');
            } else {
                novelList.innerHTML = '<li>未找到任何小说。请创建一个！</li>';
                updateStatus('尚无小说。');
            }
        } catch (error) {
            console.error('Error fetching novels:', error);
            novelList.innerHTML = '<li>加载小说列表出错。</li>';
            updateStatus(`加载小说列表出错: ${error.message}`, true);
        }
    }

    // Function to edit novel title
    function editNovelTitle(listItem, novelId, currentTitle) {
        // Create an input field to replace the title span
        const titleSpan = listItem.querySelector('.novel-title');
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.value = currentTitle;
        titleInput.style.width = '100%';
        titleInput.style.fontSize = '0.9em';
        titleInput.style.padding = '2px 5px';
        titleInput.style.borderRadius = '3px';
        titleInput.style.border = '1px solid #CBD5E0';
        
        // Hide the title span and buttons temporarily
        titleSpan.style.display = 'none';
        const editBtn = listItem.querySelector('.edit-novel-btn');
        const deleteBtn = listItem.querySelector('.delete-novel-btn');
        editBtn.style.display = 'none';
        deleteBtn.style.display = 'none';
        
        // Create save and cancel buttons
        const saveBtn = document.createElement('button');
        saveBtn.innerHTML = '<i class="fas fa-check"></i>'; // Check/save icon
        saveBtn.title = '保存修改';
        saveBtn.style.marginLeft = '5px';
        saveBtn.style.padding = '2px 5px';
        saveBtn.style.border = 'none';
        saveBtn.style.background = 'none';
        saveBtn.style.color = '#48BB78'; // Green color
        saveBtn.style.cursor = 'pointer';
        saveBtn.style.fontSize = '0.9em';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.innerHTML = '<i class="fas fa-times"></i>'; // X/cancel icon
        cancelBtn.title = '取消修改';
        cancelBtn.style.marginLeft = '5px';
        cancelBtn.style.padding = '2px 5px';
        cancelBtn.style.border = 'none';
        cancelBtn.style.background = 'none';
        cancelBtn.style.color = '#A0AEC0'; // Gray color
        cancelBtn.style.cursor = 'pointer';
        cancelBtn.style.fontSize = '0.9em';
        
        // Insert the new elements
        listItem.insertBefore(titleInput, titleSpan);
        listItem.appendChild(saveBtn);
        listItem.appendChild(cancelBtn);
        
        // Focus on the input and select all text
        titleInput.focus();
        titleInput.select();
        
        // Prevent clicking on the list item from loading the novel
        listItem.style.pointerEvents = 'none';
        titleInput.style.pointerEvents = 'auto';
        saveBtn.style.pointerEvents = 'auto';
        cancelBtn.style.pointerEvents = 'auto';
        
        // Handle save button click
        saveBtn.addEventListener('click', async () => {
            const newTitle = titleInput.value.trim();
            if (!newTitle) {
                alert('书名不能为空');
                return;
            }
            
            if (newTitle !== currentTitle) {
                await saveNovelTitle(novelId, newTitle);
            }
            
            // Restore the original elements
            restoreOriginalElements();
        });
        
        // Handle cancel button click
        cancelBtn.addEventListener('click', () => {
            restoreOriginalElements();
        });
        
        // Handle Enter key to save and Escape key to cancel
        titleInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                saveBtn.click();
            } else if (event.key === 'Escape') {
                cancelBtn.click();
            }
        });
        
        // Function to restore the original elements
        function restoreOriginalElements() {
            // Remove input and buttons
            listItem.removeChild(titleInput);
            listItem.removeChild(saveBtn);
            listItem.removeChild(cancelBtn);
            
            // Show original elements again
            titleSpan.style.display = '';
            editBtn.style.display = '';
            deleteBtn.style.display = '';
            
            // Restore pointer events
            listItem.style.pointerEvents = '';
        }
    }
    
    // Function to save the new novel title to the server
    async function saveNovelTitle(novelId, newTitle) {
        updateStatus('正在保存小说标题...');
        try {
            const response = await fetch(`/api/novels/${novelId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newTitle })
            });
            
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) { /* Ignore if response is not JSON */ }
                throw new Error(errorMsg);
            }
            
            // Update UI with new title
            const listItem = document.querySelector(`#novel-list li[data-novel-id="${novelId}"]`);
            if (listItem) {
                const titleSpan = listItem.querySelector('.novel-title');
                titleSpan.textContent = newTitle;
                
                // Update edit and delete button titles
                const editBtn = listItem.querySelector('.edit-novel-btn');
                const deleteBtn = listItem.querySelector('.delete-novel-btn');
                editBtn.title = `编辑小说名称 '${newTitle}'`;
                deleteBtn.title = `删除小说 '${newTitle}'`;
                
                // Update the novel title in the writing area if it's the currently loaded novel
                if (currentNovelId === novelId) {
                    writingNovelTitle.textContent = newTitle;
                }
            }
            
            updateStatus('小说标题已更新');
        } catch (error) {
            console.error('Error saving novel title:', error);
            updateStatus(`保存小说标题出错: ${error.message}`, true);
            alert(`保存小说标题失败: ${error.message}`);
        }
    }

    // --- Novel Management ---

    /**
     * Open a novel and display its content
     */
    async function loadNovel(novelId) {
        if (!novelId) {
            console.error('Invalid novel ID');
            alert('无效的小说ID');
            return null;
        }
        hideAllContentAreas();
        try {
            console.log('Loading novel ID:', novelId);
            const response = await fetch(`/api/novels/${novelId}`);
            
            if (!response.ok) {
                // Clear the possibly corrupted novel ID from localStorage
                if (localStorage.getItem('currentNovelId') === novelId) {
                    localStorage.removeItem('currentNovelId');
                }
                
                const errorText = await response.text();
                console.error('Novel load error:', response.status, errorText);
                throw new Error(`Failed to load novel: ${response.status} ${response.statusText}`);
            }
            
            const novel = await response.json();
            console.log('Novel loaded successfully:', novel.title);
            
            // Hide welcome screen and show writing area
            welcomeScreen.classList.add('hidden');
            writingArea.classList.remove('hidden');
            if (toolboxArea) toolboxArea.classList.add('hidden');
            
            // Set novel content and metadata
            novelContent.value = novel.content || '';

            // Populate global tag arrays from saved data first
            novelCharacters = novel.character_tags || [];
            novelGlossaryTags = novel.glossary_tags || [];
            novelStyleTags = novel.style_tags || [];

            // Render tags to the UI based on the populated global arrays
            renderCharacterTags();
            updateGlossaryTagsDisplay();
            updateStyleTagsDisplay();

            // Set input values. Prioritize direct saved prompt text.
            // If not available (undefined or null or empty string), then generate from the (now updated) global tag arrays.
            if (novel.characters !== undefined && novel.characters !== null && novel.characters.trim() !== '') {
                charactersInput.value = novel.characters;
            } else {
                updateCharactersInput(); // Fallback to generating from novelCharacters
            }

            if (novel.knowledge !== undefined && novel.knowledge !== null && novel.knowledge.trim() !== '') {
                knowledgeInput.value = novel.knowledge;
            } else {
                updateKnowledgeInput(); // Fallback to generating from novelGlossaryTags
            }

            if (novel.style_prompt !== undefined && novel.style_prompt !== null && novel.style_prompt.trim() !== '') {
                stylePromptInput.value = novel.style_prompt;
            } else {
                updateStylePromptInput(); // Fallback to generating from novelStyleTags
            }
            
            // Update title
            if (writingNovelTitle) {
                writingNovelTitle.textContent = novel.title;
            }
            
            // Update active state in novel list
            updateNovelListActiveState(novelId);
            
            // Update current novel ID and clear current chapter ID
            currentNovelId = novelId;
            window.currentNovelId = novelId; // Update the exposed variable
            localStorage.setItem('currentNovelId', novelId); // Store in localStorage for persistence
            currentChapterId = null;
            
            // Update word count
            updateWordCount();
            
            // Set last saved content for change detection
            novelContent.dataset.lastSaved = novel.content || '';
            novelContent.dataset.hasChanges = 'false';
            
            // Dispatch novel selected event for chapter manager
            document.dispatchEvent(new CustomEvent('novelSelected', {
                detail: { novelId: novelId }
            }));
            
            return novel;
        } catch (error) {
            console.error('Error loading novel:', error);
            alert('加载小说失败，请重试。错误：' + error.message);
            return null;
        }
    }

    // Function to parse characters from text input (for backwards compatibility)
    function parseCharactersFromText() {
        // Only parse if we don't already have character tags
        if (novelCharacters.length === 0) {
            const characterText = charactersInput.value.trim();
            if (!characterText) return;
            
            // Split by double newlines to separate characters
            const characterBlocks = characterText.split(/\n\s*\n/);
            
            // Process each block
            characterBlocks.forEach(block => {
                const trimmedBlock = block.trim();
                if (!trimmedBlock) return;
                
                // Check if there's a name pattern like "Name: Description"
                const nameMatch = trimmedBlock.match(/^(.+?)[:：](.+)$/s);
                
                if (nameMatch) {
                    const name = nameMatch[1].trim();
                    const description = nameMatch[2].trim();
                    
                    // Create a character object
                    const character = {
                        id: 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        name: name,
                        description: trimmedBlock
                    };
                    
                    // Add to character array if not already there
                    if (!novelCharacters.some(c => c.name === name)) {
                        novelCharacters.push(character);
                    }
                } else {
                    // If no clear name pattern, treat the first line as name
                    const lines = trimmedBlock.split('\n');
                    const name = lines[0].trim();
                    
                    // Create a character object
                    const character = {
                        id: 'temp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        name: name,
                        description: trimmedBlock
                    };
                    
                    // Add to character array if not already there
                    if (!novelCharacters.some(c => c.name === name)) {
                        novelCharacters.push(character);
                    }
                }
            });
            
            // Render the character tags
            renderCharacterTags();
        }
    }
    
    // Function to create a new novel and reset all tag arrays
    async function createNewNovel() {
        // Reset all tag arrays
        novelCharacters = [];
        novelGlossaryTags = [];
        novelStyleTags = [];
        
        // Rest of the existing function
        const title = prompt("请输入新小说的标题:", "新小说");
        if (!title) return; // User canceled
        
        try {
            updateStatus('正在创建新小说...');
            
            const response = await fetch('/api/novels', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const novel = await response.json();
            
            // Store in localStorage
            currentNovelId = novel.id;
            window.currentNovelId = novel.id; // Update the exposed variable
            localStorage.setItem('currentNovelId', novel.id);
            
            // Add the new novel to the list
            const li = document.createElement('li');
            li.dataset.novelId = novel.id;
            li.innerHTML = `<span>${title}</span>`;
            li.addEventListener('click', () => loadNovel(novel.id));
            
            // Add edit button
            const editBtn = document.createElement('button');
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.title = `编辑小说 '${title}' 标题`;
            editBtn.classList.add('edit-novel-btn');
            editBtn.style.marginLeft = '5px';
            editBtn.style.padding = '2px 5px';
            editBtn.style.border = 'none';
            editBtn.style.background = 'none';
            editBtn.style.color = '#3182ce';
            editBtn.style.cursor = 'pointer';
            
            editBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                editNovelTitle(li, novel.id, title);
            });
            
            // Add delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i>';
            deleteBtn.title = `删除小说 '${title}'`;
            deleteBtn.classList.add('delete-novel-btn');
            deleteBtn.style.marginLeft = '5px';
            deleteBtn.style.padding = '2px 5px';
            deleteBtn.style.border = 'none';
            deleteBtn.style.background = 'none';
            deleteBtn.style.color = '#e53e3e';
            deleteBtn.style.cursor = 'pointer';
            
            deleteBtn.addEventListener('click', (event) => {
                event.stopPropagation();
                if (confirm(`您确定要删除小说 "${title}" 吗？此操作无法撤销。`)) {
                    deleteNovelById(novel.id);
                }
            });
            
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
            
            // Add to list
            const firstNovel = novelList.querySelector('li');
            if (firstNovel && firstNovel.textContent === '未找到任何小说。请创建一个！') {
                novelList.innerHTML = '';
            }
            novelList.appendChild(li);
            
            // Open the new novel
            loadNovel(novel.id);
            
            updateStatus(`新小说 '${title}' 已创建。`);
            
        } catch (error) {
            console.error("Error creating novel:", error);
            updateStatus(`创建小说失败: ${error.message}`, true);
        }
    }

    /**
     * Save the current novel content and metadata
     */
    async function saveNovelContent() {
        if (!currentNovelId) {
            updateStatus('保存失败：未选择小说', true);
            return;
        }

        const content = novelContent.value;
        const characters = charactersInput.value;
        const knowledge = knowledgeInput.value;
        const stylePrompt = stylePromptInput.value;

        try {
            // Determine if we're saving to a chapter or main novel content
            let url, data;
            
            if (currentChapterId) {
                // Saving to a chapter
                url = `/api/novels/${currentNovelId}/chapters/${currentChapterId}`;
                data = { content };
            } else {
                // Saving to main novel content
                url = `/api/novels/${currentNovelId}`;
                data = {
                    content,
                    characters,
                    knowledge,
                    style_prompt: stylePrompt,
                    character_tags: novelCharacters, // 使用正确的全局变量
                    glossary_tags: novelGlossaryTags, // 使用正确的全局变量
                    style_tags: novelStyleTags // 使用正确的全局变量
                };
            }
            
            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                updateStatus('保存成功');
                
                // Update the last saved content
                novelContent.dataset.lastSaved = content;
                novelContent.dataset.hasChanges = 'false';
                
                // The rest of the metadata is only saved with the main novel content
                if (!currentChapterId) {
                    updateCharactersInput();
                    updateKnowledgeInput();
                    updateStylePromptInput();
                }
                
                return true;
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error saving novel content:', error);
            updateStatus(`保存失败: ${error.message}`, true);
            return false;
        }
    }

    async function deleteNovelById(novelId) {
        if (!novelId) return;

        updateStatus(`正在删除小说 ${novelId}...`);
        try {
            const response = await fetch(`/api/novels/${novelId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (e) { /* Ignore */ }
                throw new Error(errorMsg);
            }

            const result = await response.json();
            updateStatus(result.message || `小说 ${novelId} 已删除。`);

            // Remove the novel from the list UI
            const listItem = novelList.querySelector(`li[data-novel-id="${novelId}"]`);
            if (listItem) {
                listItem.remove();
            }

            // If the deleted novel was the currently loaded one, clear the editor
            if (currentNovelId === novelId) {
                writingArea.classList.add('hidden');
                welcomeScreen.classList.remove('hidden');
                currentNovelId = null;
                window.currentNovelId = null; // Update the exposed variable
                localStorage.removeItem('currentNovelId');
                
                // 检查元素是否存在后再设置textContent
                if (writingNovelTitle) {
                    writingNovelTitle.textContent = "小说标题"; // Reset title
                }
                novelContent.value = '';
                charactersInput.value = '';
                knowledgeInput.value = '';
                stylePromptInput.value = '';
                promptInput.value = '';
            }

             // Check if the list is now empty
             if (novelList.children.length === 0) {
                 novelList.innerHTML = '<li>未找到任何小说。请创建一个！</li>';
                 updateStatus('尚无小说。');
             }

        } catch (error) {
            console.error(`Error deleting novel ${novelId}:`, error);
            const errorText = `删除小说失败: ${error.message}`;
            updateStatus(errorText, true);
            alert(errorText);
        }
    }

    // --- Text Generation ---

    async function generateText(isContinuation = false) {
        const selectedModel = modelSelect.value;
        const currentPrompt = promptInput.value.trim();
        let currentContent = novelContent.value; // Use let for modification

        if (!selectedModel) {
            alert("请先选择一个 AI 模型。");
            return;
        }
        if (!currentNovelId) {
            alert("请先加载或创建一部小说。");
            return;
        }

        let fullPrompt = "";
        if (isContinuation) {
            // Basic continuation: use existing content as context
            if (!currentContent.trim()) {
                alert("小说内容为空，无法继续。");
                return;
            }
            fullPrompt = currentContent; // Send the entire current content as prompt
            updateStatus(`正在使用 ${selectedModel} 继续写作...`);
        } else {
            if (!currentPrompt) {
                alert("请输入提示。");
                return;
            }
            // Construct prompt with metadata and user prompt
            fullPrompt = ``;
            if (stylePromptInput.value.trim()) {
                fullPrompt += `风格提示:\n${stylePromptInput.value.trim()}\n\n`;
            }
            if (charactersInput.value.trim()) {
                fullPrompt += `角色设定:\n${charactersInput.value.trim()}\n\n`;
            }
            if (knowledgeInput.value.trim()) {
                fullPrompt += `关联知识:\n${knowledgeInput.value.trim()}\n\n`;
            }
            // Include last part of content, unless it's empty
            if (currentContent.trim()) {
                fullPrompt += `当前内容 (最后 500 字符):
${currentContent.slice(-500)}
\n`;
            }
            fullPrompt += `写作提示:
${currentPrompt}`;
            // Note: Could also include currentContent as context here if desired.

            updateStatus(`正在根据提示使用 ${selectedModel} 生成文本...`);
        }

        // --- Streaming Update START ---
        // Store original cursor position for insertion
        const cursorPosition = novelContent.selectionStart || novelContent.value.length;
        let insertPosition = cursorPosition;
        
        // Clear previous prompt input if not continuation
        if (!isContinuation) promptInput.value = '';
        
        // Remove the placeholder logic
        // const generatingText = "\n[生成中...]\n";
        // if (novelContent.value.trim()) { ... } else { ... }

        // Add a visual break before starting generation if needed
        let prefix = (insertPosition > 0 && novelContent.value[insertPosition-1] !== '\n') ? '\n\n' : '';
        novelContent.value = novelContent.value.slice(0, insertPosition) + prefix + novelContent.value.slice(insertPosition);
        insertPosition += prefix.length; // Adjust insert position after adding prefix
        novelContent.selectionStart = novelContent.selectionEnd = insertPosition; // Move cursor
        novelContent.focus(); // Keep focus on the editor
        
        generateBtn.disabled = true;
        continueBtn.disabled = true;
        // --- Streaming Update END ---

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: selectedModel,
                    prompt: fullPrompt,
                    temperature: currentTemperature,
                    // context_length: currentContextLength // Removed context_length
                    // stream: false // Stream handling not implemented yet
                })
            });

            // --- Streaming Update START ---
            if (!response.ok) {
                // Try to read error from stream if possible, otherwise use status text
                let errorMsg = `HTTP error! status: ${response.status} ${response.statusText}`;
                 try {
                    // Attempt to read the response body for a JSON error from the stream
                    const errorText = await response.text(); 
                    const errorData = JSON.parse(errorText);
                    if (errorData.error) {
                        errorMsg = errorData.error; 
                    } else if (errorData.data && errorData.data.error) { // Check if error is wrapped in SSE data
                        errorMsg = errorData.data.error;
                    }
                 } catch (e) { /* Ignore if response body is not JSON or parsing fails */ }
                 throw new Error(errorMsg);
            }
            
            // Process the stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log("Stream finished.");
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep the last partial line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonData = line.substring(6).trim();
                        if (jsonData) {
                            try {
                                const data = JSON.parse(jsonData);
                                if (data.token) {
                                    // Insert the token at the current insert position
                                    const before = novelContent.value.slice(0, insertPosition);
                                    const after = novelContent.value.slice(insertPosition);
                                    novelContent.value = before + data.token + after;
                                    insertPosition += data.token.length; // Update insert position
                                    // Optionally scroll to keep the cursor in view
                                    novelContent.selectionStart = novelContent.selectionEnd = insertPosition;
                                    novelContent.scrollTop = novelContent.scrollHeight; // Scroll to bottom
                                    updateWordCount(); // Update count as text streams in
                                } else if (data.error) {
                                    console.error("Stream error:", data.error);
                                    updateStatus(`生成出错: ${data.error}`, true);
                                    // Optionally display the error inline
                                    const errorToken = `\n[错误: ${data.error}]\n`;
                                    const before = novelContent.value.slice(0, insertPosition);
                                    const after = novelContent.value.slice(insertPosition);
                                    novelContent.value = before + errorToken + after;
                                    insertPosition += errorToken.length;
                                    reader.cancel(); // Stop reading the stream on error
                                    break;
                                }
                            } catch (e) {
                                console.error('Error parsing stream data:', jsonData, e);
                            }
                        }
                    }
                }
            }
            updateStatus('生成完毕。'); // Update status after stream ends successfully
            // --- Streaming Update END ---

            // --- Remove Old Non-Streaming Logic START ---
            // const result = await response.json();
            // const generated = result.generated_text || "";
            // 
            // // 找到生成中标记的位置并替换为生成的内容
            // const markerPosition = novelContent.value.indexOf(generatingText);
            // if (markerPosition !== -1) {
            //     novelContent.value = 
            //         novelContent.value.slice(0, markerPosition) + 
            //         (generated.trim() ? '\n' + generated.trim() + '\n' : '') +
            //         novelContent.value.slice(markerPosition + generatingText.length);
            // } else {
            //     // 如果找不到标记（不太可能发生），就添加到末尾
            //     novelContent.value += (novelContent.value.trim() ? '\n\n' : '') + generated.trim();
            // }
            // 
            // updateStatus('生成完毕。');
            // 
            // // 更新字数统计
            // updateWordCount();
            // --- Remove Old Non-Streaming Logic END ---

        } catch (error) {
            console.error('Error generating text:', error);
             // --- Streaming Update START ---
             // Display error message
             updateStatus(`生成失败: ${error.message}`, true);
             // Optionally insert error marker
             const errorToken = `\n[生成失败: ${error.message}]\n`;
             const before = novelContent.value.slice(0, insertPosition);
             const after = novelContent.value.slice(insertPosition);
             novelContent.value = before + errorToken + after;
             // --- Streaming Update END ---
            
            // --- Remove Old Non-Streaming Logic START ---
            // // 移除生成中的提示
            // const markerPosition = novelContent.value.indexOf(generatingText);
            // if (markerPosition !== -1) {
            //     novelContent.value = 
            //         novelContent.value.slice(0, markerPosition) + 
            //         '\n[生成失败: ' + error.message + ']\n' +
            //         novelContent.value.slice(markerPosition + generatingText.length);
            // }
            // 
            // updateStatus(`生成失败: ${error.message}`, true);
            // --- Remove Old Non-Streaming Logic END ---
        } finally {
            // Re-enable buttons
            generateBtn.disabled = false;
            continueBtn.disabled = false;
        }
    }

    // --- Character Library Functions ---
    
    async function fetchCharacters() {
        updateStatus('正在加载角色库...');
        try {
            const response = await fetch('/api/characters');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const characters = await response.json();
            
            // Update sidebar character list
            characterList.innerHTML = '';
            
            // Update full character library list
            characterLibraryList.innerHTML = '';
            
            if (characters && characters.length > 0) {
                // Create a dropdown select for characters in the sidebar
                const characterSelect = document.createElement('select');
                characterSelect.className = 'sidebar-select';
                characterSelect.title = '选择角色';
                
                // Add default option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = '-- 选择角色 --';
                characterSelect.appendChild(defaultOption);
                
                characters.forEach(char => {
                    // Add option to dropdown
                    const option = document.createElement('option');
                    option.value = char.id;
                    option.textContent = char.name;
                    characterSelect.appendChild(option);
                    
                    // Add to full library list - no changes needed here
                    const li = document.createElement('li');
                    li.dataset.characterId = char.id;
                    li.textContent = char.name;
                    li.addEventListener('click', () => loadCharacter(char.id));
                    characterLibraryList.appendChild(li);
                });
                
                // Event listener for select change
                characterSelect.addEventListener('change', (e) => {
                    const selectedId = e.target.value;
                    if (selectedId) {
                        showCharacterLibrary();
                        loadCharacter(selectedId);
                    }
                });
                
                // Add the select to the character list
                const selectContainer = document.createElement('li');
                selectContainer.className = 'select-container';
                selectContainer.appendChild(characterSelect);
                characterList.appendChild(selectContainer);
                
                updateStatus('角色库加载完毕。');
            } else {
                characterList.innerHTML = '<li>未找到任何角色。请生成一个！</li>';
                characterLibraryList.innerHTML = '<li>角色库为空。请通过人物卡生成器创建角色。</li>';
                updateStatus('角色库为空。');
            }
        } catch (error) {
            console.error('Error fetching characters:', error);
            characterList.innerHTML = '<li>加载角色库出错。</li>';
            characterLibraryList.innerHTML = '<li>加载角色库出错。</li>';
            updateStatus(`加载角色库出错: ${error.message}`, true);
        }
    }
    
    async function loadCharacter(characterId) {
        updateStatus(`正在加载角色 ${characterId}...`);
        try {
            const response = await fetch(`/api/characters/${characterId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const character = await response.json();
            currentCharacterId = character.id;
            
            // Highlight selected character in both lists
            document.querySelectorAll('#character-library-list li').forEach(li => {
                li.classList.toggle('active', li.dataset.characterId === characterId);
            });
            
            // Update the sidebar select dropdown
            const characterSelect = document.querySelector('#character-list .sidebar-select');
            if (characterSelect) {
                characterSelect.value = characterId;
            }
            
            // 分析角色描述内容，按照常见信息结构优化显示
            const description = character.description || '没有描述';
            
            // 创建结构化的角色信息显示
            let characterHTML = `<div class="character-name">${character.name}</div>`;
            
            // 基础信息提取和格式化（寻找常见的角色基本信息模式）
            const basicInfoRegex = /(姓名|名称|角色名|种族|年龄|性别|外貌|性格|身份|特点|背景|武器|特殊能力|技能|经历|故事|背景故事|简介)[^\n]*/gi;
            const basicInfoMatches = [...description.matchAll(basicInfoRegex)];
            
            // 先提取常见的角色基本信息展示在前面
            if (basicInfoMatches.length > 0) {
                characterHTML += `<div class="character-info-section">`;
                basicInfoMatches.forEach(match => {
                    characterHTML += `<div>${match[0]}</div>`;
                });
                characterHTML += `</div>`;
            }
            
            // 添加完整的角色描述内容
            characterHTML += `<div class="character-info-section">
                <strong>详细描述:</strong>
                <div class="character-description">${description}</div>
            </div>`;
            
            // Display character details
            characterDetail.innerHTML = characterHTML;
            
            // Show action buttons
            editCharacterBtn.classList.remove('hidden');
            addToNovelBtn.classList.remove('hidden');
            deleteCharacterBtn.classList.remove('hidden');
            
            // Make sure we're in view mode
            characterViewPanel.classList.remove('hidden');
            characterEditPanel.classList.add('hidden');
            
            updateStatus(`角色 '${character.name}' 已加载。`);
            
        } catch (error) {
            console.error(`Error loading character ${characterId}:`, error);
            updateStatus(`加载角色出错: ${error.message}`, true);
            characterDetail.innerHTML = `<p class="error">加载角色时出错: ${error.message}</p>`;
            
            // Hide action buttons on error
            editCharacterBtn.classList.add('hidden');
            addToNovelBtn.classList.add('hidden');
            deleteCharacterBtn.classList.add('hidden');
        }
    }
    
    function showNewCharacterForm() {
        // Reset form and switch to edit mode
        characterForm.reset();
        currentCharacterId = null; // <-- ADD THIS LINE
        characterEditTitle.textContent = '创建新角色';
        characterNameInput.value = '';
        characterDescriptionInput.value = '';
        
        // Hide view panel, show edit panel
        characterViewPanel.classList.add('hidden');
        characterEditPanel.classList.remove('hidden');
        
        // Focus on the first field
        characterNameInput.focus();
        
        updateStatus('正在创建新角色...');
    }
    
    function showEditCharacterForm() {
        if (!currentCharacterId) {
            alert('请先选择一个角色。');
            return;
        }
        
        // Get current character details
        const nameElement = characterDetail.querySelector('.character-name');
        const descElement = characterDetail.querySelector('.character-description');
        
        if (!nameElement || !descElement) {
            alert('无法获取角色数据。');
            return;
        }
        
        // Populate form with current data
        characterEditTitle.textContent = '编辑角色';
        characterNameInput.value = nameElement.textContent;
        characterDescriptionInput.value = descElement.textContent === '没有描述' ? '' : descElement.textContent;
        
        // Switch to edit mode
        characterViewPanel.classList.add('hidden');
        characterEditPanel.classList.remove('hidden');
        
        // Focus on the name field
        characterNameInput.focus();
        
        updateStatus('正在编辑角色...');
    }
    
    async function saveCharacterToLibrary(event) {
        // If used as form submit handler
        if (event) event.preventDefault();
        
        const name = characterNameInput.value.trim();
        const description = characterDescriptionInput.value.trim();
        
        if (!name) {
            alert('角色名称不能为空。');
            characterNameInput.focus();
            return;
        }
        
        updateStatus('正在保存角色...');
        
        try {
            const method = currentCharacterId ? 'PUT' : 'POST';
            const url = currentCharacterId 
                ? `/api/characters/${currentCharacterId}`
                : '/api/characters';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    description: description
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const character = await response.json();
            
            // Reset form and switch to view mode
            characterForm.reset();
            characterViewPanel.classList.remove('hidden');
            characterEditPanel.classList.add('hidden');
            
            // Refresh character lists
            await fetchCharacters();
            
            // Load the saved character
            loadCharacter(character.id);
            
            // Ask if we should add this character to the current novel
            if (currentNovelId && confirm(`是否要将角色 "${name}" 添加到当前小说？`)) {
                currentCharacterId = character.id;
                addCharacterToNovel();
            }
            
            updateStatus(`角色 '${name}' 已保存。`);
            
        } catch (error) {
            console.error('Error saving character:', error);
            updateStatus(`保存角色出错: ${error.message}`, true);
            alert(`保存角色出错: ${error.message}`);
        }
    }
    
    async function deleteCharacterFromLibrary() {
        if (!currentCharacterId) {
            alert('请先选择一个角色。');
            return;
        }
        
        if (!confirm('确定要删除这个角色吗？此操作无法撤销。')) {
            return;
        }
        
        updateStatus(`正在删除角色...`);
        try {
            const response = await fetch(`/api/characters/${currentCharacterId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) { /* Ignore */ }
                throw new Error(errorMsg);
            }
            
            const result = await response.json();
            updateStatus(result.message || `角色已删除。`);
            
            // Reset character detail view
            characterDetail.innerHTML = '<p class="select-character-prompt">请从左侧选择一个角色，或创建新角色。</p>';
            
            // Hide action buttons
            editCharacterBtn.classList.add('hidden');
            addToNovelBtn.classList.add('hidden');
            deleteCharacterBtn.classList.add('hidden');
            currentCharacterId = null;
            
            // Refresh character lists
            await fetchCharacters();
            
        } catch (error) {
            console.error(`Error deleting character:`, error);
            updateStatus(`删除角色失败: ${error.message}`, true);
            alert(`删除角色失败: ${error.message}`);
        }
    }
    
    function cancelCharacterEdit() {
        // Switch back to view mode
        characterViewPanel.classList.remove('hidden');
        characterEditPanel.classList.add('hidden');
        
        // If we have a loaded character, stay on it
        if (currentCharacterId) {
            updateStatus('已取消编辑角色。');
        } else {
            // Reset form and detail view
            characterForm.reset();
            characterDetail.innerHTML = '<p class="select-character-prompt">请从左侧选择一个角色，或创建新角色。</p>';
            updateStatus('已取消创建角色。');
        }
    }
    
    // Store characters data for tag-based management
    let novelCharacters = [];

    // Modified addCharacterToNovel to support tag-based display and update existing tags
    function addCharacterToNovel() {
        if (!currentCharacterId || !currentNovelId) {
            alert("请先选择一个角色和打开一部小说。");
            return;
        }
        
        // Get the character description from the detail view
        const characterDesc = characterDetail.querySelector('.character-description');
        if (!characterDesc) {
            alert("无法获取角色描述。");
            return;
        }
        
        // Get character details
        const characterName = characterDetail.querySelector('.character-name').textContent;
        const characterText = characterDesc.textContent;
        
        // Create the new character object structure
        const updatedCharacterData = {
            id: currentCharacterId,
            name: characterName,
            description: characterText // This is the potentially updated description
        };

        // Check if character already exists in the novel
        const existingCharIndex = novelCharacters.findIndex(c => c.id === currentCharacterId);
        
        if (existingCharIndex >= 0) {
            // Character exists - UPDATE the existing entry
            novelCharacters[existingCharIndex] = updatedCharacterData;
            updateStatus(`角色 "${characterName}" 已在小说中更新。`);
        } else {
            // Character does not exist - ADD the new entry
            novelCharacters.push(updatedCharacterData);
            updateStatus(`角色 '${characterName}' 已添加到当前小说。`);
        }
        
        // Update the characters input with all character descriptions
        updateCharactersInput();
        
        // Render all character tags
        renderCharacterTags();
        
        // Save the novel with the updated character data
        saveNovelContent();
        
        // Show writing area with the updated characters
        showWritingArea();
    }

    // Function to update the textarea with all character descriptions
    function updateCharactersInput() {
        // Create a combined text of all character descriptions
        const characterTexts = novelCharacters.map(char => {
            // Prepend the character name if it's not in the description
            let fullCharacterText = char.description;
            if (char.description !== '没有描述' && !char.description.includes(char.name)) {
                fullCharacterText = `${char.name}：${char.description}`;
            }
            return fullCharacterText;
        });
        
        // Join with separators and update the textarea
        charactersInput.value = characterTexts.join('\n\n');
    }

    // Function to render character tags based on novelCharacters array
    function renderCharacterTags() {
        const tagsContainer = document.getElementById('character-tags-container');
        tagsContainer.innerHTML = '';
        
        novelCharacters.forEach(char => {
            const tag = document.createElement('div');
            tag.className = 'character-tag';
            tag.dataset.characterId = char.id;
            
            const tagName = document.createElement('div');
            tagName.className = 'character-tag-name';
            tagName.textContent = char.name;
            tagName.title = char.name;
            
            const removeBtn = document.createElement('div');
            removeBtn.className = 'character-tag-remove';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.title = `移除角色 ${char.name}`;
            
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent tag click event
                removeCharacterTag(char.id);
            });
            
            tag.appendChild(tagName);
            tag.appendChild(removeBtn);
            
            // Show character description on tag hover
            tag.addEventListener('mouseenter', () => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tag-tooltip';
                tooltip.textContent = char.description;
                tag.appendChild(tooltip);
            });
            
            tag.addEventListener('mouseleave', () => {
                const tooltip = tag.querySelector('.tag-tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
            
            tagsContainer.appendChild(tag);
        });
        
        // Update the characters input with all character descriptions
        updateCharactersInput();
    }

    // Function to remove a character tag
    function removeCharacterTag(characterId) {
        const charIndex = novelCharacters.findIndex(c => c.id === characterId);
        if (charIndex >= 0) {
            const charName = novelCharacters[charIndex].name;
            if (confirm(`确定要移除角色 "${charName}" 吗？`)) {
                novelCharacters.splice(charIndex, 1);
                updateCharactersInput();
                renderCharacterTags();
                saveNovelContent();
                updateStatus(`已移除角色 "${charName}"`);
            }
        }
    }

    // Function to display character details
    function showCharacterDetails(character) {
        // Create or get details container
        let detailsContainer = document.querySelector('.character-details-container');
        
        if (!detailsContainer) {
            detailsContainer = document.createElement('div');
            detailsContainer.className = 'character-details-container';
            document.querySelector('.character-input-container').appendChild(detailsContainer);
        }
        
        // Show character details
        detailsContainer.textContent = character.description;
        detailsContainer.style.display = 'block';
    }

    // Restore the parseCharacterFromOutput function
    function parseCharacterFromOutput(output) {
        if (!output) return null;
        
        // Try to extract character name and description
        // This is a simple implementation that can be improved based on your output format
        let name = "未命名角色";
        const nameMatch = output.match(/姓名[:：]\s*(.+?)(?:\n|$)/i);
        if (nameMatch && nameMatch[1]) {
            name = nameMatch[1].trim();
        }
        
        // Return the whole text as description, we'll display it as is
        return {
            name: name,
            description: output.trim()
        };
    }

    // --- Export Functions (Now call backend) ---

    async function exportNovel(format) {
        if (!currentNovelId) {
            alert("请先加载或创建一部小说以进行导出。");
            return;
        }

        updateStatus(`正在请求导出为 ${format.toUpperCase()}...`);
        // Disable buttons temporarily?
        exportTxtBtn.disabled = true;
        exportJsonBtn.disabled = true;
        exportDocxBtn.disabled = true;

        try {
            const response = await fetch(`/api/novels/${currentNovelId}/export/${format}`, {
                method: 'POST'
                // No body needed, the server knows the novel ID
            });

            const result = await response.json(); // Always expect JSON response now

            if (!response.ok) {
                throw new Error(result.error || `导出时发生未知错误 (HTTP ${response.status})`);
            }

            updateStatus(result.message || `文件已成功导出至服务器 (${format})。`);
            // Maybe show the path briefly?
            alert(result.message); // Simple alert confirmation

        } catch (error) {
            console.error(`Error exporting novel as ${format}:`, error);
            const errorText = `导出 ${format.toUpperCase()} 失败: ${error.message}`;
            updateStatus(errorText, true);
            alert(errorText);
        } finally {
            // Re-enable buttons
            exportTxtBtn.disabled = false;
            exportJsonBtn.disabled = false;
            exportDocxBtn.disabled = false;
        }
    }

    // --- Word Count --- TODO: Improve CJK word count if needed
    function updateWordCount() {
        console.log("updateWordCount called"); // Log: Function called
        if (!wordCountDisplay) {
            console.error("Word count display element not found!"); // Log: Element missing
            return;
        }

        const text = novelContent.value || '';
        console.log("Text for word count:", text.substring(0, 50) + "..."); // Log: Text sample
        // Simple word count (split by space/newline, filter empty)
        // For CJK, counting non-space characters might be more common.
        // Let's use non-space character count for simplicity here.
        const wordCount = text.replace(/\s+/g, '').length; // Count non-whitespace chars
        // Alternative: const wordCount = (text.match(/\S+/g) || []).length;
        console.log("Calculated word count:", wordCount); // Log: Calculated count

        wordCountDisplay.textContent = `字数: ${wordCount}`;
    }

    // --- Toolbox Functions ---

    function showToolbox(toolType) {
        hideAllContentAreas();
        toolboxArea.classList.remove('hidden');
        
        // Hide outputs and save character buttons initially
        toolboxOutputDiv.classList.add('hidden');
        saveCharacterBtn.classList.add('hidden');
        
        // Clear previous prompt and output
        toolboxPrompt.value = '';
        toolboxOutputText.textContent = '';
        
        // Update tool-specific UI elements
        toolboxGenerateBtn.setAttribute('data-tool-type', toolType);
        
        // Set specific prompts and titles based on tool type
        switch(toolType) {
            case 'synopsis':
                toolboxTitle.textContent = '简介生成器';
                toolboxPrompt.placeholder = '输入小说的主题、风格、人物等关键信息，生成引人入胜的小说简介...';
                break;
            case 'title':
                toolboxTitle.textContent = '书名生成器';
                toolboxPrompt.placeholder = '输入小说的主题、类型、关键词等，生成合适的书名...';
                break;
            case 'outline':
                toolboxTitle.textContent = '大纲生成器';
                toolboxPrompt.placeholder = '输入小说的基本构思、主题、主要角色等，生成大纲...';
                break;
            case 'detailed-outline':
                toolboxTitle.textContent = '细纲生成器';
                toolboxPrompt.placeholder = '输入已有的大纲或故事概要，生成详细的章节内容规划...';
                break;
            case 'character':
                toolboxTitle.textContent = '人物卡生成器';
                toolboxPrompt.placeholder = '输入角色的基本信息，如姓名、性别、年龄、身份等，生成详细的人物设定...';
                break;
            default:
                toolboxTitle.textContent = '工具箱';
                toolboxPrompt.placeholder = '输入内容...';
        }
        
        updateStatus(`已打开${toolboxTitle.textContent}。`);
        updateAddDetailedOutlineBtnVisibility();
    }

    function updateAddDetailedOutlineBtnVisibility() {
        const toolType = toolboxGenerateBtn.dataset.toolType;
        if (addDetailedOutlineToNovelBtn) {
            addDetailedOutlineToNovelBtn.classList.toggle('hidden', toolType !== 'detailed-outline');
        }
    }

    async function generateToolboxOutput() {
        const toolType = toolboxGenerateBtn.dataset.toolType;
        const selectedModel = modelSelect.value;
        const userProvidedPrompt = toolboxPrompt.value.trim(); // Renamed for clarity
        const characters = charactersInput.value.trim(); // These are general, not novel-specific
        const knowledge = knowledgeInput.value.trim();   // These are general, not novel-specific
        const stylePrompt = stylePromptInput.value.trim(); // These are general, not novel-specific

        if (!selectedModel) {
            alert("请先选择一个 AI 模型。");
            return;
        }
        
        if (!toolType) {
            console.error("Tool type not set for toolbox generation.");
            alert("发生内部错误：未指定工具类型。");
            return;
        }

        let toolTitle = "工具";
        let taskInstruction = ""; // Specific instruction for the AI based on the tool

        // Get selected novel types if the section is active for this tool
        let novelTypeInfo = "";
        if (typeof window.isNovelTypesSelectionActiveForTool === 'function' && 
            window.isNovelTypesSelectionActiveForTool(toolType) && 
            typeof window.getSelectedNovelTypesForPrompt === 'function') {
            novelTypeInfo = window.getSelectedNovelTypesForPrompt();
        }

        // Check if we have enough information to generate content
        if (!userProvidedPrompt && !novelTypeInfo && (
            toolType === 'title' || toolType === 'outline' || 
            toolType === 'detailed-outline' || toolType === 'character')) {
            alert("请至少输入一些关键词或选择小说类型来帮助生成内容。");
            return;
        }

        switch(toolType) {
            case 'synopsis':
                toolTitle = "简介";
                taskInstruction = "请根据以下信息生成一个引人入胜的小说简介，介绍故事背景、主要人物和核心冲突";
                break;
            case 'title':
                toolTitle = "书名";
                taskInstruction = "请根据以下信息生成5个合适的书名";
                break;
            case 'outline':
                toolTitle = "大纲";
                taskInstruction = "请根据以下信息为故事创建一个基本情节大纲（主要部分或幕）";
                break;
            case 'detailed-outline':
                toolTitle = "细纲";
                taskInstruction = "请根据以下信息将内容扩展为更详细的逐章或逐场景大纲";
                break;
            case 'character':
                toolTitle = "角色";
                taskInstruction = "请根据以下信息创建一个详细的角色卡片，包括姓名、外貌、性格、背景故事和其他相关细节";
                break;
            default:
                taskInstruction = "请处理以下写作提示"; // Fallback for other tools
        }

        updateStatus(`正在使用 ${selectedModel} 生成 ${toolTitle}...`);
        toolboxGenerateBtn.disabled = true;
        toolboxOutputDiv.classList.remove('hidden');
        toolboxOutputText.textContent = '生成中...';
        saveCharacterBtn.classList.add('hidden');
        
        // Show/hide add to outline button based on tool type
        const addToOutlineBtn = document.getElementById('add-to-outline-btn');
        if (addToOutlineBtn) {
            addToOutlineBtn.classList.toggle('hidden', toolType !== 'synopsis');
        }
        // Show/hide add to detailed outline button based on tool type
        const addToDetailedOutlineBtn = document.getElementById('add-to-detailed-outline-btn');
        if (addToDetailedOutlineBtn) {
            addToDetailedOutlineBtn.classList.toggle('hidden', toolType !== 'outline');
        }

        // Construct the final prompt for the AI with novel types emphasized at beginning
        let finalPrompt = "";
        
        // Put novel types first, if available
        if (novelTypeInfo) {
            finalPrompt += `${novelTypeInfo}\n\n`;
        }

        // Add the task instruction after novel types
        finalPrompt += `${taskInstruction}:\n`;
        
        // Add user input
        if (userProvidedPrompt) {
            finalPrompt += `用户输入: ${userProvidedPrompt}\n`;
        }
        
        // Add general context (style, characters, knowledge) if available
        let baseContext = "";
        if (stylePrompt) {
            baseContext += `参考风格提示: ${stylePrompt}\n`;
        }
        if (characters) {
            baseContext += `相关角色信息: ${characters}\n`;
        }
        if (knowledge) {
            baseContext += `背景知识: ${knowledge}\n`;
        }
        
        if (baseContext) {
            finalPrompt += `\n附加参考信息:\n${baseContext}`;
        }

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: selectedModel,
                    prompt: finalPrompt,
                    temperature: currentTemperature,
                })
            });

            // --- Streaming Update START ---
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status} ${response.statusText}`;
                 try {
                    // Attempt to read the response body for a JSON error from the stream
                    const errorText = await response.text(); 
                    const errorData = JSON.parse(errorText);
                    if (errorData.error) {
                        errorMsg = errorData.error; 
                    } else if (errorData.data && errorData.data.error) { // Check if error is wrapped in SSE data
                        errorMsg = errorData.data.error;
                    }
                 } catch (e) { /* Ignore if response body is not JSON or parsing fails */ }
                 throw new Error(errorMsg);
            }
            
            // Process the stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let fullGeneratedText = ''; // Store full text for character parsing

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log("Toolbox stream finished.");
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep the last partial line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonData = line.substring(6).trim();
                        if (jsonData) {
                            try {
                                const data = JSON.parse(jsonData);
                                if (data.token) {
                                    toolboxOutputText.textContent += data.token;
                                    fullGeneratedText += data.token; // Accumulate for parsing
                                    // Scroll toolbox output
                                    const preElement = toolboxOutputText.parentElement;
                                    if (preElement) preElement.scrollTop = preElement.scrollHeight;
                                } else if (data.error) {
                                    console.error("Stream error:", data.error);
                                    toolboxOutputText.textContent += `\n[错误: ${data.error}]\n`;
                                    updateStatus(`工具箱生成出错: ${data.error}`, true);
                                    reader.cancel();
                                    break;
                                }
                            } catch (e) {
                                console.error('Error parsing toolbox stream data:', jsonData, e);
                            }
                        }
                    }
                }
            }
            updateStatus(`${toolTitle} 生成完毕。`);
            // --- Streaming Update END ---
            
            // --- Remove Old Non-Streaming Logic START ---
            // const result = await response.json();
            // const generatedText = result.generated_text || "未能生成输出。";
            // toolboxOutputText.textContent = generatedText;
            // updateStatus(`${toolTitle} 生成完毕。`);
            // --- Remove Old Non-Streaming Logic END ---
            
            // 检查内容是否需要滚动，如果是，添加滚动提示
            checkScrollableContent(toolboxOutputText);
            
            // If this is a character generation, show the save button and parse the character
            // Use the fully accumulated text for parsing now
            if (toolType === 'character' && fullGeneratedText) {
                saveCharacterBtn.classList.remove('hidden');
                lastGeneratedCharacter = parseCharacterFromOutput(fullGeneratedText);
            }

        } catch (error) {
            console.error(`Error generating ${toolType}:`, error);
            // --- Streaming Update START ---
            toolboxOutputText.textContent = `错误: ${error.message}`;
            updateStatus(`工具箱生成失败: ${error.message}`, true);
            // --- Streaming Update END ---
            // --- Remove Old Non-Streaming Logic START ---
            // toolboxOutputText.textContent = `错误: ${error.message}`;
            // updateStatus(`工具箱生成失败: ${error.message}`, true);
            // --- Remove Old Non-Streaming Logic END ---
        } finally {
            toolboxGenerateBtn.disabled = false;
        }
        updateAddDetailedOutlineBtnVisibility();
    }
    
    // 检查内容是否可滚动，并添加相应的 CSS 类
    function checkScrollableContent(element) {
        if (element && element.parentElement) {
            const pre = element.parentElement;
            if (pre.scrollHeight > pre.clientHeight) {
                pre.classList.add('scrollable');
                
                // 当用户滚动到底部时，移除视觉提示
                pre.addEventListener('scroll', function() {
                    if (pre.scrollHeight - pre.scrollTop <= pre.clientHeight + 10) {
                        pre.classList.remove('scrollable');
                    } else {
                        pre.classList.add('scrollable');
                    }
                });
            } else {
                pre.classList.remove('scrollable');
            }
        }
    }
    
    // 添加窗口大小改变监听，以便调整可滚动状态
    window.addEventListener('resize', function() {
        if (toolboxOutputText.textContent) {
            checkScrollableContent(toolboxOutputText);
        }
    });

    // --- Import Functions ---

    async function importNovel(file) {
        if (isSaving) {
            alert("请稍候，正在保存上一部小说...");
            return;
        }

        updateStatus(`正在导入 ${file.name}...`);
        importNovelBtn.disabled = true;
        
        try {
            // Get file extension
            const fileExt = file.name.split('.').pop().toLowerCase();
            if (!['txt', 'json', 'docx'].includes(fileExt)) {
                throw new Error("不支持的文件类型。请选择 TXT, JSON 或 DOCX 文件。");
            }
            
            // Check file size (10MB limit for this example)
            if (file.size > 10 * 1024 * 1024) {
                throw new Error("文件过大，请选择小于10MB的文件。");
            }
            
            // First read the file based on its type
            let fileContent;
            
            if (fileExt === 'json') {
                // For JSON files, we need to validate the JSON format first
                try {
                    const textContent = await readFileAsText(file);
                    // Try parsing the JSON to validate it
                    JSON.parse(textContent);
                    // If it's valid, use the text directly
                    fileContent = textContent;
                } catch (parseError) {
                    throw new Error(`JSON文件格式无效: ${parseError.message}`);
                }
            } else if (fileExt === 'txt') {
                // For text files, read as text
                fileContent = await readFileAsText(file);
            } else if (fileExt === 'docx') {
                // For Word docs, read as base64
                fileContent = await readFileAsBase64(file);
            }
            
            // Send to server
            const response = await fetch('/api/novels/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: file.name,
                    content: fileContent
                })
            });
            
            // Check response
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `导入失败: HTTP错误 ${response.status}`);
            }
            
            // Update novel list and load the imported novel
            await fetchNovels();
            await loadNovel(result.id);
            
            updateStatus(`成功导入小说 "${result.title}"`);

        } catch (error) {
            console.error('Error importing novel:', error);
            updateStatus(`导入小说失败: ${error.message}`, true);
            alert(`导入小说失败: ${error.message}`);
        } finally {
            importNovelBtn.disabled = false;
        }
    }
    
    // Read file as text
    function readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = () => {
                resolve(reader.result);
            };
            
            reader.onerror = () => {
                reject(new Error("读取文件时发生错误。"));
            };
            
            reader.readAsText(file);
        });
    }
    
    // Read file as base64
    function readFileAsBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = () => {
                // For binary files like docx, extract the base64 part after the comma
                // Format is: data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,BASE64DATA
                const dataUrl = reader.result;
                const base64Content = dataUrl.split(',')[1];
                
                if (!base64Content) {
                    reject(new Error("无法读取文件内容，请重试。"));
            return;
        }

                resolve(base64Content);
            };
            
            reader.onerror = () => {
                reject(new Error("读取文件时发生错误。"));
            };
            
            reader.readAsDataURL(file);
        });
    }

    // --- Glossary Library Functions ---
    
    async function fetchGlossaryEntries() {
        updateStatus('正在加载词条库...');
        try {
            const response = await fetch('/api/glossary');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const entries = await response.json();
            
            // Store entries globally
            glossaryEntries = entries;
            
            // Clear existing categories and add new ones
            glossaryCategories.clear();
            entries.forEach(entry => {
                if (entry.category) {
                    glossaryCategories.add(entry.category);
                }
            });
            
            // Update category filter dropdown
            updateCategoryFilter();
            
            // Update sidebar glossary list
            glossaryList.innerHTML = '';
            
            // Update full glossary library list
            glossaryLibraryList.innerHTML = '';
            
            if (entries && entries.length > 0) {
                // Create a dropdown select for glossary entries in the sidebar
                const glossarySelect = document.createElement('select');
                glossarySelect.className = 'sidebar-select';
                glossarySelect.title = '选择词条';
                
                // Add default option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = '-- 选择词条 --';
                glossarySelect.appendChild(defaultOption);
                
                entries.forEach(entry => {
                    // Add option to dropdown
                    const option = document.createElement('option');
                    option.value = entry.id;
                    option.textContent = entry.term;
                    if (entry.category) {
                        option.textContent += ` (${entry.category})`;
                    }
                    glossarySelect.appendChild(option);
                    
                    // Add to full library list - no changes needed here
                    const li = document.createElement('li');
                    li.dataset.glossaryId = entry.id;
                    
                    const termDiv = document.createElement('div');
                    termDiv.textContent = entry.term;
                    termDiv.style.fontWeight = '500';
                    
                    if (entry.category) {
                        const categorySpan = document.createElement('span');
                        categorySpan.textContent = entry.category;
                        categorySpan.className = 'glossary-category';
                        termDiv.appendChild(categorySpan);
                    }
                    
                    const descDiv = document.createElement('div');
                    descDiv.textContent = entry.description;
                    descDiv.style.fontSize = '0.85em';
                    descDiv.style.color = '#718096';
                    descDiv.style.marginTop = '3px';
                    descDiv.style.overflow = 'hidden';
                    descDiv.style.textOverflow = 'ellipsis';
                    descDiv.style.display = '-webkit-box';
                    descDiv.style.webkitLineClamp = '2';
                    descDiv.style.webkitBoxOrient = 'vertical';
                    
                    li.appendChild(termDiv);
                    li.appendChild(descDiv);
                    
                    li.addEventListener('click', () => loadGlossaryEntry(entry.id));
                    glossaryLibraryList.appendChild(li);
                });
                
                // Event listener for select change
                glossarySelect.addEventListener('change', (e) => {
                    const selectedId = e.target.value;
                    if (selectedId) {
                        showGlossaryLibrary();
                        loadGlossaryEntry(selectedId);
                    }
                });
                
                // Add the select to the glossary list
                const selectContainer = document.createElement('li');
                selectContainer.className = 'select-container';
                selectContainer.appendChild(glossarySelect);
                glossaryList.appendChild(selectContainer);
                
                updateStatus('词条库加载完毕。');
            } else {
                glossaryList.innerHTML = '<li>未找到任何词条。请创建一个！</li>';
                glossaryLibraryList.innerHTML = '<li>词条库为空。请点击"新建词条"创建词条。</li>';
                updateStatus('词条库为空。');
            }
        } catch (error) {
            console.error('Error fetching glossary entries:', error);
            glossaryList.innerHTML = '<li>加载词条库出错。</li>';
            glossaryLibraryList.innerHTML = '<li>加载词条库出错。</li>';
            updateStatus(`加载词条库出错: ${error.message}`, true);
        }
    }
    
    function updateCategoryFilter() {
        // Clear existing options except "All Categories"
        while (glossaryCategoryFilter.options.length > 1) {
            glossaryCategoryFilter.remove(1);
        }
        
        // Add categories from the set
        Array.from(glossaryCategories).sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            glossaryCategoryFilter.appendChild(option);
        });
    }
    
    async function loadGlossaryEntry(entryId) {
        updateStatus(`正在加载词条 ${entryId}...`);
        try {
            const response = await fetch(`/api/glossary/${entryId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const entry = await response.json();
            currentGlossaryId = entry.id;
            
            // Highlight selected entry in list
            document.querySelectorAll('#glossary-library-list li').forEach(li => {
                li.classList.toggle('active', li.dataset.glossaryId === entryId);
            });
            
            // Update the sidebar select dropdown
            const glossarySelect = document.querySelector('#glossary-list .sidebar-select');
            if (glossarySelect) {
                glossarySelect.value = entryId;
            }
            
            // Display entry details
            glossaryDetail.innerHTML = `
                <div class="glossary-term">${entry.term}</div>
                ${entry.category ? `<div class="glossary-category-tag">${entry.category}</div>` : ''}
                <div class="glossary-description">${entry.description || '没有描述'}</div>
            `;
            
            // Show action buttons
            editGlossaryBtn.classList.remove('hidden');
            addGlossaryToNovelBtn.classList.remove('hidden');
            deleteGlossaryBtn.classList.remove('hidden');
            
            // Switch to view panel if we're in edit mode
            glossaryViewPanel.classList.remove('hidden');
            glossaryEditPanel.classList.add('hidden');
            
            updateStatus(`词条 '${entry.term}' 已加载。`);
            
        } catch (error) {
            console.error(`Error loading glossary entry ${entryId}:`, error);
            updateStatus(`加载词条出错: ${error.message}`, true);
            glossaryDetail.innerHTML = `<p class="error">加载词条时出错: ${error.message}</p>`;
            
            // Hide action buttons on error
            editGlossaryBtn.classList.add('hidden');
            addGlossaryToNovelBtn.classList.add('hidden');
            deleteGlossaryBtn.classList.add('hidden');
        }
    }
    
    function showNewGlossaryForm() {
        // Reset form
        glossaryForm.reset();
        currentGlossaryId = null;
        
        // Update UI
        glossaryEditTitle.textContent = '创建新词条';
        glossaryViewPanel.classList.add('hidden');
        glossaryEditPanel.classList.remove('hidden');
        
        // Focus on first input
        glossaryTermInput.focus();
    }
    
    async function showEditGlossaryForm() { // Made function async
        if (!currentGlossaryId) {
            alert("请先选择一个词条。");
            return;
        }
        
        updateStatus('正在加载词条详情以供编辑...');
        try {
            const response = await fetch(`/api/glossary/${currentGlossaryId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const entry = await response.json();

            if (!entry) {
                alert("找不到选中的词条数据。");
                updateStatus('加载词条详情失败。', true);
                return;
            }
            
            // Fill form with current values
            glossaryTermInput.value = entry.term;
            glossaryCategoryInput.value = entry.category || '';
            glossaryDescriptionInput.value = entry.description || ''; // Use full description
            
            // Update UI
            glossaryEditTitle.textContent = '编辑词条';
            glossaryViewPanel.classList.add('hidden');
            glossaryEditPanel.classList.remove('hidden');
            
            // Focus on first input
            glossaryTermInput.focus();
            updateStatus('词条详情已加载，可以开始编辑。');
        } catch (error) {
            console.error('Error fetching glossary entry for editing:', error);
            alert('加载词条详情以供编辑时出错，请稍后重试。');
            updateStatus('加载词条详情失败。', true);
        }
    }
    
    async function saveGlossaryEntry(event) {
        event.preventDefault(); // Prevent form submission
        
        // Validate form
        if (!glossaryTermInput.value.trim()) {
            alert("词条名称不能为空。");
            glossaryTermInput.focus();
            return;
        }
        
        if (!glossaryDescriptionInput.value.trim()) {
            alert("词条内容不能为空。");
            glossaryDescriptionInput.focus();
            return;
        }
        
        const entryData = {
            term: glossaryTermInput.value.trim(),
            category: glossaryCategoryInput.value.trim(),
            description: glossaryDescriptionInput.value.trim()
        };
        
        try {
            let response;
            
            if (currentGlossaryId) {
                // Update existing entry
                response = await fetch(`/api/glossary/${currentGlossaryId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entryData)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                updateStatus(`词条 '${entryData.term}' 已更新。`);
            } else {
                // Create new entry
                response = await fetch('/api/glossary', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entryData)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                currentGlossaryId = result.id;
                updateStatus(`新词条 '${entryData.term}' 已创建。`);
            }
            
            // Refresh glossary lists
            await fetchGlossaryEntries();
            
            // Load the entry we just saved
            if (currentGlossaryId) {
                loadGlossaryEntry(currentGlossaryId);
            }
            
        } catch (error) {
            console.error('Error saving glossary entry:', error);
            updateStatus(`保存词条出错: ${error.message}`, true);
            alert(`保存词条失败: ${error.message}`);
        }
    }
    
    async function deleteGlossaryEntry() {
        if (!currentGlossaryId) {
            alert("请先选择一个词条。");
            return;
        }
        
        if (!confirm("确定要删除这个词条吗？此操作无法撤销。")) {
            return;
        }
        
        try {
            const response = await fetch(`/api/glossary/${currentGlossaryId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            updateStatus(result.message || '词条已删除。');
            
            // Reset detail view
            glossaryDetail.innerHTML = '<p class="select-glossary-prompt">请从左侧选择一个词条，或创建新词条。</p>';
            editGlossaryBtn.classList.add('hidden');
            addGlossaryToNovelBtn.classList.add('hidden');
            deleteGlossaryBtn.classList.add('hidden');
            currentGlossaryId = null;
            
            // Refresh glossary lists
            await fetchGlossaryEntries();
            
        } catch (error) {
            console.error(`Error deleting glossary entry ${currentGlossaryId}:`, error);
            updateStatus(`删除词条失败: ${error.message}`, true);
            alert(`删除词条失败: ${error.message}`);
        }
    }
    
    function cancelGlossaryEdit() {
        glossaryViewPanel.classList.remove('hidden');
        glossaryEditPanel.classList.add('hidden');
        
        // If we had a glossary selected, reselect it
        if (currentGlossaryId) {
            // Just update UI, no need to refetch
            const entries = document.querySelectorAll(`#glossary-library-list li[data-glossary-id="${currentGlossaryId}"]`);
            if (entries && entries.length > 0) {
                entries[0].click();
            }
        }
    }
    
    async function addGlossaryToNovel() { // Ensure this is async
        if (!currentNovelId) {
            alert("请先打开一部小说。");
            return;
        }
        
        if (!currentGlossaryId) {
            alert("请先选择一个词条。");
            return;
        }
        
        updateStatus('正在获取完整词条信息以添加到小说...');
        try {
            // Fetch the full entry details
            const response = await fetch(`/api/glossary/${currentGlossaryId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} while fetching full glossary entry.`);
            }
            const fullEntry = await response.json();

            if (!fullEntry) {
                alert("获取完整词条信息失败。");
                updateStatus('获取完整词条信息失败。', true);
                return;
            }
    
            // Instead of adding text directly to knowledge area, add or update a tag using the full entry
            addOrUpdateGlossaryTag(fullEntry); // Changed function name
            
            // Auto-save the novel
            saveNovelContent();
            
            // Return to writing area
            showWritingArea();
        } catch (error) {
            console.error('Error fetching full glossary entry to add/update in novel:', error);
            alert('添加或更新词条到小说时出错: 无法获取完整词条信息。');
            updateStatus('添加或更新词条到小说失败。', true);
        }
    }
    
    // Create glossary tags array if not exists in novel data
    let novelGlossaryTags = [];
    
    // Renamed and modified function to add or update glossary tag
    function addOrUpdateGlossaryTag(glossaryEntry) { 
        // Check if tag already exists
        const existingTagIndex = novelGlossaryTags.findIndex(tag => tag.id === glossaryEntry.id);
        
        const updatedTagData = {
            id: glossaryEntry.id,
            term: glossaryEntry.term,
            description: glossaryEntry.description,
            category: glossaryEntry.category || ""
        };

        if (existingTagIndex >= 0) {
            // Tag exists - UPDATE the existing entry
            novelGlossaryTags[existingTagIndex] = updatedTagData;
            updateStatus(`已更新小说中的词条: '${glossaryEntry.term}'`);
        } else {
            // Tag does not exist - ADD the new entry
            novelGlossaryTags.push(updatedTagData);
            updateStatus(`已将词条 '${glossaryEntry.term}' 添加到当前小说的关联知识中。`);
        }
        
        // Update the knowledge input display with all glossary tags
        updateGlossaryTagsDisplay(); 
    }
    
    function updateGlossaryTagsDisplay() {
        // First ensure we have a container for glossary tags
        let glossaryTagsContainer = document.getElementById('glossary-tags-container');
        if (!glossaryTagsContainer) {
            // Create container if it doesn't exist
            glossaryTagsContainer = document.createElement('div');
            glossaryTagsContainer.id = 'glossary-tags-container';
            glossaryTagsContainer.className = 'tags-container';
            
            // Insert it before the knowledge input
            const knowledgeParent = knowledgeInput.parentElement;
            knowledgeParent.insertBefore(glossaryTagsContainer, knowledgeInput);
        }
        
        // Clear existing tags
        glossaryTagsContainer.innerHTML = '';
        
        // Create tag elements
        novelGlossaryTags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag glossary-tag';
            tagElement.dataset.glossaryId = tag.id;
            
            const tagName = document.createElement('div');
            tagName.className = 'tag-name';
            tagName.textContent = tag.term;
            tagName.title = tag.term;
            
            const removeBtn = document.createElement('div');
            removeBtn.className = 'tag-remove';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.title = `移除词条 ${tag.term}`;
            
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent tag click event
                removeGlossaryTag(tag.id);
            });
            
            tagElement.appendChild(tagName);
            tagElement.appendChild(removeBtn);
            
            // Show glossary description on tag hover
            tagElement.addEventListener('mouseenter', () => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tag-tooltip';
                tooltip.textContent = tag.description;
                tagElement.appendChild(tooltip);
            });
            
            tagElement.addEventListener('mouseleave', () => {
                const tooltip = tagElement.querySelector('.tag-tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
            
            glossaryTagsContainer.appendChild(tagElement);
        });
        
        // Update the knowledge text based on the tags
        updateKnowledgeInput();
    }
    
    function updateKnowledgeInput() {
        // Create a combined text of all glossary descriptions
        const glossaryTexts = novelGlossaryTags.map(tag => {
            return `${tag.term}: ${tag.description}`;
        });
        
        // Join with separators and update the textarea
        knowledgeInput.value = glossaryTexts.join('\n\n');
    }
    
    function removeGlossaryTag(glossaryId) {
        const glossaryIndex = novelGlossaryTags.findIndex(g => g.id === glossaryId);
        if (glossaryIndex >= 0) {
            const glossaryTerm = novelGlossaryTags[glossaryIndex].term;
            novelGlossaryTags.splice(glossaryIndex, 1);
            updateGlossaryTagsDisplay();
            saveNovelContent();
            updateStatus(`已移除词条 "${glossaryTerm}"`);
        }
    }
    
    function filterGlossaryEntries() {
        const categoryFilter = glossaryCategoryFilter.value;
        const entries = document.querySelectorAll('#glossary-library-list li');
        
        entries.forEach(li => {
            const entryId = li.dataset.glossaryId;
            if (!entryId) return; // Skip non-entry items
            
            const entry = glossaryEntries.find(e => e.id === entryId);
            if (!entry) return;
            
            // Show if no filter or matches filter
            const shouldShow = !categoryFilter || entry.category === categoryFilter;
            li.style.display = shouldShow ? 'block' : 'none';
        });
        
        updateStatus(categoryFilter ? `已筛选 ${categoryFilter} 分类的词条。` : '显示所有词条。');
    }
    
    function highlightTermsInKnowledge() {
        if (!knowledgeInput || !glossaryEntries.length) return;
        
        // We're only highlighting visually, not changing the actual content
        // So no need to update the value, just use a CSS overlay or tooltips in a more advanced version
        
        // For this basic implementation, we'll just add a hover effect
        // A more advanced implementation would use a library like tippy.js for tooltips
        // or a contenteditable div with markup instead of a textarea
        
        // This is just a placeholder implementation
        const knowledgeContent = knowledgeInput.value;
        console.log("Found terms in knowledge: ", 
            glossaryEntries
                .filter(entry => knowledgeContent.includes(entry.term))
                .map(entry => entry.term)
                .join(", ")
        );
    }
    
    function showGlossaryLibrary() {
        hideAllContentAreas();
        glossaryArea.classList.remove('hidden');
    }

    // --- Style Library Functions ---

    async function fetchStyleEntries() {
        updateStatus('正在加载风格库...');
        try {
            const response = await fetch('/api/styles');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const entries = await response.json();
            
            // Store entries globally
            styleEntries = entries;
            
            // Clear existing categories and add new ones
            styleCategories.clear();
            entries.forEach(entry => {
                if (entry.category) {
                    styleCategories.add(entry.category);
                }
            });
            
            // Update category filter dropdown
            updateStyleCategoryFilter();
            
            // Update sidebar style list
            styleList.innerHTML = '';
            
            // Update full style library list
            styleLibraryList.innerHTML = '';
            
            if (entries && entries.length > 0) {
                // Create a dropdown select for style entries in the sidebar
                const styleSelect = document.createElement('select');
                styleSelect.className = 'sidebar-select';
                styleSelect.title = '选择风格';
                
                // Add default option
                const defaultOption = document.createElement('option');
                defaultOption.value = '';
                defaultOption.textContent = '-- 选择风格 --';
                styleSelect.appendChild(defaultOption);
                
                entries.forEach(entry => {
                    // Add option to dropdown
                    const option = document.createElement('option');
                    option.value = entry.id;
                    option.textContent = entry.name;
                    if (entry.category) {
                        option.textContent += ` (${entry.category})`;
                    }
                    styleSelect.appendChild(option);
                    
                    // Add to full library list - no changes needed here
                    const li = document.createElement('li');
                    li.dataset.styleId = entry.id;
                    
                    const nameDiv = document.createElement('div');
                    nameDiv.textContent = entry.name;
                    nameDiv.style.fontWeight = '500';
                    
                    if (entry.category) {
                        const categorySpan = document.createElement('span');
                        categorySpan.textContent = entry.category;
                        categorySpan.className = 'style-category';
                        nameDiv.appendChild(categorySpan);
                    }
                    
                    const contentDiv = document.createElement('div');
                    contentDiv.textContent = entry.content;
                    contentDiv.style.fontSize = '0.85em';
                    contentDiv.style.color = '#718096';
                    contentDiv.style.marginTop = '3px';
                    contentDiv.style.overflow = 'hidden';
                    contentDiv.style.textOverflow = 'ellipsis';
                    contentDiv.style.display = '-webkit-box';
                    contentDiv.style.webkitLineClamp = '2';
                    contentDiv.style.webkitBoxOrient = 'vertical';
                    
                    li.appendChild(nameDiv);
                    li.appendChild(contentDiv);
                    
                    li.addEventListener('click', () => loadStyleEntry(entry.id));
                    styleLibraryList.appendChild(li);
                });
                
                // Event listener for select change
                styleSelect.addEventListener('change', (e) => {
                    const selectedId = e.target.value;
                    if (selectedId) {
                        showStyleLibrary();
                        loadStyleEntry(selectedId);
                    }
                });
                
                // Add the select to the style list
                const selectContainer = document.createElement('li');
                selectContainer.className = 'select-container';
                selectContainer.appendChild(styleSelect);
                styleList.appendChild(selectContainer);
                
                updateStatus('风格库加载完毕。');
            } else {
                styleList.innerHTML = '<li>未找到任何风格。请创建一个！</li>';
                styleLibraryList.innerHTML = '<li>风格库为空。请点击"新建风格"创建风格。</li>';
                updateStatus('风格库为空。');
            }
            
        } catch (error) {
            console.error('Error fetching style entries:', error);
            styleList.innerHTML = '<li>加载风格库出错。</li>';
            styleLibraryList.innerHTML = '<li>加载风格库出错。</li>';
            updateStatus(`加载风格库出错: ${error.message}`, true);
        }
    }

    function updateStyleCategoryFilter() {
        // Clear existing options except "All Categories"
        while (styleCategoryFilter.options.length > 1) {
            styleCategoryFilter.remove(1);
        }
        
        // Add categories from the set
        Array.from(styleCategories).sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            styleCategoryFilter.appendChild(option);
        });
    }

    async function loadStyleEntry(styleId) {
        updateStatus(`正在加载风格 ${styleId}...`);
        try {
            const response = await fetch(`/api/styles/${styleId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const entry = await response.json();
            currentStyleId = entry.id;
            
            // Highlight selected entry in list
            document.querySelectorAll('#style-library-list li').forEach(li => {
                li.classList.toggle('active', li.dataset.styleId === styleId);
            });
            
            // Update the sidebar select dropdown
            const styleSelect = document.querySelector('#style-list .sidebar-select');
            if (styleSelect) {
                styleSelect.value = styleId;
            }
            
            // Display entry details
            styleDetail.innerHTML = `
                <div class="style-name">${entry.name}</div>
                ${entry.category ? `<div class="style-category-tag">${entry.category}</div>` : ''}
                <div class="style-content">${entry.content || '没有内容'}</div>
            `;
            
            // Show action buttons
            editStyleBtn.classList.remove('hidden');
            addStyleToNovelBtn.classList.remove('hidden');
            deleteStyleBtn.classList.remove('hidden');
            
            // Switch to view panel if we're in edit mode
            styleViewPanel.classList.remove('hidden');
            styleEditPanel.classList.add('hidden');
            
            updateStatus(`风格 '${entry.name}' 已加载。`);
            
        } catch (error) {
            console.error(`Error loading style entry ${styleId}:`, error);
            updateStatus(`加载风格出错: ${error.message}`, true);
            styleDetail.innerHTML = `<p class="error">加载风格时出错: ${error.message}</p>`;
            
            // Hide action buttons on error
            editStyleBtn.classList.add('hidden');
            addStyleToNovelBtn.classList.add('hidden');
            deleteStyleBtn.classList.add('hidden');
        }
    }

    function showNewStyleForm() {
        // Reset form
        styleForm.reset();
        currentStyleId = null;
        
        // Update UI
        styleEditTitle.textContent = '创建新风格';
        styleViewPanel.classList.add('hidden');
        styleEditPanel.classList.remove('hidden');
        
        // Focus on first input
        styleNameInput.focus();
    }

    async function showEditStyleForm() { // Made function async
        if (!currentStyleId) {
            alert("请先选择一个风格。");
            return;
        }

        updateStatus('正在加载风格详情以供编辑...');
        try {
            const response = await fetch(`/api/styles/${currentStyleId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const entry = await response.json();

            if (!entry) {
                alert("找不到选中的风格数据。");
                updateStatus('加载风格详情失败。', true);
                return;
            }
            
            // Update UI
            styleEditTitle.textContent = '编辑风格';
            styleNameInput.value = entry.name || '';
            styleCategoryInput.value = entry.category || '';
            styleContentInput.value = entry.content || ''; // Use full content
            
            styleViewPanel.classList.add('hidden');
            styleEditPanel.classList.remove('hidden');
            
            // Focus on first input
            styleNameInput.focus();
            updateStatus('风格详情已加载，可以开始编辑。');
        } catch (error) {
            console.error('Error fetching style entry for editing:', error);
            alert('加载风格详情以供编辑时出错，请稍后重试。');
            updateStatus('加载风格详情失败。', true);
        }
    }

    async function saveStyleEntry(event) {
        event.preventDefault();
        
        const name = styleNameInput.value.trim();
        const category = styleCategoryInput.value.trim();
        const content = styleContentInput.value.trim();
        
        if (!name) {
            alert("风格名称不能为空！");
            styleNameInput.focus();
            return;
        }
        
        updateStatus('保存风格中...');
        try {
            let url = '/api/styles';
            let method = 'POST';
            
            // If editing, use PUT method
            if (currentStyleId) {
                url = `/api/styles/${currentStyleId}`;
                method = 'PUT';
            }
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    category: category,
                    content: content
                }),
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Switch back to view mode
            styleViewPanel.classList.remove('hidden');
            styleEditPanel.classList.add('hidden');
            
            // Reload library to reflect changes
            await fetchStyleEntries();
            
            // Load the newly created or edited style
            const styleId = currentStyleId || result.id;
            loadStyleEntry(styleId);
            
            updateStatus(`风格 '${name}' 已保存。`);
            
        } catch (error) {
            console.error('Error saving style:', error);
            updateStatus(`保存风格出错: ${error.message}`, true);
            alert(`保存风格时出错: ${error.message}`);
        }
    }

    async function deleteStyleEntry() {
        if (!currentStyleId) {
            alert("请先选择一个风格。");
            return;
        }
        
        // Get current entry for name
        const entry = styleEntries.find(e => e.id === currentStyleId);
        if (!entry) {
            alert("找不到选中的风格。");
            return;
        }
        
        if (!confirm(`确定要删除风格 '${entry.name}' 吗？此操作不可撤销。`)) {
            return;
        }
        
        updateStatus(`正在删除风格 '${entry.name}'...`);
        try {
            const response = await fetch(`/api/styles/${currentStyleId}`, {
                method: 'DELETE',
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Reset current selection
            currentStyleId = null;
            
            // Clear detail view
            styleDetail.innerHTML = `<p class="select-style-prompt">请从左侧选择一个风格，或创建新风格。</p>`;
            
            // Hide action buttons
            editStyleBtn.classList.add('hidden');
            addStyleToNovelBtn.classList.add('hidden');
            deleteStyleBtn.classList.add('hidden');
            
            // Reload library
            await fetchStyleEntries();
            
            updateStatus(`风格 '${entry.name}' 已删除。`);
            
        } catch (error) {
            console.error(`Error deleting style ${currentStyleId}:`, error);
            updateStatus(`删除风格出错: ${error.message}`, true);
            alert(`删除风格时出错: ${error.message}`);
        }
    }

    function cancelStyleEdit() {
        styleViewPanel.classList.remove('hidden');
        styleEditPanel.classList.add('hidden');
        
        // If we had a style selected, reselect it
        if (currentStyleId) {
            // Just update UI, no need to refetch
            const entries = document.querySelectorAll(`#style-library-list li[data-style-id="${currentStyleId}"]`);
            if (entries && entries.length > 0) {
                entries[0].click();
            }
        }
    }

    async function addStyleToNovel() { // Ensure this is async
        if (!currentNovelId) {
            alert("请先打开一部小说。");
            return;
        }
        
        if (!currentStyleId) {
            alert("请先选择一个风格。");
            return;
        }
        
        updateStatus('正在获取完整风格信息以添加到小说...');
        try {
            // Fetch the full style details
            const response = await fetch(`/api/styles/${currentStyleId}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status} while fetching full style entry.`);
            }
            const fullEntry = await response.json();

            if (!fullEntry) {
                alert("获取完整风格信息失败。");
                updateStatus('获取完整风格信息失败。', true);
                return;
            }
        
            // Add or update style tag instead of directly to textarea, using the full entry
            addOrUpdateStyleTag(fullEntry); // Changed function name
            
            // Auto-save the novel
            saveNovelContent();
            
            // Return to writing area
            showWritingArea();
        } catch (error) {
            console.error('Error fetching full style entry to add/update in novel:', error);
            alert('添加或更新风格到小说时出错: 无法获取完整风格信息。');
            updateStatus('添加或更新风格到小说失败。', true);
        }
    }
    
    // Create style tags array if not exists in novel data
    let novelStyleTags = [];
    
    // Renamed and modified function to add or update style tag
    function addOrUpdateStyleTag(styleEntry) { 
        // Check if tag already exists
        const existingTagIndex = novelStyleTags.findIndex(tag => tag.id === styleEntry.id);
        
        const updatedTagData = {
            id: styleEntry.id,
            name: styleEntry.name,
            content: styleEntry.content,
            category: styleEntry.category || ""
        };
        
        if (existingTagIndex >= 0) {
            // Tag exists - UPDATE the existing entry
            novelStyleTags[existingTagIndex] = updatedTagData;
            updateStatus(`已更新小说中的风格: '${styleEntry.name}'`);
        } else {
            // Tag does not exist - ADD the new entry
            novelStyleTags.push(updatedTagData);
            updateStatus(`已将风格 '${styleEntry.name}' 添加到当前小说的风格提示中。`);
        }
        
        // Update the style display with all style tags
        updateStyleTagsDisplay(); 
    }
    
    function updateStyleTagsDisplay() {
        // First ensure we have a container for style tags
        let styleTagsContainer = document.getElementById('style-tags-container');
        if (!styleTagsContainer) {
            // Create container if it doesn't exist
            styleTagsContainer = document.createElement('div');
            styleTagsContainer.id = 'style-tags-container';
            styleTagsContainer.className = 'tags-container';
            
            // Insert it before the style prompt input
            const styleParent = stylePromptInput.parentElement;
            styleParent.insertBefore(styleTagsContainer, stylePromptInput);
        }
        
        // Clear existing tags
        styleTagsContainer.innerHTML = '';
        
        // Create tag elements
        novelStyleTags.forEach(tag => {
            const tagElement = document.createElement('div');
            tagElement.className = 'tag style-tag';
            tagElement.dataset.styleId = tag.id;
            
            const tagName = document.createElement('div');
            tagName.className = 'tag-name';
            tagName.textContent = tag.name;
            tagName.title = tag.name;
            
            const removeBtn = document.createElement('div');
            removeBtn.className = 'tag-remove';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.title = `移除风格 ${tag.name}`;
            
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent tag click event
                removeStyleTag(tag.id);
            });
            
            tagElement.appendChild(tagName);
            tagElement.appendChild(removeBtn);
            
            // Show style content on tag hover
            tagElement.addEventListener('mouseenter', () => {
                const tooltip = document.createElement('div');
                tooltip.className = 'tag-tooltip';
                tooltip.textContent = tag.content;
                tagElement.appendChild(tooltip);
            });
            
            tagElement.addEventListener('mouseleave', () => {
                const tooltip = tagElement.querySelector('.tag-tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
            
            styleTagsContainer.appendChild(tagElement);
        });
        
        // Update the style text based on the tags
        updateStylePromptInput();
    }
    
    function updateStylePromptInput() {
        // Create a combined text of all style descriptions
        const styleTexts = novelStyleTags.map(tag => tag.content);
        
        // Join with separators and update the textarea
        stylePromptInput.value = styleTexts.join('\n\n');
    }
    
    function removeStyleTag(styleId) {
        const styleIndex = novelStyleTags.findIndex(s => s.id === styleId);
        if (styleIndex >= 0) {
            const styleName = novelStyleTags[styleIndex].name;
            novelStyleTags.splice(styleIndex, 1);
            updateStyleTagsDisplay();
            saveNovelContent();
            updateStatus(`已移除风格 "${styleName}"`);
        }
    }

    function filterStyleEntries() {
        const categoryFilter = styleCategoryFilter.value;
        const entries = document.querySelectorAll('#style-library-list li');
        
        entries.forEach(li => {
            const entryId = li.dataset.styleId;
            if (!entryId) return; // Skip non-entry items
            
            const entry = styleEntries.find(e => e.id === entryId);
            if (!entry) return;
            
            // Show if no filter or matches filter
            const shouldShow = !categoryFilter || entry.category === categoryFilter;
            li.style.display = shouldShow ? 'block' : 'none';
        });
        
        updateStatus(categoryFilter ? `已筛选 ${categoryFilter} 分类的风格。` : '显示所有风格。');
    }

    function showStyleLibrary() {
        hideAllContentAreas();
        styleArea.classList.remove('hidden');
        
        // Make sure we're in view mode, not edit mode
        styleViewPanel.classList.remove('hidden');
        styleEditPanel.classList.add('hidden');
        
        updateStatus('已打开风格库。');
    }

    // Import MD file as style entry
    async function showImportMdFileDialog() {
        try {
            updateStatus('正在获取可导入的MD文件列表...');
            const response = await fetch('/api/styles/list-md-files');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const mdFiles = await response.json();
            
            if (!mdFiles || mdFiles.length === 0) {
                alert('未找到可导入的MD文件。请确保在软件的prompt文件夹中存在.md文件。');
                updateStatus('未找到可导入的MD文件', true);
                return;
            }
            
            // Create a modal dialog for file selection
            const modalOverlay = document.createElement('div');
            modalOverlay.className = 'modal-overlay';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content';
            modalContent.style.width = '500px';
            modalContent.style.maxHeight = '80vh';
            modalContent.style.overflowY = 'auto';
            
            const modalHeader = document.createElement('div');
            modalHeader.className = 'modal-header';
            modalHeader.innerHTML = '<h3>选择要导入的MD文件</h3>';
            
            const closeButton = document.createElement('button');
            closeButton.className = 'modal-close-btn';
            closeButton.innerHTML = '&times;';
            closeButton.onclick = () => document.body.removeChild(modalOverlay);
            modalHeader.appendChild(closeButton);
            
            const modalBody = document.createElement('div');
            modalBody.className = 'modal-body';
            
            // Create file list
            const fileList = document.createElement('ul');
            fileList.className = 'import-file-list';
            fileList.style.listStyle = 'none';
            fileList.style.padding = '0';
            fileList.style.margin = '0';
            
            mdFiles.forEach(file => {
                const li = document.createElement('li');
                
                // 创建图标元素
                const icon = document.createElement('i');
                icon.className = 'fas fa-file-alt';
                
                // 创建文件名文本元素
                const textSpan = document.createElement('span');
                textSpan.textContent = file;
                
                // 添加子元素到列表项
                li.appendChild(icon);
                li.appendChild(textSpan);
                
                li.addEventListener('click', async () => {
                    try {
                        updateStatus(`正在导入文件 ${file}...`);
                        
                        const response = await fetch('/api/styles/import-md', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ filename: file })
                        });
                        
                        if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.error || `导入失败，HTTP状态码: ${response.status}`);
                        }
                        
                        const importedStyle = await response.json();
                        document.body.removeChild(modalOverlay);
                        
                        updateStatus(`已成功导入文件 ${file}`);
                        
                        // Refresh style entries and then open the imported style
                        await fetchStyleEntries();
                        loadStyleEntry(importedStyle.id);
                        
                    } catch (error) {
                        console.error('Error importing MD file:', error);
                        alert(`导入文件出错: ${error.message}`);
                        updateStatus(`导入文件出错: ${error.message}`, true);
                    }
                });
                
                fileList.appendChild(li);
            });
            
            modalBody.appendChild(fileList);
            
            modalContent.appendChild(modalHeader);
            modalContent.appendChild(modalBody);
            modalOverlay.appendChild(modalContent);
            
            document.body.appendChild(modalOverlay);
            updateStatus('请选择要导入的MD文件');
            
        } catch (error) {
            console.error('Error fetching MD files:', error);
            alert(`获取MD文件列表出错: ${error.message}`);
            updateStatus(`获取MD文件列表出错: ${error.message}`, true);
        }
    }

    // --- Event Listeners ---

    newNovelBtn.addEventListener('click', createNewNovel);
    
    // Import novel button click handler
    importNovelBtn.addEventListener('click', () => {
        importFileInput.click(); // Trigger the hidden file input
    });
    
    // AIGC降重 button click handler
    const rewriteNovelBtn = document.getElementById('rewrite-novel-btn');
    if (rewriteNovelBtn) {
        rewriteNovelBtn.addEventListener('click', rewriteNovelContent);
    }
    
    // File input change handler
    importFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            importNovel(file);
        }
        // Reset the input so the same file can be chosen again
        event.target.value = '';
    });
    
    // Add event listener to prompt input for Enter key
    promptInput.addEventListener('keypress', function(event) {
        // Check if the pressed key was 'Enter'
        if (event.key === 'Enter') {
            // Prevent the default action (form submission or newline)
            event.preventDefault();
            // Trigger the click event on the generate button
            generateBtn.click();
        }
    });
    
    generateBtn.addEventListener('click', () => generateText(false)); // Generate from prompt
    continueBtn.addEventListener('click', () => generateText(true)); // Continue from content
    toolboxGenerateBtn.addEventListener('click', generateToolboxOutput);
    const toolboxReturnBtn = document.getElementById('toolbox-return-btn');
    if (toolboxReturnBtn) {
        toolboxReturnBtn.addEventListener('click', () => {
            hideAllContentAreas();
            welcomeScreen.classList.remove('hidden');
        });
    }
    saveNovelBtn.addEventListener('click', saveNovelContent);
    
    // Character Library Event Listeners
    openCharacterLibraryBtn.addEventListener('click', showCharacterLibrary);
    addToNovelBtn.addEventListener('click', addCharacterToNovel);
    
    // Save character to library event
    saveCharacterBtn.addEventListener('click', async () => {
        if (!lastGeneratedCharacter) {
            alert("请先生成一个角色。");
            return;
        }
        
        // Directly save the generated character without showing the form
        await saveGeneratedCharacterToLibrary(lastGeneratedCharacter);
        
        // Hide the save button after attempting to save
        saveCharacterBtn.classList.add('hidden');
        lastGeneratedCharacter = null; // Clear the stored character
    });
    
    // Copy toolbox output
    copyToolboxOutputBtn.addEventListener('click', () => {
        const textToCopy = toolboxOutputText.textContent;
        if (!textToCopy) {
            alert("没有可复制的内容。");
            return;
        }
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            updateStatus("输出内容已复制到剪贴板。");
        }, (err) => {
            console.error('复制失败:', err);
            updateStatus("复制内容失败。", true);
        });
    });

    // Add to outline button click handler
    const addToOutlineBtn = document.getElementById('add-to-outline-btn');
    if (addToOutlineBtn) {
        addToOutlineBtn.addEventListener('click', () => {
            const synopsisText = toolboxOutputText.textContent;
            if (!synopsisText) {
                alert("没有可添加的内容。");
                return;
            }

            // Show outline generator
            showToolbox('outline');
            
            // Set the synopsis text as the prompt
            toolboxPrompt.value = synopsisText;
            
            updateStatus("已将简介内容添加到大纲生成器。");
        });
    }

    // Add to detailed outline button click handler (for outline generator)
    let addToDetailedOutlineBtn = document.getElementById('add-to-detailed-outline-btn');
    if (!addToDetailedOutlineBtn) {
        // 动态创建按钮并插入到大纲生成器输出区域
        const toolboxOutputActions = document.querySelector('#toolbox-output .output-actions');
        if (toolboxOutputActions) {
            addToDetailedOutlineBtn = document.createElement('button');
            addToDetailedOutlineBtn.id = 'add-to-detailed-outline-btn';
            addToDetailedOutlineBtn.title = '添加到细纲';
            addToDetailedOutlineBtn.className = 'hidden';
            addToDetailedOutlineBtn.innerHTML = '<i class="fas fa-tasks"></i> 添加到细纲';
            toolboxOutputActions.appendChild(addToDetailedOutlineBtn);
        }
    }
    if (addToDetailedOutlineBtn) {
        addToDetailedOutlineBtn.addEventListener('click', () => {
            const outlineText = toolboxOutputText.textContent;
            if (!outlineText) {
                alert("没有可添加的内容。");
                return;
            }
            showToolbox('detailed-outline');
            toolboxPrompt.value = outlineText;
            updateStatus("已将大纲内容添加到细纲生成器。");
        });
    }

    // Word Count Listener
    novelContent.addEventListener('input', updateWordCount);

    // Export Listeners (point to new generic function)
    exportTxtBtn.addEventListener('click', () => exportNovel('txt'));
    exportJsonBtn.addEventListener('click', () => exportNovel('json'));
    exportDocxBtn.addEventListener('click', () => exportNovel('docx'));
    saveToGlossaryBtn.addEventListener('click', async () => {
        if (!currentNovelId) {
            alert("请先加载或创建一部小说。");
            return;
        }
        const content = novelContent.value;
        if (!content.trim()) {
            alert("小说内容为空，无法存入词条。");
            return;
        }
        // Use the novel title as the glossary term, or a default if title is not set
        const term = writingNovelTitle.textContent || "未命名小说内容"; 
        const entryData = {
            term: term,
            description: content,
            category: '小说片段' // Default category
        };
        updateStatus(`正在将小说内容存为词条: ${term}...`);
        try {
            const response = await fetch('/api/glossary', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(entryData)
            });
            if (!response.ok) {
                let errorDetail = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorDetail = errorData.message || errorData.error || errorDetail;
                } catch (jsonError) {
                    errorDetail = await response.text() || errorDetail;
                }
                throw new Error(errorDetail);
            }
            const result = await response.json();
            updateStatus(`小说内容已作为词条 '${term}' 保存 (ID: ${result.id})。`);
            await fetchGlossaryEntries(); // Refresh glossary list
             // Optionally, open glossary and select the new entry
            showGlossaryLibrary();
            if (result.id) {
                loadGlossaryEntry(result.id);
            }
        } catch (error) {
            console.error('Error saving novel content to glossary:', error);
            updateStatus(`存入词条失败: ${error.message}`, true);
            alert(`存入词条失败: ${error.message}`);
        }
    });

    toolboxBtns.forEach(btn => {
        btn.addEventListener('click', () => showToolbox(btn.dataset.tool));
    });

    // Glossary Library Event Listeners
    openGlossaryBtn.addEventListener('click', showGlossaryLibrary);
    newGlossaryEntryBtn.addEventListener('click', showNewGlossaryForm);
    editGlossaryBtn.addEventListener('click', showEditGlossaryForm);
    glossaryForm.addEventListener('submit', saveGlossaryEntry);
    glossaryCancelBtn.addEventListener('click', cancelGlossaryEdit);
    deleteGlossaryBtn.addEventListener('click', deleteGlossaryEntry);
    addGlossaryToNovelBtn.addEventListener('click', addGlossaryToNovel);
    glossaryCategoryFilter.addEventListener('change', filterGlossaryEntries);

    // Style Library Event Listeners
    openStyleLibraryBtn.addEventListener('click', showStyleLibrary);
    newStyleBtn.addEventListener('click', showNewStyleForm);
    importMdStyleBtn.addEventListener('click', showImportMdFileDialog);
    editStyleBtn.addEventListener('click', showEditStyleForm);
    styleForm.addEventListener('submit', saveStyleEntry);
    styleCancelBtn.addEventListener('click', cancelStyleEdit);
    deleteStyleBtn.addEventListener('click', deleteStyleEntry);
    addStyleToNovelBtn.addEventListener('click', addStyleToNovel);
    styleCategoryFilter.addEventListener('change', filterStyleEntries);

    // --- Character Library Event Listeners ---
    newCharacterBtn.addEventListener('click', showNewCharacterForm);
    editCharacterBtn.addEventListener('click', showEditCharacterForm);
    characterForm.addEventListener('submit', saveCharacterToLibrary);
    characterCancelBtn.addEventListener('click', cancelCharacterEdit);
    deleteCharacterBtn.addEventListener('click', deleteCharacterFromLibrary);
    openCharacterLibraryBtn.addEventListener('click', showCharacterLibrary);

    // --- Initial Load ---

    fetchModels();
    fetchNovels();
    fetchCharacters(); // Load character library on startup
    fetchGlossaryEntries(); // Load glossary on startup

    // Initialize the application with all data
    async function initializeApp() {
        updateStatus('正在初始化应用...');
        try {
            // Fetch everything concurrently for faster loading
            await Promise.all([
                fetchModels(),
                fetchNovels(),
                fetchCharacters(),
                fetchGlossaryEntries(),
                fetchStyleEntries(),
                loadCustomApis() // Load custom APIs during initialization
            ]);
            
            // 初始化后添加模型选择器的事件监听
            if (modelSelect) {
                modelSelect.addEventListener('change', function() {
                    const selectedModelId = this.value;
                    if (selectedModelId) {
                        saveSelectedModel(selectedModelId);
                        console.log(`Model selection changed, saved to localStorage: ${selectedModelId}`);
                    }
                });
            }
            
            // Check for stored novel ID and try to load it
            const storedNovelId = localStorage.getItem('currentNovelId');
            if (storedNovelId) {
                console.log('Found stored novel ID:', storedNovelId);
                try {
                    await loadNovel(storedNovelId);
                } catch (e) {
                    console.error('Failed to load stored novel:', e);
                    // Remove invalid ID from storage
                    localStorage.removeItem('currentNovelId');
                }
            }
            
            updateStatus('应用已初始化完成。');
        } catch (error) {
            console.error('Initialization error:', error);
            updateStatus('初始化失败，请刷新页面重试。', true);
        }
    }

    // Start the initialization process
    initializeApp();

    // Initialize new temperature and context length controls
    const temperatureSlider = document.getElementById('temperature-slider');
    const temperatureValue = document.getElementById('temperature-value');

    // Event listeners for temperature slider
    temperatureSlider.addEventListener('input', function() {
        currentTemperature = parseFloat(this.value);
        temperatureValue.textContent = currentTemperature.toFixed(1);
    });

    // Event listener for context length input - Removed
    // contextLengthInput.addEventListener('change', function() {
    //     currentContextLength = parseInt(this.value, 10);
    // });

    // 欢迎屏幕的新元素
    const welcomeNewNovelBtn = document.getElementById('welcome-new-novel-btn');
    const welcomeImportBtn = document.getElementById('welcome-import-btn');
    const welcomeStatus = document.getElementById('welcome-status');

    // 更新欢迎屏幕的状态显示
    function updateWelcomeStatus(message, isError = false) {
        if (welcomeStatus) { // Restore missing if check
            welcomeStatus.textContent = message; // Restore missing text update
            welcomeStatus.style.color = isError ? '#e53e3e' : '#2c5282';
            welcomeStatus.style.backgroundColor = isError ? '#fed7d7' : '#ebf8ff';
            welcomeStatus.style.borderLeftColor = isError ? '#f56565' : '#4299e1';
        }
    }

    // 欢迎屏幕按钮事件
    if (welcomeNewNovelBtn) {
        welcomeNewNovelBtn.addEventListener('click', createNewNovel);
    }
    
    if (welcomeImportBtn) {
        welcomeImportBtn.addEventListener('click', () => {
            importFileInput.click();
        });
    }

    // 修改现有的updateStatus函数，同时更新欢迎屏幕状态
    const originalUpdateStatus = updateStatus;
    updateStatus = function(message, isError = false) {
        originalUpdateStatus(message, isError);
        updateWelcomeStatus(message, isError);
    }
    
    // 添加拆分文章按钮的事件监听
    const splitNovelBtn = document.getElementById('split-novel-btn');
    if (splitNovelBtn) {
        splitNovelBtn.addEventListener('click', analyzeAndSplitNovel);
    }
    
    // 保存文件到服务器exports文件夹
    async function saveTextFileToServer(content, filename) {
        try {
            const response = await fetch('/api/save-text-file', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: content,
                    filename: filename
                })
            });
            
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) { /* Ignore */ }
                throw new Error(errorMsg);
            }
            
            const result = await response.json();
            updateStatus(`文件已保存至: ${result.filepath}`);
            return result.filepath;
        } catch (error) {
            console.error('保存文件失败:', error);
            updateStatus(`保存文件失败: ${error.message}`, true);
            throw error;
        }
    }

    // 拆分文章功能实现
    async function analyzeAndSplitNovel() {
        const novelContent = document.getElementById('novel-content').value;
        const title = document.getElementById('writing-novel-title').textContent || '未命名作品';
        const charactersText = document.getElementById('characters-input').value;
        const knowledgeText = document.getElementById('knowledge-input').value;
        const styleText = document.getElementById('style-prompt-input').value;
        
        if (!novelContent || novelContent.trim().length < 100) {
            alert('小说内容太少，无法进行有效分析。请至少输入100个字符。');
            return;
        }
        
        const selectedModel = modelSelect.value;
        if (!selectedModel) {
            alert('请先选择一个AI模型以进行小说分析。');
            return;
        }
        
        updateStatus('正在分析小说内容，请稍候...');
        splitNovelBtn.disabled = true;
        splitNovelBtn.classList.add('loading'); // 添加加载动画
        splitNovelBtn.textContent = ' 分析中...'; // 更改文本内容
        
        try {
            // 1. 生成小说大纲
            updateStatus('正在生成小说大纲...');
            const outlinePrompt = `分析以下小说内容，提取出一个清晰的大纲，包含主要章节和关键情节点：\n\n${novelContent}`;
            const outlineResult = await generateAnalysis(selectedModel, outlinePrompt);
            
            // 2. 生成细纲
            updateStatus('正在生成小说细纲...');
            const detailedOutlinePrompt = `分析以下小说内容，生成一个详细的细纲，包含每个场景的描述和转折点：\n\n${novelContent}`;
            const detailedOutlineResult = await generateAnalysis(selectedModel, detailedOutlinePrompt);
            
            // 3. 提取人物信息
            updateStatus('正在提取人物信息...');
            const charactersPrompt = `分析以下小说内容，提取所有出现的人物角色及其特征、背景故事和性格特点，以列表形式呈现：\n\n${novelContent}`;
            const charactersResult = await generateAnalysis(selectedModel, charactersPrompt);
            
            // 4. 分析人物关系
            updateStatus('正在分析人物关系...');
            const relationshipsPrompt = `分析以下小说内容，概括所有主要人物之间的关系网络和互动：\n\n${novelContent}`;
            const relationshipsResult = await generateAnalysis(selectedModel, relationshipsPrompt);
            
            // 5. 提取世界设定/背景信息
            updateStatus('正在提取世界设定和背景信息...');
            const worldBuildingPrompt = `分析以下小说内容，总结其世界观、背景设定、特殊规则或环境描述：\n\n${novelContent}`;
            const worldBuildingResult = await generateAnalysis(selectedModel, worldBuildingPrompt);
            
            // 6. 提取主题与写作风格
            updateStatus('正在分析主题与写作风格...');
            const themesPrompt = `分析以下小说内容，提取其中的主题、中心思想以及写作风格特点：\n\n${novelContent}`;
            const themesResult = await generateAnalysis(selectedModel, themesPrompt);
            
            // 组织结果
            const result = generateFormattedReport(
                title,
                novelContent,
                outlineResult,
                detailedOutlineResult,
                charactersResult,
                relationshipsResult,
                worldBuildingResult,
                themesResult,
                charactersText,
                knowledgeText,
                styleText
            );
            
            // 保存到服务器的exports文件夹
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `${title}_拆分分析_${timestamp}.txt`;
            await saveTextFileToServer(result, filename);
            
            updateStatus('小说拆分分析完成！文件已保存到服务器的exports文件夹');
        } catch (error) {
            console.error('小说分析过程中出错:', error);
            updateStatus(`小说分析失败: ${error.message}`, true);
        } finally {
            splitNovelBtn.disabled = false;
            splitNovelBtn.classList.remove('loading'); // 移除加载动画
            // 恢复按钮文本和图标
            splitNovelBtn.innerHTML = '<i class="fas fa-file-alt"></i> 拆分文章';
        }
    }
    
    // 生成单个分析结果的辅助函数
    async function generateAnalysis(model, prompt) {
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: model,
                    prompt: prompt,
                    temperature: 0.3
                })
            });
            
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) { /* Ignore */ }
                throw new Error(errorMsg);
            }
            
            // 处理流式响应
            const reader = response.body.getReader();
            let fullText = '';
            
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                // 将二进制数据转换为文本
                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n');
                
                for (const line of lines) {
                    if (line.trim().startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data.trim() === '[DONE]') continue;
                        
                        try {
                            const parsed = JSON.parse(data);
                            if (parsed.token) {
                                fullText += parsed.token;
                            } else if (parsed.error) {
                                throw new Error(parsed.error);
                            }
                        } catch (e) {
                            if (!line.includes('OPENROUTER PROCESSING')) {
                                console.error('解析数据出错:', e, '原始数据:', data);
                            }
                        }
                    }
                }
            }
            
            return fullText || "未能生成分析。";
        } catch (error) {
            console.error('分析生成错误:', error);
            return `分析生成失败: ${error.message}`;
        }
    }
    
    // 格式化最终报告
    function generateFormattedReport(
        title,
        content,
        outline,
        detailedOutline,
        characters,
        relationships,
        worldBuilding,
        themes,
        userCharacters,
        userKnowledge,
        userStyle
    ) {
        const wordCount = content.length;
        const timestamp = new Date().toLocaleString();
        
        return `《${title}》拆分分析报告
生成时间: ${timestamp}
总字数: ${wordCount}

===========================================
原有设定信息
===========================================

${userCharacters ? `【角色设定】\n${userCharacters}\n\n` : ''}
${userKnowledge ? `【世界知识】\n${userKnowledge}\n\n` : ''}
${userStyle ? `【写作风格】\n${userStyle}\n\n` : ''}

===========================================
一、小说大纲
===========================================

${outline}

===========================================
二、小说细纲
===========================================

${detailedOutline}

===========================================
三、人物角色列表
===========================================

${characters}

===========================================
四、人物关系网络
===========================================

${relationships}

===========================================
五、世界设定与背景
===========================================

${worldBuilding}

===========================================
六、主题与写作风格分析
===========================================

${themes}

===========================================
注意：本报告通过AI自动分析生成，仅供参考。
===========================================`;
    }
    
    // 下载文本文件
    function downloadTextFile(content, filename) {
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Inspiration feature event listeners
    const inspirationBtn = document.getElementById('inspiration-btn');
    const originalContentWrapper = document.getElementById('original-content-wrapper');
    const inspirationContentWrapper = document.getElementById('inspiration-content-wrapper');
    const originalText = document.getElementById('original-text');
    const imitationText = document.getElementById('imitation-text');
    const startImitationBtn = document.getElementById('start-imitation-btn');

    inspirationBtn.addEventListener('click', () => {
        const currentContent = novelContent.value;
        if (!currentContent || currentContent.trim().length === 0) {
            alert('请先输入一些内容以进行灵感汲取。');
            return;
        }
        
        // Switch to inspiration mode
        originalContentWrapper.classList.add('hidden');
        inspirationContentWrapper.classList.remove('hidden');
        
        // Copy current content to original text panel
        originalText.value = currentContent;
        
        // Clear imitation text
        imitationText.value = '';
    });

    startImitationBtn.addEventListener('click', async () => {
        const selectedModel = modelSelect.value;
        if (!selectedModel) {
            alert('请先选择一个AI模型以进行模仿生成。');
            return;
        }

        const originalContent = originalText.value;
        if (!originalContent || originalContent.trim().length === 0) {
            alert('原文内容为空，无法进行模仿生成。');
            return;
        }

        updateStatus('正在分析原文并生成模仿内容，请稍候...');
        startImitationBtn.disabled = true;
        startImitationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';

        try {
            // Analyze the original content
            const analysisPrompt = `分析以下文章的结构、情节和人物角色，并总结其写作特点：\n\n${originalContent}`;
            const analysisResult = await generateAnalysis(selectedModel, analysisPrompt);

            // Generate imitation content
            const imitationPrompt = `根据以下分析结果，严格按照原文的架构和结构，生成一篇新的文章：\n\n分析结果：${analysisResult}\n\n原文：${originalContent}`;
            const imitationResult = await generateAnalysis(selectedModel, imitationPrompt);

            // Display the result
            imitationText.value = imitationResult;
            updateStatus('模仿生成完成！');
        } catch (error) {
            console.error('模仿生成过程中出错:', error);
            updateStatus(`模仿生成失败: ${error.message}`, true);
            alert(`模仿生成失败: ${error.message}`);
        } finally {
            startImitationBtn.disabled = false;
            startImitationBtn.innerHTML = '<i class="fas fa-magic"></i> 开始模仿';
        }
    });

    // Add a way to return to normal mode
    const returnToNormalMode = () => {
        originalContentWrapper.classList.remove('hidden');
        inspirationContentWrapper.classList.add('hidden');
    };

    // Add return button to inspiration panel
    const returnBtn = document.createElement('button');
    returnBtn.className = 'btn btn-secondary';
    returnBtn.innerHTML = '<i class="fas fa-arrow-left"></i> 返回';
    returnBtn.style.marginBottom = '10px';
    returnBtn.addEventListener('click', returnToNormalMode);
    inspirationContentWrapper.querySelector('.inspiration-panel').insertBefore(returnBtn, inspirationContentWrapper.querySelector('.inspiration-panel').firstChild);

    // --- Text Game Functionality ---
    const textGameBtn = document.getElementById('text-game-btn');
    const gameChatArea = document.getElementById('game-chat-area');
    const toggleSettingsBtn = document.getElementById('toggle-settings-btn');
    const gameSettingsPanel = document.querySelector('.game-settings-panel');
    const settingsContent = document.querySelector('.settings-content');
    const applySettingsBtn = document.getElementById('apply-settings-btn');
    const characterSetting = document.getElementById('character-setting');
    const worldSetting = document.getElementById('world-setting');
    const styleSetting = document.getElementById('style-setting');
    const chatMessages = document.getElementById('chat-messages');
    const gameMessageInput = document.getElementById('game-message-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const typingIndicator = document.querySelector('.typing-indicator');

    // Store game state
    let gameSettings = {
        character: '',
        world: '',
        style: ''
    };
    let chatHistory = [];
    let isGenerating = false;

    // DOM elements for chat export/import
    const exportChatBtn = document.getElementById('export-chat-btn');
    const importChatBtn = document.getElementById('import-chat-btn');
    const importChatFileInput = document.getElementById('import-chat-file-input');
    const returnHomeBtn = document.getElementById('return-home-btn');

    // Show the game chat interface
    function showGameChat() {
        hideAllContentAreas();
        gameChatArea.classList.remove('hidden');
    }

    // Return to home page
    function returnToHome() {
        hideAllContentAreas();
        welcomeScreen.classList.remove('hidden');
    }

    // Toggle settings panel
    function toggleSettingsPanel() {
        settingsContent.classList.toggle('hidden');
        const icon = toggleSettingsBtn.querySelector('i');
        if (settingsContent.classList.contains('hidden')) {
            icon.classList.remove('fa-chevron-up');
            icon.classList.add('fa-chevron-down');
        } else {
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-up');
        }
    }

    // Apply settings and generate a new game context
    async function applyGameSettings() {
        const character = characterSetting.value.trim();
        const world = worldSetting.value.trim();
        const style = styleSetting.value.trim();

        if (!character && !world && !style) {
            alert('请至少填写一项设置内容');
            return;
        }

        gameSettings = {
            character,
            world,
            style
        };

        // Clear chat history and start a new game
        chatHistory = [];
        chatMessages.innerHTML = '';

        // Add typing indicator
        showTypingIndicator();

        // Construct prompt for the initial game context
        let prompt = "你现在是一个文字游戏的AI伙伴。根据以下设定，创建一个引人入胜的开场白，描述场景并引导玩家开始互动。\n\n";
        
        if (character) {
            prompt += `角色设定：${character}\n\n`;
        }
        
        if (world) {
            prompt += `世界设定：${world}\n\n`;
        }
        
        if (style) {
            prompt += `风格设定：${style}\n\n`;
        }
        
        prompt += "请创建一个详细的开场白，描述场景，并向玩家提问以开始互动。内容应当富有画面感和代入感。";

        // Generate initial game context
        await generateGameResponse(prompt);
    }

    // Export chat history to JSON file
    async function exportChatHistory() {
        if (chatHistory.length === 0) {
            alert("聊天记录为空，无法导出。");
            return;
        }

        updateStatus("正在导出聊天记录...");
        exportChatBtn.disabled = true;

        try {
            // 准备导出数据，确保格式正确
            const exportData = {
                version: "1.0", // 添加版本信息以便向后兼容
                timestamp: new Date().toISOString(),
                settings: gameSettings || {}, // 确保settings始终为对象
                chat_history: chatHistory.map(msg => ({
                    role: msg.role,
                    content: msg.content
                })) // 确保格式统一
            };
            
            console.log("准备导出数据:", exportData);
            
            // 选项1: 保存到服务器
            const response = await fetch('/api/chat/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_history: exportData.chat_history,
                    settings: exportData.settings
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `导出时发生未知错误 (HTTP ${response.status})`);
            }

            updateStatus(result.message || "聊天记录已成功导出。");
            
            // 选项2: 直接下载到用户本地
            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            a.href = url;
            a.download = `Chat_Export_${timestamp}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            alert(result.message + "\n\n同时已下载到您的本地计算机。");
        } catch (error) {
            console.error("Error exporting chat history:", error);
            const errorText = `导出聊天记录失败: ${error.message}`;
            updateStatus(errorText, true);
            alert(errorText);
        } finally {
            exportChatBtn.disabled = false;
        }
    }

    // Import chat history from JSON file
    function importChatHistory() {
        // Create modal for import options
        const modalContainer = document.createElement('div');
        modalContainer.className = 'modal-container';
        modalContainer.style.position = 'fixed';
        modalContainer.style.top = '0';
        modalContainer.style.left = '0';
        modalContainer.style.width = '100%';
        modalContainer.style.height = '100%';
        modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modalContainer.style.display = 'flex';
        modalContainer.style.justifyContent = 'center';
        modalContainer.style.alignItems = 'center';
        modalContainer.style.zIndex = '1000';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.backgroundColor = '#fff';
        modalContent.style.padding = '20px';
        modalContent.style.borderRadius = '8px';
        modalContent.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        modalContent.style.width = '500px';
        modalContent.style.maxWidth = '90%';
        
        const modalHeader = document.createElement('div');
        modalHeader.style.display = 'flex';
        modalHeader.style.justifyContent = 'space-between';
        modalHeader.style.alignItems = 'center';
        modalHeader.style.marginBottom = '15px';
        
        const modalTitle = document.createElement('h3');
        modalTitle.textContent = '导入聊天记录';
        modalTitle.style.margin = '0';
        
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '&times;';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.fontSize = '24px';
        closeButton.style.cursor = 'pointer';
        closeButton.onclick = () => document.body.removeChild(modalContainer);
        
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeButton);
        
        const options = document.createElement('div');
        options.style.display = 'flex';
        options.style.flexDirection = 'column';
        options.style.gap = '15px';
        
        // Option 1: Upload file
        const fileOption = document.createElement('button');
        fileOption.textContent = '从文件导入';
        fileOption.className = 'btn btn-primary';
        fileOption.style.width = '100%';
        fileOption.style.padding = '10px';
        fileOption.onclick = () => {
            importChatFileInput.click();
            document.body.removeChild(modalContainer);
        };
        
        // Option 2: Paste JSON
        const pasteOption = document.createElement('button');
        pasteOption.textContent = '粘贴 JSON';
        pasteOption.className = 'btn btn-secondary';
        pasteOption.style.width = '100%';
        pasteOption.style.padding = '10px';
        pasteOption.onclick = () => {
            modalContent.innerHTML = '';
            
            const backButton = document.createElement('button');
            backButton.innerHTML = '&larr; 返回';
            backButton.style.background = 'none';
            backButton.style.border = 'none';
            backButton.style.cursor = 'pointer';
            backButton.style.marginBottom = '15px';
            backButton.onclick = () => document.body.removeChild(modalContainer);
            
            const title = document.createElement('h3');
            title.textContent = '粘贴 JSON 内容';
            title.style.marginTop = '10px';
            
            const textarea = document.createElement('textarea');
            textarea.style.width = '100%';
            textarea.style.height = '200px';
            textarea.style.padding = '10px';
            textarea.style.marginBottom = '15px';
            textarea.style.resize = 'vertical';
            textarea.placeholder = '在此粘贴 JSON 格式的聊天记录...';
            
            const importButton = document.createElement('button');
            importButton.textContent = '导入';
            importButton.className = 'btn btn-primary';
            importButton.style.width = '100%';
            importButton.style.padding = '10px';
            importButton.onclick = () => {
                const content = textarea.value.trim();
                if (!content) {
                    alert('请粘贴 JSON 内容');
                    return;
                }
                
                processPastedJson(content);
                document.body.removeChild(modalContainer);
            };
            
            modalContent.appendChild(backButton);
            modalContent.appendChild(title);
            modalContent.appendChild(textarea);
            modalContent.appendChild(importButton);
        };
        
        // Option 3: Get example format
        const exampleOption = document.createElement('button');
        exampleOption.textContent = '查看示例格式';
        exampleOption.className = 'btn btn-outline';
        exampleOption.style.width = '100%';
        exampleOption.style.padding = '10px';
        exampleOption.style.backgroundColor = 'transparent';
        exampleOption.style.border = '1px solid #cbd5e0';
        exampleOption.style.color = '#4a5568';
        exampleOption.onclick = () => {
            generateExampleChatFile();
            document.body.removeChild(modalContainer);
        };
        
        options.appendChild(fileOption);
        options.appendChild(pasteOption);
        options.appendChild(exampleOption);
        
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(options);
        
        modalContainer.appendChild(modalContent);
        document.body.appendChild(modalContainer);
    }
    
    // Generate an example chat history file to show the correct format
    function generateExampleChatFile() {
        // 创建示例聊天记录
        const exampleData = {
            version: "1.0",
            timestamp: new Date().toISOString(),
            settings: {
                character: "冒险家，善良且勇敢",
                world: "奇幻世界，充满魔法和奇妙生物",
                style: "轻松幽默，但不失冒险感"
            },
            chat_history: [
                {
                    role: "ai",
                    content: "欢迎来到魔法森林！你是一位勇敢的冒险家，刚刚踏入这片神秘的土地。前方隐约可见一座古老的石塔，右边是茂密的森林，左边是一条小溪。你要往哪个方向探索呢？"
                },
                {
                    role: "user",
                    content: "我想先去小溪边看看"
                },
                {
                    role: "ai",
                    content: "你来到小溪边，清澈的水流中能看到闪闪发光的小鱼。溪水清凉，岸边长着一些看起来像是药草的植物。你注意到溪水中央有个奇怪的闪光物体。你要做什么？"
                },
                {
                    role: "user",
                    content: "我想看看闪光物体是什么"
                }
            ]
        };
        
        // 转换为JSON字符串并下载
        const jsonString = JSON.stringify(exampleData, null, 2);
        const blob = new Blob([jsonString], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        a.href = url;
        a.download = `Chat_Example_Format.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        alert("已下载示例聊天记录文件格式，您可以参考此格式创建或修改您的聊天记录文件。");
    }
    
    // Process pasted JSON
    async function processPastedJson(jsonContent) {
        updateStatus("正在处理导入的聊天记录...");
        
        try {
            // 先本地验证JSON格式
            try {
                const testParse = JSON.parse(jsonContent);
                console.log("本地JSON解析成功");
            } catch (e) {
                console.error("本地JSON解析失败:", e);
                throw new Error("无效的JSON格式: " + e.message);
            }
            
            // 发送到服务器进行进一步处理
            const response = await fetch('/api/chat/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file_content: jsonContent
                })
            });

            // 检查HTTP状态
            if (!response.ok) {
                const errorData = await response.json();
                console.error("服务器返回错误:", errorData);
                throw new Error(errorData.error || `导入时发生未知错误 (HTTP ${response.status})`);
            }

            const result = await response.json();

            // 应用导入的数据
            const importedData = result.chat_data;
            
            // 验证返回的数据
            if (!importedData || !importedData.chat_history || !importedData.settings) {
                console.error("服务器返回的数据格式无效:", importedData);
                throw new Error("服务器返回的数据格式无效");
            }
            
            // 设置游戏设置
            gameSettings = importedData.settings;
            
            // 更新设置UI
            characterSetting.value = gameSettings.character || '';
            worldSetting.value = gameSettings.world || '';
            styleSetting.value = gameSettings.style || '';

            // 清空当前聊天并加载导入的聊天记录
            chatHistory = [];
            chatMessages.innerHTML = '';

            // 添加每条消息到聊天
            if (Array.isArray(importedData.chat_history)) {
                importedData.chat_history.forEach(message => {
                    if (message && message.role && message.content) {
                        addMessageToChat(message.role, message.content, false);
                    } else {
                        console.warn("跳过无效的聊天消息:", message);
                    }
                });
                
                updateStatus("聊天记录已成功导入。");
                alert("聊天记录已成功导入。");
            } else {
                throw new Error("导入的聊天记录格式无效");
            }
        } catch (error) {
            console.error("导入聊天记录错误:", error);
            const errorText = `导入聊天记录失败: ${error.message}`;
            updateStatus(errorText, true);
            alert(errorText);
        }
    }

    // Add a message to the chat
    function addMessageToChat(role, content, saveToHistory = true) {
        // Add to chat history if needed
        if (saveToHistory) {
            chatHistory.push({
                role,
                content
            });
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message ${role}-message`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        const paragraph = document.createElement('p');
        paragraph.textContent = content;
        
        messageContent.appendChild(paragraph);
        messageElement.appendChild(messageContent);
        
        chatMessages.appendChild(messageElement);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Event listeners for text game
    textGameBtn.addEventListener('click', showGameChat);
    toggleSettingsBtn.addEventListener('click', toggleSettingsPanel);
    applySettingsBtn.addEventListener('click', applyGameSettings);
    sendMessageBtn.addEventListener('click', sendGameMessage);
    gameMessageInput.addEventListener('keypress', handleMessageInputKeyPress);
    
    // Process the imported chat file
    async function processImportedChatFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        updateStatus("正在导入聊天记录...");

        try {
            console.log("开始读取文件:", file.name, "大小:", file.size, "类型:", file.type);
            const fileContent = await readFileAsText(file);
            
            // 验证JSON格式
            try {
                const jsonData = JSON.parse(fileContent);
                console.log("成功解析JSON数据:", jsonData);
                
                // 尝试自动识别和适配不同的格式
                let adaptedData = {
                    settings: {},
                    chat_history: []
                };
                
                // 情况1: 标准格式 - 已有chat_history和settings字段
                if (jsonData.chat_history && (jsonData.settings || typeof jsonData.settings === 'object')) {
                    console.log("检测到标准格式");
                    adaptedData.chat_history = jsonData.chat_history;
                    adaptedData.settings = jsonData.settings;
                }
                // 情况2: 仅有聊天历史的数组
                else if (Array.isArray(jsonData)) {
                    console.log("检测到聊天历史数组格式");
                    adaptedData.chat_history = jsonData.map(item => {
                        // 尝试标准化每条消息的格式
                        if (typeof item === 'object') {
                            if (item.role && item.content) {
                                return item; // 已经是正确格式
                            } else if (item.sender && item.message) {
                                // 另一种常见格式转换
                                return {
                                    role: item.sender === 'user' ? 'user' : 'ai',
                                    content: item.message
                                };
                            }
                        }
                        // 默认处理
                        return {
                            role: 'user',
                            content: typeof item === 'string' ? item : JSON.stringify(item)
                        };
                    });
                }
                // 情况3: 聊天历史在messages或conversations字段
                else if (jsonData.messages && Array.isArray(jsonData.messages)) {
                    console.log("检测到messages字段格式");
                    adaptedData.chat_history = jsonData.messages.map(msg => {
                        if (msg.role && msg.content) return msg;
                        return {
                            role: msg.from === 'user' || msg.from === 'human' ? 'user' : 'ai',
                            content: msg.content || msg.text || msg.message || ''
                        };
                    });
                    if (jsonData.settings) adaptedData.settings = jsonData.settings;
                } 
                else if (jsonData.conversations && Array.isArray(jsonData.conversations)) {
                    console.log("检测到conversations字段格式");
                    adaptedData.chat_history = jsonData.conversations.map(msg => ({
                        role: msg.role || (msg.user ? 'user' : 'ai'),
                        content: msg.content || msg.text || msg.message || ''
                    }));
                    if (jsonData.settings) adaptedData.settings = jsonData.settings;
                }
                // 情况4: 其他格式，使用字段推断
                else {
                    console.log("尝试推断格式");
                    // 查找可能的聊天记录字段
                    const possibleChatFields = ['chat_history', 'chats', 'messages', 'conversations', 'dialog', 'history'];
                    let chatField = null;
                    
                    for (const field of possibleChatFields) {
                        if (jsonData[field] && Array.isArray(jsonData[field])) {
                            chatField = field;
                            break;
                        }
                    }
                    
                    if (chatField) {
                        console.log(`检测到聊天字段: ${chatField}`);
                        adaptedData.chat_history = jsonData[chatField].map(msg => {
                            // 尝试提取角色和内容
                            let role = 'ai';
                            let content = '';
                            
                            if (typeof msg === 'string') {
                                content = msg;
                            } else if (msg.role && msg.content) {
                                role = msg.role;
                                content = msg.content;
                            } else if (msg.sender || msg.from) {
                                role = (msg.sender || msg.from) === 'user' ? 'user' : 'ai';
                                content = msg.message || msg.text || msg.content || '';
                            } else {
                                // 尝试从键中推断
                                for (const key in msg) {
                                    if (['text', 'message', 'content'].includes(key)) {
                                        content = msg[key];
                                    } else if (['user', 'human', 'player'].includes(key)) {
                                        role = 'user';
                                    } else if (['ai', 'assistant', 'bot', 'system'].includes(key)) {
                                        role = 'ai';
                                    }
                                }
                            }
                            
                            return { role, content };
                        });
                    } else {
                        // 找不到聊天记录，但文件可能包含其他有用数据
                        console.log("未检测到标准聊天记录字段，尝试使用顶级字段");
                        
                        // 检查是否有游戏设置相关字段
                        if (jsonData.character || jsonData.world || jsonData.style) {
                            adaptedData.settings = {
                                character: jsonData.character || '',
                                world: jsonData.world || '',
                                style: jsonData.style || ''
                            };
                        }
                        
                        // 如果文件至少有settings，创建一个默认的欢迎消息
                        if (Object.keys(adaptedData.settings).length > 0) {
                            adaptedData.chat_history = [{
                                role: 'ai',
                                content: '欢迎回来！您的游戏设置已成功导入，可以开始新的对话了。'
                            }];
                        } else {
                            // 无法识别任何有用的数据结构
                            throw new Error("无法识别文件格式，请确保文件包含聊天记录数据");
                        }
                    }
                    
                    // 尝试提取设置信息
                    const possibleSettingsFields = ['settings', 'config', 'configuration', 'options', 'preferences'];
                    for (const field of possibleSettingsFields) {
                        if (jsonData[field] && typeof jsonData[field] === 'object') {
                            adaptedData.settings = jsonData[field];
                            break;
                        }
                    }
                    
                    // 如果没有找到设置信息，尝试从顶级字段提取
                    if (Object.keys(adaptedData.settings).length === 0) {
                        if (jsonData.character || jsonData.characterName || jsonData.role) {
                            adaptedData.settings.character = jsonData.character || jsonData.characterName || jsonData.role;
                        }
                        if (jsonData.world || jsonData.worldSetting || jsonData.setting) {
                            adaptedData.settings.world = jsonData.world || jsonData.worldSetting || jsonData.setting;
                        }
                        if (jsonData.style || jsonData.styleSetting || jsonData.tone) {
                            adaptedData.settings.style = jsonData.style || jsonData.styleSetting || jsonData.tone;
                        }
                    }
                }
                
                // 确保设置为对象
                if (!adaptedData.settings) adaptedData.settings = {};
                
                // 打印调试信息
                console.log("适配后的数据:", adaptedData);
                
                // 检查是否成功提取了聊天记录
                if (!adaptedData.chat_history || !Array.isArray(adaptedData.chat_history) || adaptedData.chat_history.length === 0) {
                    throw new Error("无法从文件中提取聊天记录数据");
                }
                
                // 将适配后的数据转换为JSON字符串并传递给处理函数
                const adaptedJson = JSON.stringify({
                    version: "1.0",
                    timestamp: new Date().toISOString(),
                    settings: adaptedData.settings,
                    chat_history: adaptedData.chat_history
                });
                
                console.log("开始导入适配后的数据");
                await processPastedJson(adaptedJson);
            } catch (jsonError) {
                console.error("JSON解析或适配错误:", jsonError);
                if (jsonError.message.includes("SyntaxError")) {
                    throw new Error("文件不是有效的JSON格式，请确保文件内容符合JSON规范");
                } else {
                    throw jsonError;
                }
            }
        } catch (error) {
            console.error("文件导入错误:", error);
            const errorText = `导入聊天记录失败: ${error.message}`;
            updateStatus(errorText, true);
            alert(errorText);
        } finally {
            // Reset the file input
            importChatFileInput.value = '';
        }
    }
    
    // Register event listeners for chat export/import
    exportChatBtn.addEventListener('click', exportChatHistory);
    importChatBtn.addEventListener('click', importChatHistory);
    importChatFileInput.addEventListener('change', processImportedChatFile);
    returnHomeBtn.addEventListener('click', returnToHome);

    // Generate game response using the API
    async function generateGameResponse(prompt) {
        isGenerating = true;
        
        try {
            const apiKey = getApiKey();
            if (!apiKey) {
                hideTypingIndicator();
                addMessageToChat('ai', '错误：请先设置API密钥');
                return;
            }

            const modelId = modelSelect.value;
            if (!modelId) {
                hideTypingIndicator();
                addMessageToChat('ai', '错误：请先选择一个模型');
                return;
            }

            // Prepare request data
            const data = {
                prompt,
                model: modelId,
                temperature: currentTemperature
            };

            // Initialize response text
            let responseText = '';

            // Make a POST request instead of using EventSource with query parameters
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status} ${response.statusText}`;
                try {
                    const errorText = await response.text(); 
                    const errorData = JSON.parse(errorText);
                    if (errorData.error) {
                        errorMsg = errorData.error; 
                    }
                } catch (e) { /* Ignore parsing errors */ }
                throw new Error(errorMsg);
            }

            // Process the stream
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            
            let messageElement = null;
            let messageContent = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    console.log("Stream finished.");
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop(); // Keep the last partial line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const jsonData = line.substring(6).trim();
                        if (jsonData === '[DONE]') continue;
                        
                        if (jsonData) {
                            try {
                                const data = JSON.parse(jsonData);
                                if (data.token) {
                                    // Add token to response text
                                    responseText += data.token;
                                    
                                    // Create or update message element
                                    if (!messageElement) {
                                        // Hide typing indicator if visible
                                        hideTypingIndicator();
                                        
                                        // Create new message element
                                        messageElement = document.createElement('div');
                                        messageElement.className = 'message ai-message';
                                        
                                        messageContent = document.createElement('div');
                                        messageContent.className = 'message-content';
                                        
                                        const paragraph = document.createElement('p');
                                        paragraph.textContent = responseText;
                                        
                                        messageContent.appendChild(paragraph);
                                        messageElement.appendChild(messageContent);
                                        chatMessages.appendChild(messageElement);
                                        
                                        // Scroll to bottom
                                        chatMessages.scrollTop = chatMessages.scrollHeight;
                                    } else {
                                        // Update existing message
                                        messageContent.querySelector('p').textContent = responseText;
                                        
                                        // Scroll to bottom
                                        chatMessages.scrollTop = chatMessages.scrollHeight;
                                    }
                                } else if (data.error) {
                                    console.error("Stream error:", data.error);
                                    hideTypingIndicator();
                                    addMessageToChat('ai', `错误: ${data.error}`);
                                    return;
                                }
                            } catch (e) {
                                console.error('Error parsing stream data:', jsonData, e);
                            }
                        }
                    }
                }
            }
            
            // Save to chat history
            chatHistory.push({
                role: 'ai',
                content: responseText
            });
            
            isGenerating = false;
            
        } catch (error) {
            console.error('Error generating game response:', error);
            hideTypingIndicator();
            addMessageToChat('ai', `生成回复时出错，请重试。${error.message}`);
            isGenerating = false;
        }
    }

    // Show typing indicator
    function showTypingIndicator() {
        typingIndicator.classList.remove('hidden');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Hide typing indicator
    function hideTypingIndicator() {
        typingIndicator.classList.add('hidden');
    }

    // Handle Enter key in message input
    function handleMessageInputKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendGameMessage();
        }
    }

    // Send a message from the user
    async function sendGameMessage() {
        const message = gameMessageInput.value.trim();
        if (!message || isGenerating) return;

        // Add user message to chat
        addMessageToChat('user', message);
        
        // Clear input
        gameMessageInput.value = '';

        // Show typing indicator
        showTypingIndicator();

        // Construct prompt including chat history and settings
        let prompt = "";
        
        // Add settings as context
        if (gameSettings.character || gameSettings.world || gameSettings.style) {
            prompt += "游戏设定：\n";
            if (gameSettings.character) prompt += `角色设定：${gameSettings.character}\n`;
            if (gameSettings.world) prompt += `世界设定：${gameSettings.world}\n`;
            if (gameSettings.style) prompt += `风格设定：${gameSettings.style}\n\n`;
        }
        
        // Add chat history
        prompt += "对话历史：\n";
        chatHistory.forEach((chat, index) => {
            if (index < chatHistory.length - 1) { // Skip the last message which we'll add separately
                prompt += `${chat.role === 'user' ? '玩家' : 'AI'}: ${chat.content}\n`;
            }
        });
        
        // Add the current message
        prompt += `玩家: ${message}\n\n`;
        
        // Add instructions
        prompt += "请以文字游戏的形式，扮演一个NPC或游戏主持人角色，根据以上对话历史和设定，生成一个流畅且有代入感的回复。回复应该具有沉浸感，符合游戏设定，并推动故事情节发展。";

        // Generate AI response
        await generateGameResponse(prompt);
    }

    // --- Custom API Button Logic ---
    const CUSTOM_APIS_LS_KEY = 'customApis'; // New key for custom APIs
    const customApiBtn = document.getElementById('custom-api-btn');
    const customApiModal = document.getElementById('custom-api-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const savedApiList = document.getElementById('saved-api-list');
    const addApiConfigBtn = document.getElementById('add-api-config-btn');
    const apiForm = document.getElementById('api-form');
    const cancelApiBtn = document.getElementById('cancel-api-btn');
    const saveApiBtn = document.getElementById('save-api-btn');

    // Form input elements
    const apiNameInput = document.getElementById('api-name');
    const apiBaseUrlInput = document.getElementById('api-base-url');
    const apiPathInput = document.getElementById('api-path');
    const apiSecretInput = document.getElementById('api-secret');
    const apiModelNameInput = document.getElementById('api-model-name');

    // Currently editing API ID (null when creating new)
    let currentEditingApiId = null;

    // Initialize custom API storage from localStorage for offline fallback
    const storedCustomApis = JSON.parse(localStorage.getItem(CUSTOM_APIS_LS_KEY)) || [];

    // Open the Custom API Modal
    if (customApiBtn) {
        customApiBtn.addEventListener('click', () => {
            openCustomApiModal();
        });
    }

    // Close the modal when clicking the X or outside the modal
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeCustomApiModal);
    }

    window.addEventListener('click', (event) => {
        if (event.target === customApiModal) {
            closeCustomApiModal();
        }
    });

    // Show API form when clicking Add Configuration button
    if (addApiConfigBtn) {
        addApiConfigBtn.addEventListener('click', () => {
            showApiForm();
        });
    }

    // Cancel API form
    if (cancelApiBtn) {
        cancelApiBtn.addEventListener('click', () => {
            hideApiForm();
        });
    }

    // Save API configuration
    if (saveApiBtn) {
        saveApiBtn.addEventListener('click', saveApiConfig);
    }

    // Open the Custom API Modal and load saved APIs
    async function openCustomApiModal() {
        // Load APIs from server
        await loadCustomApis();
        
        // Show modal
        customApiModal.style.display = 'block';
        
        // Hide form initially
        hideApiForm();
    }

    // Close the Custom API Modal
    function closeCustomApiModal() {
        customApiModal.style.display = 'none';
        clearApiForm();
        currentEditingApiId = null;
    }

    // Show API configuration form
    function showApiForm() {
        apiForm.classList.remove('hidden');
    }

    // Hide API configuration form
    function hideApiForm() {
        apiForm.classList.add('hidden');
        clearApiForm();
        currentEditingApiId = null;
    }

    // Clear API form inputs
    function clearApiForm() {
        apiNameInput.value = '';
        apiBaseUrlInput.value = '';
        apiPathInput.value = '';
        apiSecretInput.value = '';
        apiModelNameInput.value = '';
    }

    // Load saved custom APIs from the server
    async function loadCustomApis() {
        updateStatus('正在加载自定义API...');
        try {
            const response = await fetch('/api/custom-apis');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const apis = await response.json();
            
            // Populate the list
            renderApiList(apis);
            
            // Save to localStorage for offline fallback
            localStorage.setItem(CUSTOM_APIS_LS_KEY, JSON.stringify(apis));
            
            updateStatus('自定义API加载完成。');
        } catch (error) {
            console.error('Error loading custom APIs:', error);
            // Use localStorage backup if server request fails
            if (storedCustomApis.length > 0) {
                renderApiList(storedCustomApis);
                updateStatus('从本地存储加载了自定义API。');
            } else {
                updateStatus('加载自定义API出错。', true);
                savedApiList.innerHTML = '<li>加载API列表出错。</li>';
            }
        }
    }

    // Render the API list
    function renderApiList(apis) {
        savedApiList.innerHTML = '';
        
        if (apis.length === 0) {
            const li = document.createElement('li');
            li.classList.add('empty-message');
            li.textContent = '尚未配置自定义API';
            savedApiList.appendChild(li);
            return;
        }
        
        apis.forEach(api => {
            const li = document.createElement('li');
            li.dataset.apiId = api.id;
            li.classList.add('api-item');
            
            const apiInfoDiv = document.createElement('div');
            apiInfoDiv.classList.add('api-info-display');
            
            const nameSpan = document.createElement('span');
            nameSpan.classList.add('api-name');
            nameSpan.textContent = api.name;
            
            const urlSpan = document.createElement('span');
            urlSpan.classList.add('api-url');
            urlSpan.textContent = `${api.baseUrl}/${api.path || ''} - ${api.modelName}`;
            
            apiInfoDiv.appendChild(nameSpan);
            apiInfoDiv.appendChild(urlSpan);
            
            const actionsDiv = document.createElement('div');
            actionsDiv.classList.add('api-actions');
            
            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-api-btn');
            editBtn.innerHTML = '<i class="fas fa-edit"></i> 编辑';
            editBtn.addEventListener('click', () => {
                editApiConfig(api);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.classList.add('delete-api-btn');
            deleteBtn.innerHTML = '<i class="fas fa-trash-alt"></i> 删除';
            deleteBtn.addEventListener('click', () => {
                if (confirm(`确定要删除自定义API "${api.name}" 吗？`)) {
                    deleteApiConfig(api.id);
                }
            });
            
            const selectBtn = document.createElement('button');
            selectBtn.classList.add('select-api-btn');
            selectBtn.innerHTML = '<i class="fas fa-check"></i> 使用';
            selectBtn.addEventListener('click', () => {
                selectApiConfig(api);
                closeCustomApiModal();
            });
            
            actionsDiv.appendChild(editBtn);
            actionsDiv.appendChild(deleteBtn);
            actionsDiv.appendChild(selectBtn);
            
            li.appendChild(apiInfoDiv);
            li.appendChild(actionsDiv);
            
            savedApiList.appendChild(li);
        });
    }

    // Edit an API configuration
    function editApiConfig(api) {
        currentEditingApiId = api.id;
        
        // Fill the form with existing data
        apiNameInput.value = api.name;
        apiBaseUrlInput.value = api.baseUrl;
        apiPathInput.value = api.path || '';
        apiSecretInput.value = api.secret || '';
        apiModelNameInput.value = api.modelName;
        
        // Show the form
        showApiForm();
    }

    // Save API configuration
    async function saveApiConfig() {
        const name = apiNameInput.value.trim();
        const baseUrl = apiBaseUrlInput.value.trim();
        const modelName = apiModelNameInput.value.trim();
        
        // Basic validation
        if (!name) {
            alert('请输入API名称');
            return;
        }
        if (!baseUrl) {
            alert('请输入API基础URL');
            return;
        }
        if (!modelName) {
            alert('请输入模型名称');
            return;
        }
        
        // Prepare data object
        const apiData = {
            name: name,
            baseUrl: baseUrl,
            path: apiPathInput.value.trim(),
            secret: apiSecretInput.value.trim(),
            modelName: modelName
        };
        
        try {
            let response;
            
            if (currentEditingApiId) {
                // Update existing API
                response = await fetch(`/api/custom-apis/${currentEditingApiId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(apiData)
                });
                
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                updateStatus(`已更新API配置: ${name}`);
            } else {
                // Create new API
                response = await fetch('/api/custom-apis', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(apiData)
                });
                
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const newApi = await response.json();
                updateStatus(`已添加API配置: ${name}`);
            }
            
            // Reload the APIs list
            await loadCustomApis();
            
            // Reload models to include the new API
            await fetchModels();
            
            // Hide the form
            hideApiForm();
        } catch (error) {
            console.error('Error saving API configuration:', error);
            updateStatus('保存API配置时出错。', true);
            alert(`保存API配置时出错: ${error.message}`);
        }
    }

    // Delete an API configuration
    async function deleteApiConfig(apiId) {
        try {
            const response = await fetch(`/api/custom-apis/${apiId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            updateStatus(result.message);
            
            // Reload the APIs list
            await loadCustomApis();
            
            // Reload models to update the list
            await fetchModels();
        } catch (error) {
            console.error('Error deleting API configuration:', error);
            updateStatus('删除API配置时出错。', true);
            alert(`删除API配置时出错: ${error.message}`);
        }
    }

    // Select and use an API configuration
    function selectApiConfig(api) {
        const modelId = `custom-${api.id}`;
        const modelName = `${api.name} - ${api.modelName}`;
        
        // Check if model exists in select options
        let modelExists = false;
        for (let i = 0; i < modelSelect.options.length; i++) {
            if (modelSelect.options[i].value === modelId) {
                modelExists = true;
                break;
            }
        }
        
        // If model doesn't exist in select, add it (shouldn't happen normally)
        if (!modelExists) {
            const option = document.createElement('option');
            option.value = modelId;
            option.textContent = modelName;
            modelSelect.appendChild(option);
        }
        
        // Select the model
        modelSelect.value = modelId;
        
        // Update API address display
        document.getElementById('api-address').textContent = api.baseUrl;
        
        updateStatus(`已选择自定义API: ${api.name}`);
    }
    // --- End Custom API Button Logic ---

    // Listen for changes in the characters textarea to update tags
    charactersInput.addEventListener('input', parseCharactersFromText);

    function showCharacterLibrary() {
        hideAllContentAreas();
        characterLibraryArea.classList.remove('hidden');
        
        // Make sure we're in view mode, not edit mode
        characterViewPanel.classList.remove('hidden');
        characterEditPanel.classList.add('hidden');
        
        updateStatus('已打开角色库。');
    }

    // Central function to hide all content areas
    function hideAllContentAreas() {
        welcomeScreen.classList.add('hidden');
        writingArea.classList.add('hidden');
        toolboxArea.classList.add('hidden');
        characterLibraryArea.classList.add('hidden');
        glossaryArea.classList.add('hidden');
        styleArea.classList.add('hidden');
        gameChatArea.classList.add('hidden');
        promptGeneratorArea.classList.add('hidden');
        promptEditorArea.classList.add('hidden'); // Hide prompt editor too
        if (typeof characterGraphView !== 'undefined' && characterGraphView) {
            characterGraphView.classList.add('hidden');
        }
    }

    function showWritingArea() {
        if (!currentNovelId) {
            alert("请先加载或创建一部小说。");
            return;
        }
        hideAllContentAreas();
        writingArea.classList.remove('hidden');
        updateStatus('已返回写作区域。');
    }

    // Function to setup the sidebar toggle
    function setupSidebarToggle() {
        // Find the sidebar and main content elements
        const sidebar = document.querySelector('.sidebar');
        const contentArea = document.querySelector('.content-area');
        
        if (!sidebar || !contentArea) {
            console.warn('Sidebar or content area elements not found');
            return;
        }
        
        // Create toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-sidebar-btn';
        toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
        toggleBtn.title = '收起侧边栏';
        toggleBtn.setAttribute('aria-label', '收起侧边栏');
        
        // Add the button to the sidebar
        sidebar.appendChild(toggleBtn);
        
        // Add data-section attributes to section headings
        const sectionMap = {
            '小说作品': 'novels',
            '角色库': 'characters',
            '词条库': 'glossary',
            '风格库': 'styles',
            '工具箱': 'tools',
            '互动体验': 'interactive'
        };
        
        // Find all section headings and add data attributes
        const sectionHeadings = sidebar.querySelectorAll('.sidebar-section h2');
        sectionHeadings.forEach(heading => {
            const sectionText = heading.textContent.trim();
            if (sectionMap[sectionText]) {
                heading.setAttribute('data-section', sectionMap[sectionText]);
            }
        });
        
        // Initialize the collapsed state from localStorage
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed) {
            sidebar.classList.add('collapsed');
            toggleBtn.title = '展开侧边栏';
            toggleBtn.setAttribute('aria-label', '展开侧边栏');
        }
        
        // Add click event listener
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            const isCollapsed = sidebar.classList.contains('collapsed');
            
            // Update button title
            toggleBtn.title = isCollapsed ? '展开侧边栏' : '收起侧边栏';
            toggleBtn.setAttribute('aria-label', isCollapsed ? '展开侧边栏' : '收起侧边栏');
            
            // Save state to localStorage
            localStorage.setItem('sidebarCollapsed', isCollapsed);
            
            // Trigger resize event for any components that need to adjust
            window.dispatchEvent(new Event('resize'));
        });
    }

    // --- AIGC降重功能 ---
    async function rewriteNovelContent() {
        if (!currentNovelId) {
            alert("请先加载或创建一部小说。");
            return;
        }

        const selectedModel = modelSelect.value;
        if (!selectedModel) {
            alert("请先选择一个 AI 模型。");
            return;
        }

        // Get selected text or all content
        let originalText = "";
        let selectedText = window.getSelection().toString();
        let insertPosition = 0;
        let isPartialRewrite = false;

        if (selectedText) {
            // User has selected text, so rewrite only that portion
            originalText = selectedText;
            isPartialRewrite = true;
            // Find selected text position
            insertPosition = novelContent.selectionStart;
        } else {
            // No selection, rewrite entire content
            originalText = novelContent.value;
            if (!originalText.trim()) {
                alert("小说内容为空，无法进行降重。");
                return;
            }
        }

        // Open a modal dialog for options
        const modalHTML = `
            <div id="rewrite-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000;">
                <div style="background: white; padding: 20px; border-radius: 8px; width: 500px; max-width: 90%;">
                    <h3 style="margin-top: 0;">AIGC降重设置</h3>
                    <p>请选择降重强度（原文重复度）:</p>
                    <div style="display: flex; justify-content: space-between; margin: 20px 0;">
                        <label>
                            <input type="radio" name="similarity" value="high" checked> 高相似度
                            <span style="display: block; font-size: 12px; color: #666;">保留原意，轻微改写（较快）</span>
                        </label>
                        <label>
                            <input type="radio" name="similarity" value="medium"> 中等相似度
                            <span style="display: block; font-size: 12px; color: #666;">保留核心内容，适度改写</span>
                        </label>
                        <label>
                            <input type="radio" name="similarity" value="low"> 低相似度
                            <span style="display: block; font-size: 12px; color: #666;">大幅改写（较慢）</span>
                        </label>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <button id="cancel-rewrite" style="padding: 8px 16px; background: #e2e8f0; border: none; border-radius: 4px; cursor: pointer;">取消</button>
                        <button id="start-rewrite" style="padding: 8px 16px; background: #3182ce; color: white; border: none; border-radius: 4px; cursor: pointer;">开始降重</button>
                    </div>
                </div>
            </div>
        `;

        // Insert modal into document
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        // Add event listeners
        document.getElementById('cancel-rewrite').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });

        document.getElementById('start-rewrite').addEventListener('click', async () => {
            const similarityLevel = document.querySelector('input[name="similarity"]:checked').value;
            document.body.removeChild(modalContainer);
            
            // Construct prompt based on similarity level
            let rewritePrompt = "";
            switch(similarityLevel) {
                case "high":
                    rewritePrompt = `# AI指令：文章高相似度改写（保留核心信息，轻微调整AI率与重复率）

## 角色设定

请你扮演一位拥有丰富经验的文本优化编辑和人类语言风格模拟专家。你的核心任务是接收用户提供的原始文章，并根据所选的相似度要求对其进行改写，使其在保留核心信息和主旨的前提下，调整AI写作痕迹和重复率，以适应不同的应用场景。目标重复率：70-80%。

## 核心指令目标

1.  **轻微调整\"AI化\"特征**：主要消除最明显的AI刻板表达，使文本更自然。
2.  **轻度降低重复率**：通过词汇替换和简单句式调整，在保持原文结构和风格基础上降低重复。
3.  **保持文章质量与流畅性**：确保改写后的文章可读性强，逻辑清晰，基本维持原有风格。
4.  **信息保真**：在整个改写过程中，必须确保原文的核心观点、关键论据、重要数据、专业术语和直接引用的关键部分不被歪曲、删减或错误解读。

## 改写核心原则与详细要求

### 1. 理解与保留核心信息

*   **精准理解原文**：在动手改写前，请务必完整阅读并深刻理解原文的主题思想、核心论点、论证逻辑、关键信息点（数据、案例、引言等）以及目标读者。
*   **核心信息完整保留**：改写时，必须确保原文的核心思想、事实性信息（如具体数据、时间、地点、人物、专有名词、直接引用的关键内容）得到准确无误的保留，不得随意增删或歪曲。

### 2. \"去AI化\"轻微改写策略

*   **优化AI常见表达习惯**：
    *   **替换刻板过渡词**：识别并替换一些AI常用的、较为生硬的过渡词（如\"首先\"、\"其次\"、\"此外\"），使用更自然的连接词或短语。
    *   **调整部分冗余句式**：对AI生成中显得过于冗长或结构单一的句子进行适度简化或合并，增强流畅性。
*   **丰富词汇表达**：
    *   **替换部分泛化词**：将少量AI常用的中性、概括性词汇替换为稍具体或更生动的同义词、近义词。
    *   **避免过度书面化**：适当调整过于正式或书面化的表达，使其更贴近自然阅读习惯。
*   **保持逻辑与结构稳定**：
    *   **维持原有逻辑**：主要保留原文的段落结构和论证逻辑，不做大的调整。
    *   **确保连接顺畅**：检查并确保句间、段间的逻辑连接清晰自然。
*   **微调人类写作风格**：
    *   **减少纯粹客观**：在不改变事实的前提下，可以适度调整语气，避免完全的AI式中立。
    *   **运用常见修辞**：可点缀少量常见的修辞手法（如比喻、排比），增强可读性，但避免过度。

### 3. 轻度降重策略

*   **同义/近义词替换**：主要进行词汇层面的替换，选择在当前语境下合适的同义或近义词。
*   **简单句式调整**：
    *   对部分句子进行语序的微调（如状语位置）。
    *   将部分主动句改为被动句，或反之，以改变表达方式。
*   **短语结构替换**：将某些固定短语替换为意思相近但结构不同的表达。
*   **保持关键词稳定**：核心关键词可以保留，或用最直接的同义词替换，避免影响主题清晰度。
*   **引用方式微调**：直接引用可考虑在引述方式上做些微小改变，如调整引导词。

### 4. 核心内容提取与重组（可选，根据相似度决定）
*   如果选择中等或低相似度，可能需要对原文进行更深入的分析，提取核心观点和信息，然后用全新的结构和表达方式重写。

### 5. 输出要求
*   请直接输出改写后的文本内容。
*   确保文本流畅、自然，符合人类写作习惯。

待改写内容：
${originalText}
`;
                    break;
                case "medium":
                    rewritePrompt = `# AI指令：文章中等相似度改写（保留核心内容，显著降低AI率与重复率）

## 角色设定
请你扮演一位资深文本优化编辑和人类语言风格模拟专家。任务是接收原始文章，进行深度改写，在保留核心信息和主旨的前提下，显著降低AI写作痕迹和重复率。目标重复率：40-60%。

## 核心指令目标
1.  **显著降低\"AI化\"特征**：消除刻板句式、过渡词，丰富词汇，增加情感。
2.  **有效降低重复率**：通过句式变换、同义替换、语序调整等方式降低与原文的相似度。
3.  **提升文章质量**：使文章更具可读性、逻辑性、生动性。
4.  **核心信息保真**：确保原文核心观点、关键信息不被歪曲或丢失。

## 改写核心原则与详细要求
### 1. 理解与保留核心信息
*   **精准理解原文**：透彻理解原文主题、论点、逻辑、关键信息。
*   **核心信息完整保留**：确保核心思想、事实数据准确无误。

### 2. \"去AI化\"深度改写策略
*   **打破AI固定句式**：避免刻板过渡，句式多样化（长短句结合、多种句型）。
*   **丰富与活化词汇**：替换AI高频泛化词，选用具体、生动词语，增加感官描写。
*   **优化逻辑连接**：采用更隐性、多样化的逻辑过渡。
*   **注入人类写作风格**：融入情感色彩、明确观点，运用修辞，模拟对话感。

### 3. 中度降重策略
*   **同义/近义词精准替换**：考虑语境、色彩、搭配。
*   **句式结构重塑**：长短句互换、主被动互换等。
*   **语序灵活调整**：保证语法正确和原意不变。
*   **信息概括与扩展**：对非核心内容精简，对核心观点适当阐释。
*   **关键词适度替换与分散**。

### 4. 输出要求
*   直接输出改写后的文本。
*   确保文本风格自然，通过主流AIGC检测。

待改写内容：
${originalText}
`;
                    break;
                case "low":
                    rewritePrompt = `# AI指令：文章低相似度改写（大幅改写，创作全新表达，AI率<20%）

## 角色设定
请你扮演一位顶级的创意重写专家和人类语言大师。你的任务是对用户提供的原始文章进行彻底的、颠覆性的重写，目标是创造一篇在主题和核心信息上与原文一致，但在表达方式、句子结构、词汇选择乃至整体风格上焕然一新、几乎无重复的全新作品。目标重复率：<30%，AI检测率极低。

## 核心指令目标
1.  **极限\"去AI化\"**：彻底消除任何AI写作痕迹，使文章读起来如同人类顶尖写手原创。
2.  **最大限度降低重复率**：采用所有可能的重写技巧，使改写后的文章与原文的文本相似度降至最低。
3.  **保持甚至升华核心信息**：在全新表达中，精准传达原文的核心观点和重要信息，甚至可以通过更优的组织和表达提升其影响力。
4.  **创造高度原创性**：改写后的文章应具有高度的原创性和独特的风格。

## 改写核心原则与详细要求
### 1. 吃透原文，提取灵魂
*   **深层理解与解构**：不仅理解字面意思，更要洞察原文的深层逻辑、意图、潜在含义和情感基调。
*   **剥离核心要素**：准确识别并提取出原文不可或缺的核心观点、关键论据、主要信息点。

### 2. \"凤凰涅槃\"式重构策略 (彻底摆脱AI痕迹)
*   **颠覆性结构重组**：完全打乱原文的段落和句子顺序，根据对核心要素的理解，重新设计文章的谋篇布局和叙事逻辑。可以考虑不同的切入点、论证路径或呈现方式。
*   **表达方式彻底创新**：
    *   **避免任何原文词句的直接套用或简单替换**。
    *   **运用全新的词汇体系**：选择与原文词汇差异大但意义相通的词语，追求表达的精准、生动与高级感。
    *   **句式彻底再造**：综合运用各种复杂句、简单句、特殊句式（如倒装、省略、插入等），创造出与原文完全不同的句子结构和节奏。
    *   **修辞手法的创新运用**：大胆运用比喻、拟人、象征、通感、反讽等高级修辞，赋予文章全新的文学色彩和表达深度。
*   **注入强烈的个人风格与情感**：
    *   **赋予独特视角和声音**：用明确的、富有个性的作者口吻进行叙述和评论。
    *   **情感深度共鸣**：将充沛而真实的情感融入字里行间，使文章具有强烈的感染力。
*   **逻辑再造与升华**：
    *   在保留核心逻辑的基础上，可以尝试优化论证链条，补充更具说服力的论据，或从更高维度、更深层次阐释核心观点。

### 3. 极限降重技巧
*   **释义转述的极致**：将原文信息完全用自己的话语和理解重新表达。
*   **概念替换与引申**：在不改变核心意义的前提下，用相关的、但更高阶或更具体的概念来替换原文的表述。
*   **视角转换**：尝试从不同的叙述视角（如第一人称、第三人称，甚至特定角色的视角）来重写内容。
*   **正反、主被动、语态的极限变换**。
*   **实例替换与重构**：如果原文有案例，考虑用意义相同但细节完全不同的新案例，或者对原案例进行彻底的重新解读和描述。

### 4. 输出要求
*   直接输出重写后的全新文章。
*   新文章必须在核心信息上忠实于原文，但在文本表达上与原文的重复率极低。
*   新文章必须具有极高的人类原创性和可读性，能够轻松通过最严格的AIGC检测。

待改写内容：
${originalText}
`;
                    break;
                default:
                    alert("未知的相似度级别");
                    return;
            }
            
            // Add the original text to the prompt if not already included by the switch cases
            // (Ensuring originalText is part of the payload for the API)
            if (!rewritePrompt.includes("${originalText}")) { // Basic check
                 // This check might be too simplistic if ${originalText} is a placeholder used differently
                 // Assuming prompts are structured to use it as a placeholder to be replaced.
                 // For now, this specific structure from AI降重改写代码.txt uses it within the template literal.
                 // So if the above switch cases correctly fill rewritePrompt with template literals
                 // that include ${originalText}, this explicit append might not be needed.
                 // However, if a case *doesn't* include it, this is a fallback.
                 // Better: ensure all prompt templates include ${originalText} properly.
            }


            updateStatus(`正在使用 ${selectedModel} 进行降重改写...`);

            try {
                // Disable novel editing while processing
                novelContent.disabled = true;
                
                // Create a temporary overlay to show processing status
                const overlay = document.createElement('div');
                overlay.id = 'rewrite-overlay';
                overlay.style.position = 'absolute';
                overlay.style.top = '0';
                overlay.style.left = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                overlay.style.display = 'flex';
                overlay.style.justifyContent = 'center';
                overlay.style.alignItems = 'center';
                overlay.style.zIndex = '100';
                overlay.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 24px; margin-bottom: 10px;"><i class="fas fa-sync fa-spin"></i></div>
                        <div>正在降重中，请稍候...</div>
                        <div style="font-size: 12px; margin-top: 10px;">根据文本长度和模型速度，可能需要一些时间</div>
                    </div>
                `;
                
                // Find the novel content wrapper to append the overlay
                const contentWrapper = document.querySelector('.novel-content-wrapper');
                if (contentWrapper) {
                    contentWrapper.style.position = 'relative'; // Needed for absolute positioning of overlay
                    contentWrapper.appendChild(overlay);
                }

                const response = await fetch('/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        model: selectedModel,
                        // prompt: rewritePrompt, // This was the original line
                        prompt: rewritePrompt.replace('${originalText}', originalText), // Ensure originalText is correctly injected
                        temperature: 0.7
                        // stream: true // Assuming your API supports stream and it's handled below
                    })
                });

                if (!response.ok) {
                    let errorMsg = `HTTP error! status: ${response.status} ${response.statusText}`;
                    try {
                        const errorText = await response.text(); 
                        const errorData = JSON.parse(errorText);
                        if (errorData.error) {
                            errorMsg = errorData.error; 
                        }
                    } catch (e) { /* Ignore parsing errors */ }
                    throw new Error(errorMsg);
                }

                // Process the response
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let rewrittenText = '';

                // Process the stream
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        console.log("Rewrite stream finished");
                        break;
                    }

                    // Decode and process the chunk
                    const chunk = decoder.decode(value, { stream: true });
                    const lines = chunk.split('\n');

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const jsonData = line.substring(6).trim();
                            if (jsonData === '[DONE]') {
                                // console.log("Stream end marker received");
                                continue;
                            }
                            if (jsonData) {
                                try {
                                    const data = JSON.parse(jsonData);
                                    if (data.token) {
                                        rewrittenText += data.token;
                                        // Update text area progressively if desired, or wait until end
                                        // novelContent.value = rewrittenText; // For progressive update
                                    } else if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                                        // Handle another common streaming format
                                        rewrittenText += data.choices[0].delta.content;
                                    } else if (data.error) {
                                        console.error("Stream error:", data.error);
                                        throw new Error(data.error);
                                    }
                                    // else {
                                    // console.log("Received non-token data:", data);
                                    // }
                                } catch (e) {
                                     if (!line.includes('OPENROUTER PROCESSING')) { // Suppress OpenRouter specific messages if not errors
                                        console.error('Error parsing stream data:', e, 'Original data:', jsonData);
                                     }
                                }
                            }
                        }
                    }
                }
                
                // Final update to the novel content area
                if (isPartialRewrite) {
                    // Replace only the selected portion
                    novelContent.value = 
                        novelContent.value.substring(0, insertPosition) + 
                        rewrittenText + 
                        novelContent.value.substring(insertPosition + originalText.length);
                } else {
                    // Replace the entire content
                    novelContent.value = rewrittenText;
                }
                
                // Update word count
                updateWordCount();
                updateStatus('降重完成');
                
                // Ask if user wants to save
                if (confirm('降重已完成，是否立即保存小说？')) {
                    saveNovelContent();
                }

            } catch (error) {
                console.error('Error during rewrite:', error);
                updateStatus(`降重失败: ${error.message}`, true);
                alert(`降重过程中出错: ${error.message}`);
            } finally {
                // Re-enable novel editing
                novelContent.disabled = false;
                
                // Remove overlay if it exists
                const overlay = document.getElementById('rewrite-overlay');
                if (overlay) {
                    overlay.parentNode.removeChild(overlay);
                }
                
                // Make sure the content wrapper position is restored
                const contentWrapper = document.querySelector('.novel-content-wrapper');
                if (contentWrapper) {
                    contentWrapper.style.position = ''; // Reset position
                }
            }
        });
    }

    async function saveGeneratedCharacterToLibrary(characterData) {
        if (!characterData || !characterData.name) {
            alert('无法保存角色：缺少角色数据或名称。');
            return;
        }
        
        const name = characterData.name;
        const description = characterData.description;
        
        updateStatus(`正在将生成的角色 "${name}" 保存到库中...`);
        
        try {
            const response = await fetch('/api/characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    description: description
                })
            });
            
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) { /* Ignore if response is not JSON */ }
                throw new Error(errorMsg);
            }
            
            const newCharacter = await response.json();
            
            // Refresh character lists in the sidebar and library view
            await fetchCharacters();
            
            updateStatus(`生成的角色 '${name}' 已成功保存到角色库。`);
            
            // Optionally, ask if the user wants to add it to the current novel
            if (currentNovelId && confirm(`是否要将新保存的角色 "${name}" 添加到当前小说？`)) {
                // Need to set currentCharacterId before calling addCharacterToNovel
                currentCharacterId = newCharacter.id; 
                // Manually update characterDetail for addCharacterToNovel to work
                characterDetail.innerHTML = `<div class=\"character-name\">${newCharacter.name}</div><div class=\"character-description\">${newCharacter.description || '没有描述'}</div>`;
                addCharacterToNovel();
            }
            
        } catch (error) {
            console.error('Error saving generated character:', error);
            updateStatus(`保存生成的角色出错: ${error.message}`, true);
            alert(`保存生成的角色时出错: ${error.message}`);
        }
    }

    // --- NEW FUNCTION to save generated character directly ---
    async function saveGeneratedCharacterToLibrary(characterData) {
        if (!characterData || !characterData.name) {
            alert('无法保存角色：缺少角色数据或名称。');
            return;
        }
        
        const name = characterData.name;
        const description = characterData.description;
        
        updateStatus(`正在将生成的角色 "${name}" 保存到库中...`);
        
        try {
            const response = await fetch('/api/characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    description: description
                })
            });
            
            if (!response.ok) {
                let errorMsg = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.error || errorMsg;
                } catch (e) { /* Ignore if response is not JSON */ }
                throw new Error(errorMsg);
            }
            
            const newCharacter = await response.json();
            
            // Refresh character lists in the sidebar and library view
            await fetchCharacters();
            
            updateStatus(`生成的角色 '${name}' 已成功保存到角色库。`);
            
            // Optionally, ask if the user wants to add it to the current novel
            if (currentNovelId && confirm(`是否要将新保存的角色 "${name}" 添加到当前小说？`)) {
                // Need to set currentCharacterId before calling addCharacterToNovel
                currentCharacterId = newCharacter.id; 
                // Manually update characterDetail for addCharacterToNovel to work
                characterDetail.innerHTML = `<div class=\"character-name\">${newCharacter.name}</div><div class=\"character-description\">${newCharacter.description || '没有描述'}</div>`;
                addCharacterToNovel();
            }
            
        } catch (error) {
            console.error('Error saving generated character:', error);
            updateStatus(`保存生成的角色出错: ${error.message}`, true);
            alert(`保存生成的角色时出错: ${error.message}`);
        }
    }
    // --- END NEW FUNCTION ---

    // --- Prompt Generator Elements ---
    const smartPromptBtn = document.getElementById('smart-prompt-btn');
    const promptGeneratorArea = document.getElementById('prompt-generator-area');
    const generatePromptBtn = document.getElementById('generate-prompt-btn');
    const clearPromptFormBtn = document.getElementById('clear-prompt-form-btn');
    const generatedPromptOutput = document.getElementById('generated-prompt-output');
    const generatedPromptText = document.getElementById('generated-prompt-text');
    const copyGeneratedPromptBtn = document.getElementById('copy-generated-prompt-btn');
    const sendToEditorBtn = document.getElementById('send-to-editor-btn');
    const importCharactersBtn = document.getElementById('import-characters-btn');
    const importGlossaryForPromptBtn = document.getElementById('import-glossary-to-prompt-btn'); // Changed variable name and ID
    const importStyleBtn = document.getElementById('import-style-btn');

    // --- Prompt Editor Elements ---
    const promptEditorArea = document.getElementById('prompt-editor-area');
    const promptEditorText = document.getElementById('prompt-editor-text');
    const saveEditedPromptBtn = document.getElementById('save-edited-prompt-btn');
    const addEditedPromptToNovelBtn = document.getElementById('add-edited-prompt-to-novel-btn');
    const exitPromptEditorBtn = document.getElementById('exit-prompt-editor-btn');
    const promptEditorBtn = document.getElementById('prompt-editor-btn'); // Add prompt editor button variable
    const importTemplateBtn = document.getElementById('import-template-btn'); // New button
    const templateFileInput = document.getElementById('template-file-input'); // New hidden file input
    const exportTemplateBtn = document.getElementById('export-template-btn'); // New export button

    // Prompt Input Fields (for Generator)
    const promptInputs = {
        storyType: document.getElementById('prompt-story-type'),
        plot: document.getElementById('prompt-plot'),
        characters: document.getElementById('prompt-characters'),
        setting: document.getElementById('prompt-setting'),
        style: document.getElementById('prompt-style'),
        keywords: document.getElementById('prompt-keywords'),
        audience: document.getElementById('prompt-audience'),
        outputReq: document.getElementById('prompt-output-req'),
        negative: document.getElementById('prompt-negative'),
        additional: document.getElementById('prompt-additional')
    };

    // --- Prompt Generator Event Listener ---
    if (smartPromptBtn) {
        smartPromptBtn.addEventListener('click', showPromptGenerator);
    }
    // Add event listener for prompt editor button
    if (promptEditorBtn) {
        promptEditorBtn.addEventListener('click', () => showPromptEditor(''));
    }
    if (generatePromptBtn) {
        generatePromptBtn.addEventListener('click', generateSmartPrompt);
    }
    if (clearPromptFormBtn) {
        clearPromptFormBtn.addEventListener('click', clearPromptGeneratorForm);
    }
    if (copyGeneratedPromptBtn) {
        copyGeneratedPromptBtn.addEventListener('click', copyGeneratedPrompt);
    }
    if (sendToEditorBtn) {
        sendToEditorBtn.addEventListener('click', () => {
            if (!generatedPromptText.value) {
                alert('没有可发送到编辑器的提示词。');
                return;
            }
            showPromptEditor(generatedPromptText.value);
        });
    }

    // --- Prompt Generator Functions ---
    function showPromptGenerator() {
        hideAllContentAreas();
        promptGeneratorArea.classList.remove('hidden');
        updateStatus('已打开自定义提示词。');
    }

    function clearPromptGeneratorForm() {
        for (const key in promptInputs) {
            if (promptInputs[key]) {
                promptInputs[key].value = '';
            }
        }
        generatedPromptOutput.classList.add('hidden');
        generatedPromptText.value = '';
        updateStatus('提示词表单已清空。');
    }

    function generateSmartPrompt() {
        updateStatus('正在生成提示词...');

        const inputs = {};
        for (const key in promptInputs) {
            if (promptInputs[key]) {
                inputs[key] = promptInputs[key].value.trim();
            }
        }

        // Basic check if any input is provided
        const hasInput = Object.values(inputs).some(value => value !== '');
        if (!hasInput) {
            alert('请至少在一个字段中输入内容以生成提示词。');
            updateStatus('生成提示词失败：缺少输入。', true);
            return;
        }

        // Build the prompt using the template from the spec
        let prompt = "请你扮演一位经验丰富的小说家";
        if (inputs.style) {
             prompt += `，擅长以 ${inputs.style} 的风格进行创作`;
        }
        prompt += "，创作一篇";
        if (inputs.storyType) {
             prompt += `关于【${inputs.storyType}】题材`;
        }
        prompt += "的小说内容。\n\n";

        if (inputs.setting) {
            prompt += `故事背景设定在：\n${inputs.setting}\n\n`;
        }

        if (inputs.characters) {
            prompt += `主要角色包括：\n${inputs.characters}\n\n`;
        }

        if (inputs.plot) {
            prompt += `核心情节围绕：\n${inputs.plot}\n\n`;
        }

        if (inputs.style) {
            prompt += `请主要使用【${inputs.style}】的文风/叙事风格进行描写。\n`;
        }

        if (inputs.keywords) {
            prompt += `请在内容中突出【${inputs.keywords}】等关键词或核心主题。\n`;
        }

        if (inputs.outputReq) {
            prompt += `具体输出要求：\n${inputs.outputReq}\n`;
        }

        if (inputs.audience) {
            prompt += `请确保语言风格符合【${inputs.audience}】的目标读者阅读习惯。\n`;
        }
        
        prompt += "\n"; // Add a separator line

        if (inputs.negative) {
            prompt += `请注意避免以下内容或风格：\n${inputs.negative}\n\n`;
        }

        if (inputs.additional) {
            prompt += `其他特殊要求或细节补充：\n${inputs.additional}\n\n`;
        }

        // Display the generated prompt
        const newPrompt = prompt.trim();
        if (generatedPromptText.value.trim() !== '') {
            generatedPromptText.value += '\n\n' + newPrompt; // Append with newlines
        } else {
            generatedPromptText.value = newPrompt; // Set if empty
        }
        generatedPromptOutput.classList.remove('hidden');
        updateStatus('提示词已生成并追加（如果已有内容）。');
        generatedPromptOutput.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll to the output area
    }

    function copyGeneratedPrompt() {
        if (!generatedPromptText.value) {
            alert('没有可复制的提示词。');
            return;
        }
        navigator.clipboard.writeText(generatedPromptText.value).then(() => {
            updateStatus('提示词已复制到剪贴板。');
        }, (err) => {
            console.error('复制提示词失败:', err);
            updateStatus('复制提示词失败。', true);
            alert('复制失败，请手动复制。');
        });
    }
    // --- End Prompt Generator Functions ---

    // --- Prompt Editor Functions ---
    function showPromptEditor(promptText) {
        hideAllContentAreas();
        promptEditorText.value = promptText;
        promptEditorArea.classList.remove('hidden');
        updateStatus('已打开提示词编辑器。');
    }

    if (saveEditedPromptBtn) {
        saveEditedPromptBtn.addEventListener('click', () => {
            const editedPrompt = promptEditorText.value;
            // Update the prompt in the (hidden) generator's output textarea
            generatedPromptText.value = editedPrompt; 
            updateStatus('提示词已在编辑器中保存(未推送到主编辑器)。');
            alert('提示词已更新。您可以返回生成器或添加到小说。');
        });
    }

    if (addEditedPromptToNovelBtn) {
        addEditedPromptToNovelBtn.addEventListener('click', () => {
            const editedPrompt = promptEditorText.value;
            if (!editedPrompt) {
                alert('提示词为空，无法添加到小说。');
                return;
            }
            promptInput.value = editedPrompt; // Set to main writing area's prompt input
            showWritingArea();
            promptInput.focus();
            updateStatus('编辑后的提示词已添加到小说写作区域。');
        });
    }

    if (exitPromptEditorBtn) {
        exitPromptEditorBtn.addEventListener('click', () => {
            // Optionally, ask for confirmation if there are unsaved changes
            // For now, just go back to the prompt generator
            showPromptGenerator();
        });
    }

    if (importTemplateBtn) {
        importTemplateBtn.addEventListener('click', () => {
            templateFileInput.click(); // Trigger hidden file input
        });
    }

    if (templateFileInput) {
        templateFileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    promptEditorText.value = e.target.result;
                    updateStatus('模板已导入到提示词编辑器。');
                };
                reader.onerror = (e) => {
                    console.error("File reading error:", e);
                    alert("读取文件失败。");
                    updateStatus('模板导入失败。', true);
                };
                reader.readAsText(file);
            }
            // Reset file input to allow selecting the same file again if needed
            event.target.value = null;
        });
    }

    if (exportTemplateBtn) {
        exportTemplateBtn.addEventListener('click', async () => {
            const content = promptEditorText.value;
            if (!content.trim()) {
                alert("提示词编辑器内容为空，无法导出。");
                return;
            }

            let filename = prompt("请输入模板文件名 (例如: my_template.md):", "prompt_template.md");
            if (!filename) {
                return; // User cancelled
            }
            // Filename sanitization and .md extension will be handled by the server

            try {
                const response = await fetch('/api/prompt-editor/export-template', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        filename: filename,
                        content: content 
                    }),
                });

                const result = await response.json();

                if (response.ok) {
                    alert(result.message || '模板已成功导出。');
                    updateStatus(result.message || '模板已导出。');
                } else {
                    throw new Error(result.error || '导出模板失败。');
                }
            } catch (error) {
                console.error("Error exporting template:", error);
                alert(`导出模板时出错: ${error.message}`);
                updateStatus(`导出模板失败: ${error.message}`, true);
            }
        });
    }

    // --- End Prompt Editor Functions ---

    // --- Import Glossary Entry Logic ---
    const importGlossaryBtn = document.getElementById('import-glossary-btn');
    const glossaryImportFileInput = document.getElementById('glossary-import-file-input');

    if (importGlossaryBtn && glossaryImportFileInput) {
        importGlossaryBtn.addEventListener('click', () => {
            glossaryImportFileInput.click(); // Trigger the hidden file input
        });

        glossaryImportFileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (!file) {
                return; // No file selected
            }

            if (!file.name.toLowerCase().endsWith('.md')) {
                alert('请选择一个 Markdown (.md) 文件。');
                glossaryImportFileInput.value = ''; // Reset file input
                return;
            }

            const reader = new FileReader();
            reader.onload = async (e) => {
                const content = e.target.result;
                const term = file.name.replace(/\.md$/i, ''); // Remove .md extension for term
                
                const entryData = {
                    term: term,
                    description: content,
                    category: '' // Default to no category, or prompt user later
                };

                updateStatus(`正在导入词条: ${term}...`);
                try {
                    const response = await fetch('/api/glossary', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(entryData)
                    });

                    if (!response.ok) {
                        let errorDetail = `HTTP error! status: ${response.status}`;
                        try {
                            const errorData = await response.json();
                            errorDetail = errorData.message || errorData.error || errorDetail;
                        } catch (jsonError) {
                            // If response is not JSON, use the text response
                            errorDetail = await response.text() || errorDetail;
                        }
                        throw new Error(errorDetail);
                    }
                    
                    const result = await response.json();
                    updateStatus(`词条 '${term}' 已成功导入 (ID: ${result.id})。`);
                    await fetchGlossaryEntries(); // Refresh glossary list
                    
                    // Optionally, navigate to the glossary area and select the new entry
                    showGlossaryLibrary();
                    if (result.id) {
                        if (typeof loadGlossaryEntry === 'function') {
                           loadGlossaryEntry(result.id);
                        } else {
                           console.warn('loadGlossaryEntry function not found, cannot select imported entry.');
                        }
                    }

                } catch (error) {
                    console.error('Error importing glossary entry:', error);
                    updateStatus(`导入词条 '${term}' 失败: ${error.message}`, true);
                    alert(`导入词条失败: ${error.message}`);
                } finally {
                    glossaryImportFileInput.value = ''; // Reset file input to allow re-selection of the same file
                }
            };

            reader.onerror = () => {
                updateStatus(`读取文件 '${file.name}' 失败。`, true);
                alert(`读取文件失败: ${reader.error}`);
                glossaryImportFileInput.value = ''; // Reset file input
            };

            reader.readAsText(file);
        });
    }
    // --- End Import Glossary Entry Logic ---

    // Style Library Event Listeners
    openStyleLibraryBtn.addEventListener('click', showStyleLibrary);

    // Fix for rewriteNovelContent function (ensures only one implementation runs)
    document.addEventListener('DOMContentLoaded', function() {
        const rewriteNovelBtn = document.getElementById('rewrite-novel-btn');
        if (rewriteNovelBtn) {
            // Remove any existing event listeners
            const newRewriteBtn = rewriteNovelBtn.cloneNode(true);
            rewriteNovelBtn.parentNode.replaceChild(newRewriteBtn, rewriteNovelBtn);
            
            // Add event listener to the new button that uses the last implementation of rewriteNovelContent
            newRewriteBtn.addEventListener('click', function() {
                // This will use the most recently defined rewriteNovelContent function
                if (typeof rewriteNovelContent === 'function') {
                    console.log("AIGC降重 button clicked, calling rewriteNovelContent function");
                    rewriteNovelContent();
                } else {
                    console.error("rewriteNovelContent function not found");
                    alert("无法执行降重功能，请刷新页面重试。");
                }
            });
        }
    });

    // Create "Open Character Library" button for novel generation page, next to "Save to Glossary"
    const openCharacterLibraryNovelBtn = document.createElement('button');
    openCharacterLibraryNovelBtn.id = 'open-character-library-novel-btn';
    openCharacterLibraryNovelBtn.textContent = '角色库';
    openCharacterLibraryNovelBtn.title = '打开角色库';
    openCharacterLibraryNovelBtn.classList.add('btn', 'btn-outline-info'); // Apply Bootstrap-like styling
    openCharacterLibraryNovelBtn.style.marginLeft = '8px'; // Add some spacing

    openCharacterLibraryNovelBtn.addEventListener('click', showCharacterLibrary);

    // Add glossary library button to the writing area
    const openGlossaryLibraryNovelBtn = document.createElement('button');
    openGlossaryLibraryNovelBtn.id = 'open-glossary-library-novel-btn';
    openGlossaryLibraryNovelBtn.textContent = '词条库';
    openGlossaryLibraryNovelBtn.title = '打开词条库';
    openGlossaryLibraryNovelBtn.classList.add('btn', 'btn-outline-info'); // Apply Bootstrap-like styling
    openGlossaryLibraryNovelBtn.style.marginLeft = '8px'; // Add some spacing

    openGlossaryLibraryNovelBtn.addEventListener('click', showGlossaryLibrary);

    // Add style library button to the writing area
    const openStyleLibraryNovelBtn = document.createElement('button');
    openStyleLibraryNovelBtn.id = 'open-style-library-novel-btn';
    openStyleLibraryNovelBtn.textContent = '风格库';
    openStyleLibraryNovelBtn.title = '打开风格库';
    openStyleLibraryNovelBtn.classList.add('btn', 'btn-outline-info'); // Apply Bootstrap-like styling
    openStyleLibraryNovelBtn.style.marginLeft = '8px'; // Add some spacing

    openStyleLibraryNovelBtn.addEventListener('click', showStyleLibrary);

    // Insert the buttons after saveToGlossaryBtn
    if (saveToGlossaryBtn && saveToGlossaryBtn.parentNode) {
        // Insert Character Library button after saveToGlossaryBtn
        saveToGlossaryBtn.parentNode.insertBefore(openCharacterLibraryNovelBtn, saveToGlossaryBtn.nextSibling);
        
        // Insert Glossary Library button after Character Library button
        saveToGlossaryBtn.parentNode.insertBefore(openGlossaryLibraryNovelBtn, openCharacterLibraryNovelBtn.nextSibling);
        
        // Insert Style Library button after Glossary Library button
        saveToGlossaryBtn.parentNode.insertBefore(openStyleLibraryNovelBtn, openGlossaryLibraryNovelBtn.nextSibling);
    } else {
        console.error('Could not find saveToGlossaryBtn or its parent to insert the new buttons.');
    }

    // Initialize word count
    updateWordCount();
    
    // Attach input event to the novel content textarea to track changes
    if (novelContent) {
        novelContent.addEventListener('input', () => {
            // Update word count
            updateWordCount();
            
            // Track content changes
            const currentContent = novelContent.value;
            const lastSavedContent = novelContent.dataset.lastSaved || '';
            novelContent.dataset.hasChanges = (currentContent !== lastSavedContent).toString();
        });
    }

    /**
     * Update active state in the novel list
     * @param {string} novelId - ID of the active novel
     */
    function updateNovelListActiveState(novelId) {
        const novelListItems = document.querySelectorAll('#novel-list li');
        novelListItems.forEach(li => {
            if (li.dataset.novelId === novelId) {
                li.classList.add('active');
            } else {
                li.classList.remove('active');
            }
        });
    }

    const addDetailedOutlineToNovelBtn = document.getElementById('add-detailed-outline-to-novel-btn');
    if (addDetailedOutlineToNovelBtn) {
        addDetailedOutlineToNovelBtn.addEventListener('click', function() {
            // 只在细纲生成器下生效
            if (toolboxGenerateBtn.dataset.toolType !== 'detailed-outline') return;
            // 获取细纲内容
            const outlineText = toolboxOutputText.textContent.trim();
            if (!outlineText) {
                alert('请先生成细纲内容');
                return;
            }
            // 切换到小说生成页
            showWritingArea();
            // 粘贴到小说内容输入框
            novelContent.value = outlineText;
            if (typeof updateWordCount === 'function') updateWordCount();
            updateStatus('已将细纲内容添加到小说内容区。');
        });
    }

    if (sendToEditorBtn) {
        sendToEditorBtn.addEventListener('click', () => {
            if (!generatedPromptText.value) {
                alert('没有可发送到编辑器的提示词。');
                return;
            }
            showPromptEditor(generatedPromptText.value);
        });
    }

    // Add event listeners for new send buttons
    const sendToSynopsisBtn = document.getElementById('send-to-synopsis-btn');
    if (sendToSynopsisBtn) {
        sendToSynopsisBtn.addEventListener('click', () => {
            if (!generatedPromptText.value) {
                alert('没有可发送的提示词。');
                return;
            }
            showToolbox('synopsis');
            toolboxPrompt.value = generatedPromptText.value;
            updateStatus('提示词已发送到简介生成器。');
        });
    }

    const sendToTitleBtn = document.getElementById('send-to-title-btn');
    if (sendToTitleBtn) {
        sendToTitleBtn.addEventListener('click', () => {
            if (!generatedPromptText.value) {
                alert('没有可发送的提示词。');
                return;
            }
            showToolbox('title');
            toolboxPrompt.value = generatedPromptText.value;
            updateStatus('提示词已发送到书名生成器。');
        });
    }

    const sendToOutlineBtn = document.getElementById('send-to-outline-btn');
    if (sendToOutlineBtn) {
        sendToOutlineBtn.addEventListener('click', () => {
            if (!generatedPromptText.value) {
                alert('没有可发送的提示词。');
                return;
            }
            showToolbox('outline');
            toolboxPrompt.value = generatedPromptText.value;
            updateStatus('提示词已发送到大纲生成器。');
        });
    }

    const sendToCharacterBtn = document.getElementById('send-to-character-btn');
    if (sendToCharacterBtn) {
        sendToCharacterBtn.addEventListener('click', () => {
            if (!generatedPromptText.value) {
                alert('没有可发送的提示词。');
                return;
            }
            showToolbox('character');
            toolboxPrompt.value = generatedPromptText.value;
            updateStatus('提示词已发送到人物卡生成器。');
        });
    }

    // 角色关系图谱按钮逻辑
    const characterGraphBtn = document.getElementById('character-graph-btn');
    const characterGraphView = document.getElementById('character-graph-view');
    if (characterGraphBtn && characterGraphView) {
        characterGraphBtn.addEventListener('click', function() {
            hideAllContentAreas();
            characterGraphView.classList.remove('hidden');
        });
    }
});

// ... existing code ...
// 角色关系图谱功能集成
(function(){
    const characterGraphBtn = document.getElementById('character-graph-btn');
    const characterGraphView = document.getElementById('character-graph-view');
    const uploadGraphFileBtn = document.getElementById('upload-graph-file-btn');
    const graphFileInput = document.getElementById('graph-file-input');
    const selectedFileName = document.getElementById('selected-file-name');
    const generateGraphBtn = document.getElementById('generate-graph-btn');
    const saveGraphBtn = document.getElementById('save-graph-btn');
    const graphVisualization = document.getElementById('graph-visualization');
    // 自动补充：模型下拉框变量
    const graphModelSelect = document.getElementById('graph-model-select');
    let currentFileContent = '';
    let lastGraphData = null;

    if (!characterGraphBtn || !characterGraphView) return;

    // 自动补充：加载模型列表
    function loadGraphModels() {
        if (!graphModelSelect) return;
        fetch('/api/models').then(r => r.json()).then(list => {
            if (Array.isArray(list)) {
                graphModelSelect.innerHTML = '';
                list.forEach(m => {
                    const opt = document.createElement('option');
                    opt.value = m.id;
                    opt.textContent = m.name;
                    graphModelSelect.appendChild(opt);
                });
            } else {
                graphModelSelect.innerHTML = '<option value="">-- 未找到模型 --</option>';
            }
        }).catch(() => {
            graphModelSelect.innerHTML = '<option value="">-- 加载模型出错 --</option>';
        });
    }
    if (graphModelSelect) loadGraphModels();

    // 上传文件按钮
    if (uploadGraphFileBtn && graphFileInput) {
        uploadGraphFileBtn.addEventListener('click', () => {
            graphFileInput.value = '';
            graphFileInput.click();
        });
        graphFileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            selectedFileName.textContent = file.name;
            const reader = new FileReader();
            reader.onload = async function(evt) {
                currentFileContent = evt.target.result;
                // 启用生成图谱按钮
                generateGraphBtn.disabled = false;
            };
            reader.readAsText(file);
        });
    }

    // 生成图谱按钮
    if (generateGraphBtn) {
        generateGraphBtn.addEventListener('click', async () => {
            if (!currentFileContent) {
                alert('请先上传文件');
                return;
            }
            // 获取选择的模型
            let model = graphModelSelect ? graphModelSelect.value : '';
            if (graphModelSelect && !model && graphModelSelect.options.length > 0) {
                model = graphModelSelect.options[0].value;
                graphModelSelect.value = model;
            }
            generateGraphBtn.disabled = true;
            generateGraphBtn.textContent = '生成中...';
            try {
                const resp = await fetch('/api/character-relationship-graph', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: currentFileContent, model: model })
                });
                const data = await resp.json();
                if (!resp.ok || !data.nodes || !data.links) {
                    throw new Error(data.error || '生成失败');
                }
                lastGraphData = data;
                // 渲染图谱
                renderCharacterGraph(data.nodes, data.links, false); // 不自动保存
                saveGraphBtn.disabled = false; // 启用保存按钮
            } catch (e) {
                alert('生成图谱失败：' + e.message);
            } finally {
                generateGraphBtn.disabled = false;
                generateGraphBtn.textContent = '生成图谱';
            }
        });
    }

    // 保存图谱按钮
    if (saveGraphBtn) {
        saveGraphBtn.addEventListener('click', () => {
            const svg = graphVisualization.querySelector('svg');
            if (!svg) {
                alert('请先生成图谱');
                return;
            }
            // 内嵌样式，保证导出字体和线条样式
            let style = document.createElement('style');
            style.textContent = `
                text { font-family: "Arial", "Microsoft YaHei", sans-serif; fill: #222; }
                circle { stroke: #fff; stroke-width: 2; }
                line { stroke: #aaa; }
            `;
            svg.insertBefore(style, svg.firstChild);
            // 确保SVG尺寸
            const width = svg.getAttribute('width') || 800;
            const height = svg.getAttribute('height') || 600;
            svg.setAttribute('width', width);
            svg.setAttribute('height', height);
            // 序列化SVG
            const serializer = new XMLSerializer();
            const svgStr = serializer.serializeToString(svg);
            const canvas = document.createElement('canvas');
            canvas.width = Number(width);
            canvas.height = Number(height);
            const ctx = canvas.getContext('2d');
            const img = new window.Image();
            const svg64 = btoa(unescape(encodeURIComponent(svgStr)));
            const image64 = 'data:image/svg+xml;base64,' + svg64;
            img.onload = function() {
                ctx.fillStyle = '#fff';
                ctx.fillRect(0,0,canvas.width,canvas.height);
                ctx.drawImage(img, 0, 0);
                const pngFile = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.download = 'character-relationship-graph.png';
                downloadLink.href = pngFile;
                downloadLink.click();
            };
            img.src = image64;
        });
    }

    // 渲染图谱函数
    function renderCharacterGraph(nodes, links, autoSave) {
        // 清除之前的图谱
        d3.select(graphVisualization).selectAll('*').remove();
        
        const width = graphVisualization.offsetWidth || 800;
        const height = graphVisualization.offsetHeight || 600;

        // 创建SVG容器
        const svg = d3.select(graphVisualization)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // 添加缩放功能
        const zoom = d3.zoom()
            .scaleExtent([0.1, 4])
            .on('zoom', (event) => {
                g.attr('transform', event.transform);
            });

        svg.call(zoom);

        // 创建主容器组
        const g = svg.append('g');

        // 添加背景网格
        const gridSize = 50;
        const grid = g.append('g')
            .attr('class', 'grid');
        
        for (let i = 0; i < width; i += gridSize) {
            grid.append('line')
                .attr('x1', i)
                .attr('y1', 0)
                .attr('x2', i)
                .attr('y2', height)
                .attr('stroke', '#f0f0f0')
                .attr('stroke-width', 1);
        }
        for (let i = 0; i < height; i += gridSize) {
            grid.append('line')
                .attr('x1', 0)
                .attr('y1', i)
                .attr('x2', width)
                .attr('y2', i)
                .attr('stroke', '#f0f0f0')
                .attr('stroke-width', 1);
        }

        // 创建力导向图模拟
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-500))
            .force('center', d3.forceCenter(width/2, height/2))
            .force('collision', d3.forceCollide().radius(50));

        // 创建渐变定义
        const defs = svg.append('defs');
        nodes.forEach((node, i) => {
            const gradient = defs.append('linearGradient')
                .attr('id', `gradient-${node.id}`)
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '100%')
                .attr('y2', '100%');

            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', d3.schemeCategory10[i % 10]);

            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', d3.color(d3.schemeCategory10[i % 10]).darker(0.5));
        });

        // 创建连线
        const link = g.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(links)
            .enter().append('line')
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6)
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');

        // 创建节点
        const node = g.append('g')
            .attr('class', 'nodes')
            .selectAll('g')
            .data(nodes)
            .enter().append('g')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        // 添加节点圆圈
        node.append('circle')
            .attr('r', 30)
            .attr('fill', d => `url(#gradient-${d.id})`)
            .attr('stroke', '#fff')
            .attr('stroke-width', 2)
            .attr('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))');

        // 添加节点文本
        node.append('text')
            .attr('dy', 4)
            .attr('text-anchor', 'middle')
            .attr('font-size', 14)
            .attr('font-weight', 'bold')
            .attr('fill', '#fff')
            .attr('pointer-events', 'none')
            .text(d => d.name || d.id);

        // 添加关系标签
        const linkLabel = g.append('g')
            .attr('class', 'link-labels')
            .selectAll('text')
            .data(links)
            .enter().append('text')
            .attr('font-size', 12)
            .attr('fill', '#666')
            .attr('text-anchor', 'middle')
            .attr('pointer-events', 'none')
            .text(d => d.relation || '');

        // 添加关系标签背景
        linkLabel.each(function(d) {
            const text = d3.select(this);
            const bbox = text.node().getBBox();
            const padding = 4;
            
            text.insert('rect', ':first-child')
                .attr('x', bbox.x - padding)
                .attr('y', bbox.y - padding)
                .attr('width', bbox.width + padding * 2)
                .attr('height', bbox.height + padding * 2)
                .attr('fill', '#fff')
                .attr('rx', 4)
                .attr('ry', 4)
                .attr('opacity', 0.8);
        });

        // 更新力导向图
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node.attr('transform', d => `translate(${d.x},${d.y})`);

            linkLabel
                .attr('x', d => (d.source.x + d.target.x) / 2)
                .attr('y', d => (d.source.y + d.target.y) / 2 - 10);
        });

        // 拖拽函数
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // 添加节点悬停效果
        node.on('mouseover', function(event, d) {
            d3.select(this).select('circle')
                .transition()
                .duration(200)
                .attr('r', 35)
                .attr('stroke-width', 3);

            // 高亮相关连线和节点
            link
                .style('stroke', l => (l.source === d || l.target === d) ? '#666' : '#999')
                .style('stroke-width', l => (l.source === d || l.target === d) ? 3 : 2)
                .style('stroke-opacity', l => (l.source === d || l.target === d) ? 1 : 0.3);

            node.select('circle')
                .style('opacity', n => {
                    const isConnected = links.some(l => 
                        (l.source === d && l.target === n) || 
                        (l.source === n && l.target === d)
                    );
                    return isConnected ? 1 : 0.3;
                });
        })
        .on('mouseout', function(event, d) {
            d3.select(this).select('circle')
                .transition()
                .duration(200)
                .attr('r', 30)
                .attr('stroke-width', 2);

            // 恢复所有连线和节点的样式
            link
                .style('stroke', '#999')
                .style('stroke-width', 2)
                .style('stroke-opacity', 0.6);

            node.select('circle')
                .style('opacity', 1);
        });

        // 双击节点重置视图
        node.on('dblclick', function(event, d) {
            event.stopPropagation();
            svg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        });

        // 双击空白处重置视图
        svg.on('dblclick', function(event) {
            if (event.target === this) {
                svg.transition()
                    .duration(750)
                    .call(zoom.transform, d3.zoomIdentity);
            }
        });
    }
})();
// ... existing code ...