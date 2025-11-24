// Character and Knowledge Graph functionality
document.addEventListener('DOMContentLoaded', function() {
    const characterGraphBtn = document.getElementById('character-graph-btn');
    const characterGraphView = document.getElementById('character-graph-view');
    const uploadGraphFileBtn = document.getElementById('upload-graph-file-btn');
    const graphFileInput = document.getElementById('graph-file-input');
    const selectedFileName = document.getElementById('selected-file-name');
    const generateCharacterGraphBtn = document.getElementById('generate-character-graph-btn');
    const generateKnowledgeGraphBtn = document.getElementById('generate-knowledge-graph-btn');
    const saveGraphBtn = document.getElementById('save-graph-btn');
    const graphVisualization = document.getElementById('graph-visualization');
    const graphModelSelect = document.getElementById('graph-model-select');

    let currentFileContent = null;
    let currentGraphData = null;

    // Load available models
    async function loadModels() {
        try {
            const response = await fetch('/api/models');
            if (!response.ok) throw new Error('Failed to load models');
            const models = await response.json();
            
            graphModelSelect.innerHTML = '<option value="">选择模型...</option>';
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.name;
                graphModelSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Error loading models:', error);
        }
    }

    // Show character graph view
    characterGraphBtn.addEventListener('click', function() {
        hideAllViews();
        characterGraphView.classList.remove('hidden');
        loadModels();
    });

    // Handle file upload
    graphFileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            selectedFileName.textContent = file.name;
            const reader = new FileReader();
            reader.onload = function(e) {
                currentFileContent = e.target.result;
                // 不再自动启用按钮，按钮始终可点，由点击事件校验
            };
            reader.readAsText(file);
        }
    });

    // Generate character relationship graph
    generateCharacterGraphBtn.addEventListener('click', async function() {
        if (!currentFileContent || !graphModelSelect.value) {
            alert('请先上传文件并选择模型');
            return;
        }

        // 优化：显示生成中
        generateCharacterGraphBtn.textContent = '生成中...';
        generateCharacterGraphBtn.disabled = true;
        generateKnowledgeGraphBtn.disabled = true;

        try {
            const response = await fetch('/api/character-relationship-graph', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: currentFileContent,
                    model: graphModelSelect.value
                })
            });

            if (!response.ok) {
                throw new Error('生成角色关系图谱失败');
            }

            const data = await response.json();
            currentGraphData = data;
            renderGraph(data, 'character');
            saveGraphBtn.disabled = false;
        } catch (error) {
            alert('生成角色关系图谱时出错: ' + error.message);
        } finally {
            generateCharacterGraphBtn.textContent = '分析角色关系';
            generateCharacterGraphBtn.disabled = false;
            generateKnowledgeGraphBtn.disabled = false;
        }
    });

    // Generate knowledge graph
    generateKnowledgeGraphBtn.addEventListener('click', async function() {
        if (!currentFileContent || !graphModelSelect.value) {
            alert('请先上传文件并选择模型');
            return;
        }

        // 优化：显示生成中
        generateKnowledgeGraphBtn.textContent = '生成中...';
        generateKnowledgeGraphBtn.disabled = true;
        generateCharacterGraphBtn.disabled = true;

        try {
            const response = await fetch('/api/knowledge-graph', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: currentFileContent,
                    model: graphModelSelect.value
                })
            });

            if (!response.ok) {
                throw new Error('生成知识图谱失败');
            }

            const data = await response.json();
            currentGraphData = data;
            renderGraph(data, 'knowledge');
            saveGraphBtn.disabled = false;
        } catch (error) {
            alert('生成知识图谱时出错: ' + error.message);
        } finally {
            generateKnowledgeGraphBtn.textContent = '分析知识图谱';
            generateKnowledgeGraphBtn.disabled = false;
            generateCharacterGraphBtn.disabled = false;
        }
    });

    // Add new UI elements for filtering and search
    const graphControls = document.createElement('div');
    graphControls.className = 'graph-controls';
    graphControls.innerHTML = `
        <div class="search-container">
            <input type="text" id="node-search" placeholder="搜索节点..." class="search-input">
        </div>
        <div class="filter-container">
            <select id="relationship-filter" class="filter-select">
                <option value="">所有关系</option>
                <option value="亲属">亲属</option>
                <option value="父母">父母</option>
                <option value="子女">子女</option>
                <option value="配偶">配偶</option>
                <option value="兄弟姐妹">兄弟姐妹</option>
                <option value="朋友">朋友</option>
                <option value="挚友">挚友</option>
                <option value="师徒">师徒</option>
                <option value="同门">同门</option>
                <option value="敌对">敌对</option>
                <option value="仇敌">仇敌</option>
                <option value="盟友">盟友</option>
                <option value="上下级">上下级</option>
                <option value="主仆">主仆</option>
                <option value="恋人">恋人</option>
                <option value="恩人">恩人</option>
                <option value="仇人">仇人</option>
            </select>
            <select id="importance-filter" class="filter-select">
                <option value="">所有重要性</option>
                <option value="主角">主角</option>
                <option value="重要配角">重要配角</option>
                <option value="次要配角">次要配角</option>
            </select>
        </div>
    `;
    characterGraphView.insertBefore(graphControls, characterGraphView.firstChild);

    // Enhanced renderGraph function
    function renderGraph(data, type) {
        // Clear previous graph
        d3.select('#graph-visualization').selectAll('*').remove();

        // Calculate node importance based on connection count
        data.nodes.forEach(node => {
            const connectionCount = data.links.filter(link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                return sourceId === node.id || targetId === node.id;
            }).length;
            // Determine importance based on connection count
            if (connectionCount >= 5) {
                node.importance = '主角';
            } else if (connectionCount >= 3) {
                node.importance = '重要配角';
            } else {
                node.importance = '次要配角';
            }
        });

        const width = graphVisualization.clientWidth;
        const height = graphVisualization.clientHeight;

        // Create SVG with zoom/pan support
        const svg = d3.select('#graph-visualization')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .style('background', 'linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)') // fallback for non-SVG
            .call(
                d3.zoom()
                    .scaleExtent([0.2, 3])
                    .on('zoom', (event) => {
                        g.attr('transform', event.transform);
                    })
            )
            .on('dblclick.zoom', null);

        // SVG gradient background (SVG-native)
        const svgDefs = svg.append('defs');
        svgDefs.append('linearGradient')
            .attr('id', 'svg-bg-gradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '100%').attr('y2', '100%')
            .selectAll('stop')
            .data([
                {offset: '0%', color: '#f8fafc'},
                {offset: '100%', color: '#e0e7ef'}
            ])
            .enter()
            .append('stop')
            .attr('offset', d => d.offset)
            .attr('stop-color', d => d.color);
        svg.insert('rect', ':first-child')
            .attr('width', '100%')
            .attr('height', '100%')
            .attr('fill', 'url(#svg-bg-gradient)');

        // Enhanced SVG defs
        const defs = svg.append('defs');
        
        // Add relationship type patterns
        const relationshipPatterns = {
            '亲属': 'url(#pattern-family)',
            '父母': 'url(#pattern-parent)',
            '子女': 'url(#pattern-child)',
            '配偶': 'url(#pattern-spouse)',
            '兄弟姐妹': 'url(#pattern-sibling)',
            '朋友': 'url(#pattern-friend)',
            '挚友': 'url(#pattern-close-friend)',
            '师徒': 'url(#pattern-mentor)',
            '同门': 'url(#pattern-peer)',
            '敌对': 'url(#pattern-enemy)',
            '仇敌': 'url(#pattern-nemesis)',
            '盟友': 'url(#pattern-ally)',
            '上下级': 'url(#pattern-hierarchy)',
            '主仆': 'url(#pattern-master-servant)',
            '恋人': 'url(#pattern-lover)',
            '恩人': 'url(#pattern-benefactor)',
            '仇人': 'url(#pattern-vendetta)'
        };

        // Add patterns for different relationship types
        defs.append('pattern')
            .attr('id', 'pattern-family')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M0,5 L10,5')
            .attr('stroke', '#FF6B6B')
            .attr('stroke-width', 2);

        defs.append('pattern')
            .attr('id', 'pattern-parent')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M0,0 L10,10')
            .attr('stroke', '#FF6B6B')
            .attr('stroke-width', 2);

        defs.append('pattern')
            .attr('id', 'pattern-child')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M0,10 L10,0')
            .attr('stroke', '#FF6B6B')
            .attr('stroke-width', 2);

        defs.append('pattern')
            .attr('id', 'pattern-spouse')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M0,0 L10,10 M0,10 L10,0')
            .attr('stroke', '#FF6B6B')
            .attr('stroke-width', 2);

        defs.append('pattern')
            .attr('id', 'pattern-sibling')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M0,5 L10,5 M5,0 L5,10')
            .attr('stroke', '#FF6B6B')
            .attr('stroke-width', 2);

        defs.append('pattern')
            .attr('id', 'pattern-friend')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M0,0 L10,10 M0,10 L10,0')
            .attr('stroke', '#4ECDC4')
            .attr('stroke-width', 1);

        defs.append('pattern')
            .attr('id', 'pattern-close-friend')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M0,0 L10,10 M0,10 L10,0 M0,5 L10,5 M5,0 L5,10')
            .attr('stroke', '#4ECDC4')
            .attr('stroke-width', 2);

        defs.append('pattern')
            .attr('id', 'pattern-mentor')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M5,0 L5,10 M0,5 L10,5')
            .attr('stroke', '#A78BFA')
            .attr('stroke-width', 1);

        defs.append('pattern')
            .attr('id', 'pattern-peer')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M0,0 L10,10 M0,10 L10,0 M5,0 L5,10')
            .attr('stroke', '#A78BFA')
            .attr('stroke-width', 1);

        defs.append('pattern')
            .attr('id', 'pattern-enemy')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M0,0 L10,10 M0,10 L10,0')
            .attr('stroke', '#F87171')
            .attr('stroke-width', 2);

        defs.append('pattern')
            .attr('id', 'pattern-nemesis')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M0,0 L10,10 M0,10 L10,0 M0,5 L10,5 M5,0 L5,10')
            .attr('stroke', '#F87171')
            .attr('stroke-width', 3);

        defs.append('pattern')
            .attr('id', 'pattern-ally')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M0,0 L10,10 M0,10 L10,0 M5,0 L5,10')
            .attr('stroke', '#34D399')
            .attr('stroke-width', 2);

        defs.append('pattern')
            .attr('id', 'pattern-hierarchy')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M0,0 L10,10 M0,10 L10,0 M0,5 L10,5')
            .attr('stroke', '#60A5FA')
            .attr('stroke-width', 2);

        defs.append('pattern')
            .attr('id', 'pattern-master-servant')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M0,0 L10,10 M0,10 L10,0 M5,0 L5,10 M0,5 L10,5')
            .attr('stroke', '#60A5FA')
            .attr('stroke-width', 2);

        defs.append('pattern')
            .attr('id', 'pattern-lover')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M0,0 L10,10 M0,10 L10,0 M0,5 L10,5 M5,0 L5,10')
            .attr('stroke', '#EC4899')
            .attr('stroke-width', 2);

        defs.append('pattern')
            .attr('id', 'pattern-benefactor')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M0,0 L10,10 M0,10 L10,0 M5,0 L5,10')
            .attr('stroke', '#10B981')
            .attr('stroke-width', 2);

        defs.append('pattern')
            .attr('id', 'pattern-vendetta')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 10)
            .attr('height', 10)
            .append('path')
            .attr('d', 'M0,0 L10,10 M0,10 L10,0 M0,5 L10,5 M5,0 L5,10')
            .attr('stroke', '#EF4444')
            .attr('stroke-width', 3);

        // 节点阴影
        defs.append('filter')
            .attr('id', 'node-shadow')
            .html(`
                <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#333" flood-opacity="0.3"/>
            `);
        // 节点发光
        defs.append('filter')
            .attr('id', 'node-glow')
            .html(`
                <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            `);
        // 渐变色（可根据type扩展）
        defs.append('linearGradient')
            .attr('id', 'node-gradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '100%').attr('y2', '100%')
            .html(`
                <stop offset="0%" stop-color="#FF6B6B"/>
                <stop offset="100%" stop-color="#FF8E8E"/>
            `);
        // 图标符号定义
        defs.append('symbol').attr('id', 'icon-person').attr('viewBox', '0 0 24 24').html(`
            <circle cx="12" cy="8" r="4" fill="#fff"/>
            <path d="M4 20c0-4 16-4 16 0" fill="#fff" stroke="#FF6B6B" stroke-width="1.5"/>
            <circle cx="12" cy="8" r="4" fill="#FF6B6B" fill-opacity="0.7"/>
        `);
        defs.append('symbol').attr('id', 'icon-place').attr('viewBox', '0 0 24 24').html(`
            <circle cx="12" cy="12" r="8" fill="#4ECDC4" fill-opacity="0.7"/>
            <path d="M12 2v20M2 12h20" stroke="#fff" stroke-width="2"/>
        `);
        defs.append('symbol').attr('id', 'icon-item').attr('viewBox', '0 0 24 24').html(`
            <rect x="5" y="5" width="14" height="14" rx="3" fill="#FFD93D" fill-opacity="0.7" stroke="#FFB800" stroke-width="2"/>
            <circle cx="12" cy="12" r="3" fill="#fff"/>
        `);
        defs.append('symbol').attr('id', 'icon-concept').attr('viewBox', '0 0 24 24').html(`
            <ellipse cx="12" cy="12" rx="8" ry="6" fill="#A78BFA" fill-opacity="0.7"/>
            <path d="M12 6v12" stroke="#8B5CF6" stroke-width="2"/>
            <circle cx="12" cy="12" r="2" fill="#fff"/>
        `);
        defs.append('symbol').attr('id', 'icon-event').attr('viewBox', '0 0 24 24').html(`
            <polygon points="12,2 15,14 9,14 12,22" fill="#34D399" fill-opacity="0.7" stroke="#10B981" stroke-width="2"/>
        `);
        defs.append('symbol').attr('id', 'icon-rule').attr('viewBox', '0 0 24 24').html(`
            <rect x="6" y="6" width="12" height="12" rx="3" fill="#F87171" fill-opacity="0.7"/>
            <path d="M8 12h8" stroke="#fff" stroke-width="2"/>
        `);

        // 主g容器用于缩放
        const g = svg.append('g');

        // Enhanced force simulation
        const simulation = d3.forceSimulation(data.nodes)
            .force('link', d3.forceLink(data.links)
                .id(d => d.id)
                .distance(d => {
                    // Adjust distance based on relationship type
                    const relationshipTypes = {
                        '亲属': 100,
                        '父母': 100,
                        '子女': 100,
                        '配偶': 100,
                        '兄弟姐妹': 100,
                        '朋友': 120,
                        '挚友': 120,
                        '师徒': 140,
                        '同门': 140,
                        '敌对': 160,
                        '仇敌': 160,
                        '盟友': 140,
                        '上下级': 150,
                        '主仆': 150,
                        '恋人': 120,
                        '恩人': 140,
                        '仇人': 160
                    };
                    return relationshipTypes[d.relation] || 140;
                })
                .strength(d => {
                    // Adjust strength based on relationship importance
                    const importanceLevels = {
                        '主角': 0.8,
                        '重要配角': 0.6,
                        '次要配角': 0.4
                    };
                    return importanceLevels[d.importance] || 0.5;
                }))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(40));

        // Enhanced links with relationship types
        const link = g.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(data.links)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('stroke', d => {
                const relationshipColors = {
                    '亲属': '#FF6B6B',
                    '父母': '#FF6B6B',
                    '子女': '#FF6B6B',
                    '配偶': '#FF6B6B',
                    '兄弟姐妹': '#FF6B6B',
                    '朋友': '#4ECDC4',
                    '挚友': '#4ECDC4',
                    '师徒': '#A78BFA',
                    '同门': '#A78BFA',
                    '敌对': '#F87171',
                    '仇敌': '#F87171',
                    '盟友': '#34D399',
                    '上下级': '#60A5FA',
                    '主仆': '#60A5FA',
                    '恋人': '#EC4899',
                    '恩人': '#10B981',
                    '仇人': '#EF4444'
                };
                return relationshipColors[d.relation] || '#b0b0b0';
            })
            .attr('stroke-width', d => {
                const importanceLevels = {
                    '主角': 3,
                    '重要配角': 2,
                    '次要配角': 1
                };
                return importanceLevels[d.importance] || 2;
            })
            .attr('stroke-opacity', 0.7)
            .attr('stroke-dasharray', d => {
                const relationshipPatterns = {
                    '亲属': 'none',
                    '朋友': '5,5',
                    '师徒': '10,5',
                    '敌对': '2,2'
                };
                return relationshipPatterns[d.relation] || 'none';
            })
            .attr('marker-end', 'url(#arrow)')
            .style('filter', 'drop-shadow(0px 2px 6px #b0b0b055)'); // soft shadow

        // Add arrow marker for directed relationships
        defs.append('marker')
            .attr('id', 'arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 20)
            .attr('refY', 0)
            .attr('markerWidth', 6)
            .attr('markerHeight', 6)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', '#999');

        // Enhanced link labels with relationship details
        const linkLabels = g.append('g')
            .attr('class', 'link-labels')
            .selectAll('g')
            .data(data.links)
            .enter()
            .append('g')
            .attr('class', 'link-label-group');

        // Add background for label
        linkLabels.append('rect')
            .attr('class', 'link-label-bg')
            .attr('rx', 8)
            .attr('ry', 8)
            .attr('height', 22)
            .attr('y', -16)
            .attr('fill', '#fff')
            .attr('stroke', '#e0e7ef')
            .attr('stroke-width', 1.5)
            .attr('opacity', 0.85);

        linkLabels.append('text')
            .attr('class', 'link-label')
            .text(d => d.relation)
            .attr('x', 10)
            .attr('y', 0)
            .style('font-size', '14px')
            .style('fill', '#555')
            .style('font-weight', 'bold')
            .style('pointer-events', 'none')
            .style('dominant-baseline', 'middle');

        // Add relationship strength indicator
        linkLabels.append('circle')
            .attr('r', 5)
            .attr('cx', -12)
            .attr('cy', 0)
            .attr('fill', d => {
                const strengthColors = {
                    '强': '#FF6B6B',
                    '中': '#4ECDC4',
                    '弱': '#A78BFA'
                };
                return strengthColors[d.strength] || '#999';
            })
            .style('pointer-events', 'none');

        // Adjust label background width dynamically
        linkLabels.each(function() {
            const text = d3.select(this).select('text');
            const rect = d3.select(this).select('rect');
            const textNode = text.node();
            if (textNode) {
                const width = textNode.getComputedTextLength() + 24;
                rect.attr('width', width).attr('x', -14);
            }
        });

        // Enhanced nodes with importance levels
        const node = g.append('g')
            .attr('class', 'nodes')
            .selectAll('g')
            .data(data.nodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .on('mouseover', function(event, d) {
                // Enhanced hover effects
                d3.select(this).select('circle')
                    .attr('filter', 'url(#node-glow)')
                    .attr('stroke', '#FFD700')
                    .attr('stroke-width', 4);

                // Show detailed tooltip with importance
                const tooltip = d3.select('body').append('div')
                    .attr('class', 'node-tooltip')
                    .style('position', 'absolute')
                    .style('background', 'rgba(255, 255, 255, 0.9)')
                    .style('padding', '10px')
                    .style('border-radius', '5px')
                    .style('box-shadow', '0 2px 5px rgba(0,0,0,0.2)')
                    .style('pointer-events', 'none')
                    .html(`
                        <strong>${d.name}</strong><br>
                        重要性: ${d.importance}<br>
                        关联数量: ${data.links.filter(link => 
                            link.source.id === d.id || link.target.id === d.id
                        ).length}<br>
                        描述: ${d.description || '无'}<br>
                        标签: ${(d.tags || []).join(', ')}
                    `);

                // Position tooltip
                tooltip
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 10) + 'px');

                // Highlight connected nodes and links
                link
                    .style('stroke-opacity', l => (l.source === d || l.target === d) ? 1 : 0.1)
                    .style('stroke-width', l => (l.source === d || l.target === d) ? 3 : 1);

                node.select('circle')
                    .style('opacity', n => {
                        const isConnected = data.links.some(l => 
                            (l.source === d && l.target === n) || 
                            (l.source === n && l.target === d)
                        );
                        return isConnected ? 1 : 0.1;
                    });
            })
            .on('mouseout', function(event, d) {
                // Remove tooltip
                d3.selectAll('.node-tooltip').remove();

                // Reset styles
                d3.select(this).select('circle')
                    .attr('filter', 'url(#node-shadow)')
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 2);

                link
                    .style('stroke-opacity', 0.7)
                    .style('stroke-width', 2);

                node.select('circle')
                    .style('opacity', 1);
            })
            .on('click', function(event, d) {
                // Show detailed node information in a modal
                const modal = document.createElement('div');
                modal.className = 'node-modal';
                modal.innerHTML = `
                    <div class="modal-content">
                        <h2>${d.name}</h2>
                        <p><strong>重要性:</strong> ${d.importance}</p>
                        <p><strong>关联数量:</strong> ${data.links.filter(link => 
                            link.source.id === d.id || link.target.id === d.id
                        ).length}</p>
                        <p><strong>描述:</strong> ${d.description || '无'}</p>
                        <p><strong>标签:</strong> ${(d.tags || []).join(', ')}</p>
                        <div class="related-nodes">
                            <h3>相关角色</h3>
                            <ul>
                                ${data.links
                                    .filter(l => l.source === d || l.target === d)
                                    .map(l => {
                                        const relatedNode = l.source === d ? l.target : l.source;
                                        return `<li>${relatedNode.name} (${l.relation})</li>`;
                                    })
                                    .join('')}
                            </ul>
                        </div>
                        <button class="close-modal">关闭</button>
                    </div>
                `;
                document.body.appendChild(modal);

                // Close modal functionality
                modal.querySelector('.close-modal').onclick = () => {
                    modal.remove();
                };
            })
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        // Enhanced node circles with importance levels
        node.append('circle')
            .attr('r', d => {
                const importanceSizes = {
                    '主角': 35,
                    '重要配角': 28,
                    '次要配角': 22
                };
                return importanceSizes[d.importance] || 25;
            })
            .attr('fill', d => {
                if (type === 'knowledge') {
                    const categoryColors = {
                        '人物': 'url(#node-gradient)',
                        '地点': '#5ad1c7',
                        '物品': '#ffe066',
                        '概念': '#b39ddb',
                        '事件': '#6ee7b7',
                        '规则': '#fca5a5'
                    };
                    return categoryColors[d.category] || 'url(#node-gradient)';
                }
                // Add importance-based colors for character nodes
                const importanceColors = {
                    '主角': '#FF6B6B',
                    '重要配角': '#4ECDC4',
                    '次要配角': '#A78BFA'
                };
                return importanceColors[d.importance] || 'url(#node-gradient)';
            })
            .attr('stroke', '#fff')
            .attr('stroke-width', d => {
                const importanceStrokeWidths = {
                    '主角': 3,
                    '重要配角': 2,
                    '次要配角': 1
                };
                return importanceStrokeWidths[d.importance] || 2;
            })
            .attr('filter', 'url(#node-shadow)');

        // Add importance indicator
        node.append('circle')
            .attr('r', d => {
                const importanceSizes = {
                    '主角': 8,
                    '重要配角': 6,
                    '次要配角': 4
                };
                return importanceSizes[d.importance] || 5;
            })
            .attr('fill', '#fff')
            .attr('stroke', 'none')
            .attr('opacity', 0.8)
            .attr('transform', 'translate(-20, -20)');

        // 节点图标
        node.append('use')
            .attr('xlink:href', d => {
                if (type === 'knowledge') {
                    const map = {
                        '人物': '#icon-person',
                        '地点': '#icon-place',
                        '物品': '#icon-item',
                        '概念': '#icon-concept',
                        '事件': '#icon-event',
                        '规则': '#icon-rule'
                    };
                    return map[d.category] || '#icon-concept';
                }
                return '#icon-person';
            })
            .attr('x', -16)
            .attr('y', -16)
            .attr('width', 32)
            .attr('height', 32)
            .attr('opacity', 0.85)
            .attr('transform', 'scale(1)');

        // 节点标签
        node.append('text')
            .text(d => d.name)
            .attr('x', 0)
            .attr('y', d => {
                const importanceOffsets = {
                    '主角': 45,
                    '重要配角': 38,
                    '次要配角': 32
                };
                return importanceOffsets[d.importance] || 35;
            })
            .attr('text-anchor', 'middle')
            .style('font-size', d => {
                const importanceFontSizes = {
                    '主角': '16px',
                    '重要配角': '14px',
                    '次要配角': '12px'
                };
                return importanceFontSizes[d.importance] || '14px';
            })
            .style('font-weight', d => d.importance === '主角' ? 'bold' : 'normal')
            .style('fill', '#222')
            .style('pointer-events', 'none');

        // 节点详细信息悬停提示
        node.append('title')
            .text(d => {
                if (type === 'knowledge') {
                    const category = d.category || '未知';
                    const tags = Array.isArray(d.tags) ? d.tags.join(', ') : '';
                    return `${d.name}\n分类: ${category}\n标签: ${tags}`;
                }
                return d.name;
            });

        // 力导向仿真 tick
        simulation.on('tick', () => {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            linkLabels
                .attr('transform', d => {
                    const x = (d.source.x + d.target.x) / 2;
                    const y = (d.source.y + d.target.y) / 2 - 10; // offset above the line
                    return `translate(${x},${y})`;
                });

            node
                .attr('transform', d => `translate(${d.x},${d.y})`);
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

        // 自适应窗口大小
        window.addEventListener('resize', () => {
            const newWidth = graphVisualization.clientWidth;
            const newHeight = graphVisualization.clientHeight;
            svg.attr('width', newWidth).attr('height', newHeight);
            simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
            simulation.alpha(0.5).restart();
        });

        // Add search and filter functionality
        const nodeSearch = document.getElementById('node-search');
        const relationshipFilter = document.getElementById('relationship-filter');
        const importanceFilter = document.getElementById('importance-filter');

        // 亲属关系类型集合
        const kinshipRelations = [
            '亲属', '父母', '母子', '父子', '子女', '兄弟姐妹', '舅舅', '姑妈', '姨妈', '叔叔', '外甥', '侄子', '祖父', '祖母', '孙子', '孙女'
        ];

        function updateGraph() {
            const searchTerm = nodeSearch.value.toLowerCase();
            const selectedRelation = relationshipFilter.value;
            const selectedImportance = importanceFilter.value;

            // Filter nodes and links
            const filteredNodes = data.nodes.filter(node => {
                const matchesSearch = node.name.toLowerCase().includes(searchTerm);
                const matchesImportance = !selectedImportance || node.importance === selectedImportance;
                return matchesSearch && matchesImportance;
            });

            const filteredLinks = data.links.filter(link => {
                let matchesRelation = true;
                if (selectedRelation) {
                    if (selectedRelation === '亲属') {
                        matchesRelation = kinshipRelations.includes(link.relation);
                    } else {
                        matchesRelation = link.relation === selectedRelation;
                    }
                }
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                const sourceNode = data.nodes.find(n => n.id === sourceId);
                const targetNode = data.nodes.find(n => n.id === targetId);
                const nodesVisible = filteredNodes.includes(sourceNode) && filteredNodes.includes(targetNode);
                return matchesRelation && nodesVisible;
            });

            // Update simulation with filtered data
            simulation.nodes(filteredNodes);
            simulation.force('link').links(filteredLinks);
            simulation.alpha(0.3).restart();

            // Update visual elements
            node.style('display', d => filteredNodes.includes(d) ? null : 'none');
            link.style('display', d => filteredLinks.includes(d) ? null : 'none');
            linkLabels.style('display', d => filteredLinks.includes(d) ? null : 'none');
        }

        // Add event listeners for search and filters
        nodeSearch.addEventListener('input', updateGraph);
        relationshipFilter.addEventListener('change', updateGraph);
        importanceFilter.addEventListener('change', updateGraph);
    }

    // Get node color based on type and category
    function getNodeColor(node, type) {
        if (type === 'knowledge') {
            const categoryColors = {
                '人物': '#ff7f0e',
                '地点': '#1f77b4',
                '物品': '#2ca02c',
                '概念': '#d62728',
                '事件': '#9467bd',
                '规则': '#8c564b'
            };
            return categoryColors[node.category] || '#999';
        }
        return '#1f77b4'; // Default color for character nodes
    }

    // Save graph
    saveGraphBtn.addEventListener('click', function() {
        const svg = document.querySelector('#graph-visualization svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');
            
            const downloadLink = document.createElement('a');
            downloadLink.download = 'graph-visualization.png';
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    });
}); 