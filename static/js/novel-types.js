// 小说类型选择功能
document.addEventListener('DOMContentLoaded', function() {
    // DOM 元素
    const novelMainTypes = document.getElementById('novel-main-types');
    const novelSubTypes = document.getElementById('novel-subtypes');
    const subtypesContainer = document.getElementById('novel-subtypes-container');
    const selectedSummary = document.getElementById('selected-types-summary');
    const novelTypesSection = document.getElementById('novel-types-section');
    const toolboxGenerateBtn = document.getElementById('toolbox-generate-btn');

    // 选中的类型
    let selectedTypes = new Set();
    let selectedSubtypes = new Set();
    
    // 小说类型数据 - 硬编码备份，如果API加载失败使用
    let novelTypeData = {
        "玄幻": ["东方玄幻", "王朝争霸", "异世大陆", "异术超能", "远古神话", "高武世界", "转世重生", "西方玄幻", "变身情缘"],
        "武侠": ["传统武侠", "新派武侠", "国术武侠", "历史武侠", "浪子异侠", "谐趣武侠", "快意江湖"],
        "仙侠": ["现代修真", "修真文明", "洪荒封神", "古典仙侠", "奇幻修真"],
        "奇幻": ["西方奇幻", "吸血家族", "魔法校园", "异类兽族", "亡灵异族", "领主贵族", "剑与魔法", "历史神话"],
        "科幻": ["机器时代", "科幻世界", "骇客时空", "数字生命", "星际战争", "古武机甲", "时空穿梭", "末世危机", "进化变异"],
        "都市": ["都市生活", "恩怨情仇", "青春校园", "异术超能", "都市重生", "合租情缘", "娱乐明星", "谍战特工", "爱情婚姻", "乡土小说", "国术武技", "总裁虐恋", "官场沉浮", "商场职场"],
        "言情": ["冒险推理", "纯爱唯美", "品味人生", "爱在职场", "菁菁校园", "浪漫言情", "千千心结", "古代言情", "宫廷争斗", "女尊王朝"],
        "历史": ["架空历史", "历史传记", "穿越古代", "外国历史"],
        "军事": ["战争幻想", "特种军旅", "现代战争", "穿越战争", "谍战特工", "抗战烽火", "军旅生涯"],
        "灵异": ["推理侦探", "恐怖惊悚", "灵异神怪", "悬疑探险", "风水秘术"],
        "同人": ["小说同人", "动漫同人", "影视同人", "武侠同人", "游戏同人"],
        "耽美": ["BL 小说", "同性之爱", "同志文学"],
        "二次元": ["原生幻想", "青春日常", "变身入替", "搞笑吐槽", "衍生同人"]
    };
    
    // 从API获取小说类型数据
    async function fetchNovelTypes() {
        try {
            const response = await fetch('/api/novel-types');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (Object.keys(data).length > 0) {
                novelTypeData = data;
                console.log("成功从API加载小说类型数据");
            }
        } catch (error) {
            console.warn("无法从API加载小说类型数据，使用备用数据:", error);
        }
        
        // 无论API是否成功，都初始化UI
        initNovelTypes();
    }
    
    // 初始化类型选项
    function initNovelTypes() {
        // 清空现有内容
        novelMainTypes.innerHTML = '';
        
        // 添加主类型
        Object.keys(novelTypeData).forEach(type => {
            const typeElement = document.createElement('div');
            typeElement.className = 'novel-type-option';
            typeElement.dataset.type = type;
            typeElement.textContent = type;
            typeElement.addEventListener('click', () => toggleMainType(type, typeElement));
            novelMainTypes.appendChild(typeElement);
        });
    }
    
    // 切换主类型选中状态
    function toggleMainType(type, element) {
        const isSelected = element.classList.toggle('selected');
        
        // 更新选中状态
        if (isSelected) {
            selectedTypes.add(type);
            displaySubtypes(type);
        } else {
            selectedTypes.delete(type);
            // 清除此主类型下的子类型选择
            novelTypeData[type].forEach(subtype => {
                selectedSubtypes.delete(subtype);
            });
            
            // 如果没有选中任何主类型，隐藏子类型区域
            if (selectedTypes.size === 0) {
                subtypesContainer.classList.remove('visible');
            } else {
                // 显示其他选中的主类型的子类型
                displaySubtypesForSelected();
            }
        }
        
        updateSelectedSummary();
    }
    
    // 显示指定主类型的子类型
    function displaySubtypes(mainType) {
        // 清空现有子类型
        novelSubTypes.innerHTML = '';
        
        // 添加子类型标题
        const subtypeTitle = document.createElement('div');
        subtypeTitle.className = 'novel-subtype-title';
        subtypeTitle.textContent = `${mainType}子类型:`;
        novelSubTypes.appendChild(subtypeTitle);
        
        // 添加子类型选项
        const subtypes = novelTypeData[mainType] || [];
        subtypes.forEach(subtype => {
            const subtypeElement = document.createElement('div');
            subtypeElement.className = 'novel-subtype-option';
            if (selectedSubtypes.has(subtype)) {
                subtypeElement.classList.add('selected');
            }
            subtypeElement.dataset.type = mainType;
            subtypeElement.dataset.subtype = subtype;
            subtypeElement.textContent = subtype;
            subtypeElement.addEventListener('click', () => toggleSubtype(subtype, subtypeElement));
            novelSubTypes.appendChild(subtypeElement);
        });
        
        // 显示子类型容器
        subtypesContainer.classList.add('visible');
    }
    
    // 显示所有选中主类型的子类型
    function displaySubtypesForSelected() {
        // 清空现有子类型
        novelSubTypes.innerHTML = '';
        
        // 为每个选中的主类型添加子类型
        selectedTypes.forEach(mainType => {
            // 添加子类型标题
            const subtypeTitle = document.createElement('div');
            subtypeTitle.className = 'novel-subtype-title';
            subtypeTitle.textContent = `${mainType}子类型:`;
            novelSubTypes.appendChild(subtypeTitle);
            
            // 添加子类型选项
            const subtypes = novelTypeData[mainType] || [];
            subtypes.forEach(subtype => {
                const subtypeElement = document.createElement('div');
                subtypeElement.className = 'novel-subtype-option';
                if (selectedSubtypes.has(subtype)) {
                    subtypeElement.classList.add('selected');
                }
                subtypeElement.dataset.type = mainType;
                subtypeElement.dataset.subtype = subtype;
                subtypeElement.textContent = subtype;
                subtypeElement.addEventListener('click', () => toggleSubtype(subtype, subtypeElement));
                novelSubTypes.appendChild(subtypeElement);
            });
            
            // 添加分隔线，除非是最后一个
            if ([...selectedTypes].indexOf(mainType) < selectedTypes.size - 1) {
                const divider = document.createElement('hr');
                divider.className = 'subtype-divider';
                novelSubTypes.appendChild(divider);
            }
        });
        
        // 显示子类型容器
        subtypesContainer.classList.add('visible');
    }
    
    // 切换子类型选中状态
    function toggleSubtype(subtype, element) {
        const isSelected = element.classList.toggle('selected');
        
        // 更新选中状态
        if (isSelected) {
            selectedSubtypes.add(subtype);
        } else {
            selectedSubtypes.delete(subtype);
        }
        
        updateSelectedSummary();
    }
    
    // 更新选中类型摘要
    function updateSelectedSummary() {
        if (selectedTypes.size === 0 && selectedSubtypes.size === 0) {
            selectedSummary.textContent = '未选择任何类型';
            return;
        }
        
        let summaryText = '';
        
        // 添加选中的主类型
        if (selectedTypes.size > 0) {
            summaryText += `已选择: ${Array.from(selectedTypes).join(', ')}`;
        }
        
        // 添加选中的子类型
        if (selectedSubtypes.size > 0) {
            summaryText += ` | 子类型: ${Array.from(selectedSubtypes).join(', ')}`;
        }
        
        selectedSummary.textContent = summaryText;
    }
    
    // 根据工具类型显示/隐藏小说类型选择
    function toggleNovelTypesVisibility(toolType) {
        // 只在以下四种生成器页面显示小说类型选择
        const visibleInTools = ['title', 'outline', 'detailed-outline', 'character'];
        
        if (visibleInTools.includes(toolType)) {
            novelTypesSection.style.display = 'block';
        } else {
            novelTypesSection.style.display = 'none';
        }
    }
    
    // 获取选中的类型和子类型，用于提示词生成
    function getSelectedTypesForPrompt() {
        if (selectedTypes.size === 0 && selectedSubtypes.size === 0) {
            return '';
        }
        
        let typeInfo = '小说类型要求：';
        
        // 添加选中的主类型
        if (selectedTypes.size > 0) {
            typeInfo += `主类型【${Array.from(selectedTypes).join('、')}】`;
        }
        
        // 添加选中的子类型
        if (selectedSubtypes.size > 0) {
            if (selectedTypes.size > 0) {
                typeInfo += '，';
            }
            typeInfo += `子类型【${Array.from(selectedSubtypes).join('、')}】`;
        }
        
        // 明确指示这是重要的类型指导
        typeInfo += '。请确保生成内容严格遵循上述小说类型的风格和特点。';
        
        return typeInfo;
    }
    
    // 将函数暴露为全局函数，让script.js可以访问
    window.getSelectedNovelTypesForPrompt = getSelectedTypesForPrompt;
    window.isNovelTypesSelectionActiveForTool = function(toolType) {
        const visibleInTools = ['title', 'outline', 'detailed-outline', 'character'];
        return visibleInTools.includes(toolType);
    };
    
    // 等待主脚本加载完成
    setTimeout(function() {
        // 监听工具箱区域显示
        if (typeof window.showToolbox === 'function') {
            const originalShowToolbox = window.showToolbox;
            window.showToolbox = function(toolType) {
                // 调用原始的showToolbox函数
                originalShowToolbox(toolType);
                
                // 初始化小说类型（如果还没有初始化）
                if (novelMainTypes && novelMainTypes.children.length === 0) {
                    initNovelTypes();
                }
                
                // 显示/隐藏小说类型选择
                toggleNovelTypesVisibility(toolType);
                
                // 重置选择
                selectedTypes.clear();
                selectedSubtypes.clear();
                
                // 更新UI
                document.querySelectorAll('.novel-type-option').forEach(el => {
                    el.classList.remove('selected');
                });
                
                subtypesContainer.classList.remove('visible');
                updateSelectedSummary();
            };
        } else {
            console.error('原始showToolbox函数未找到，无法正确初始化小说类型选择功能');
        }
        
        // Our global functions are now properly defined and script.js will use them
        // We no longer need to override the generateToolboxOutput function since
        // script.js now directly calls window.getSelectedNovelTypesForPrompt()
        console.log("小说类型选择功能已集成到工具箱中");
        
        // 开始加载小说类型数据
        fetchNovelTypes();
    }, 1000); // 给主脚本1秒钟的加载时间
}); 