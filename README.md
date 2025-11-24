# 笔墨星河 v1.06 项目综述

> 目的：对项目的软件整体、架构设计、实现要点与功能进行系统化总结，便于快速上手与维护。

## 一、软件概览

- 名称：笔墨星河（开源版 v1.06）
- 类型：基于大模型的小说创作助手，支持故事构思、写作续写、人物卡、世界观词条、风格库、知识/关系图谱、章节管理、导入/导出等
- 技术栈：后端 Flask + 前端原生 HTML/CSS/JS（含 D3 图谱可视化）
- 模型接入：OpenRouter 免费模型列表 + 自定义 API（包括 Key 管理与模型配置）
- 运行方式：本地启动 `app.py` 后自动打开浏览器访问界面

## 二、目录结构（关键路径）

- `app.py`：Flask 后端主程序，路由/业务逻辑/数据持久化
- `templates/index.html`：单页前端入口（UI 布局、工具箱、写作区、侧边栏）
- `static/css/style.css`：界面样式、交互细节样式
- `static/js/script.js`：前端主逻辑（模型选择、小说/章节 CRUD、人物/词条/风格库、工具箱、导入导出、SSE 流式写作等）
- `static/js/main.js`：知识/关系图谱可视化（D3 力导向图）
- `static/js/chapter-manager.js`：章节管理模块（创建/编辑/保存/删除/导出）
- `static/js/novel-types.js`：小说类型选择与提示增强（读取 `小说类型.txt`）
- `static/js/api-keys.js`：前端本地 API Key 存取（与后端 Key 状态联动）
- `static/js/right-sidebar.js`：右侧工具栏交互（大纲/细纲追加、角色卡保存等）
- `data/`：JSON 数据仓库（小说、人物、词条、风格、游戏、API Key、API 配置等）
- `prompt/`：风格/提示模板集合（支持导入 MD 样式到风格库）
- `model/`：通用提示词模板（如 `通用模版.txt`）
- `exports/`：导出目录（运行时由后端写入 TXT/JSON/DOCX 等）

## 三、架构设计

- 前后端分离的单页应用（SPA）结构，后端提供 REST/SSE 接口，前端以原生 JS 组织业务模块
- 数据持久化采用 JSON 文件，使用安全的原子写入策略（临时文件写入 + 替换）保证数据不丢失
- 模型调用支持两种模式：
  - OpenRouter 多模型（免费列表）选择，后端统一代理，并以 SSE 流式返回 token
  - 自定义 API（配置 base_url、headers、body 模板与字段映射），适配不同服务商的响应结构
- 资源路径适配 PyInstaller 打包（`resource_path`），支持单文件/目录打包后运行

## 四、后端服务（路由概览）

- 页面与静态资源：
  - `GET /` 入口页渲染（`d:\mota\开源--笔墨星河v1.06\app.py:371`）
- 模型与 Key 管理：
  - `GET /api/models` 获取可用模型列表（含免费模型，`app.py:383`）
  - `GET /api/api-key-status` 查询后端是否已保存有效 Key（`app.py:1960`）
  - `POST /api/set-api-key` 设置并验证 OpenRouter API Key（`app.py:1996`）
- 文本生成（SSE 流式）：
  - `POST /api/generate` 统一生成接口，返回 `text/event-stream`（`app.py:543`）
    - 支持 OpenRouter 与自定义 API；对不同响应格式做 token 兼容解析
- 小说与章节：
  - `GET /api/novels` 列表；`POST /api/novels` 新建（`app.py:126`、`app.py:206`）
  - `GET /api/novels/<id>` 读取；`PUT /api/novels/<id>` 更新；`DELETE /api/novels/<id>` 删除（`app.py:262`、`app.py:319`、`app.py:429`）
  - 章节 CRUD：`/api/novels/<id>/chapters/...`（创建/更新/删除/导出，`app.py:1477`、`app.py:1591`、`app.py:1640`、`app.py:1701`）
  - 导入导出：`POST /api/novels/import`、`POST /api/novels/<id>/export/<fmt>`（`app.py:930`、`app.py:807`）
- 角色/词条/风格库：
  - 角色：`/api/characters`（列表/创建/读取/更新/删除，`app.py:1055`、`app.py:1106`、`app.py:1168`、`app.py:1209`、`app.py:1232`）
  - 词条：`/api/glossary`（列表/创建/读取/更新/删除，`app.py:1263`、`app.py:1316`、`app.py:1376`、`app.py:1417`、`app.py:1440`）
  - 风格：`/api/styles`（列表/创建/读取/更新/删除，`app.py:1728`、`app.py:1781`、`app.py:1841`、`app.py:1882`、`app.py:1905`）
  - 从 `prompt/*.md` 导入风格项（`app.py:1930`）
- 游戏与其它：
  - 文本冒险游戏存取：`/api/games` 系列（`app.py:2028` 之后）
  - 图谱数据抽取：`/api/extract-relationships`、`/api/extract-knowledge`（`app.py:2257`、`app.py:2401`）
  - 保存任意文本到文件：`POST /api/save-text-file`（`app.py:2534`）

## 五、前端模块与交互

- 模型与 Key：加载模型、选择与持久化、Key 状态联动（`static/js/script.js`）
- 小说与章节：
  - 小说列表、标题编辑、内容保存、字数统计、章节选中高亮与路由联动（`static/js/script.js` / `chapter-manager.js`）
  - 导入（`txt/json/docx`）与导出（`txt/json/docx`）统一通过后端接口
- 人物/词条/风格库：
  - 左侧下拉与全库列表联动，详情视图与编辑表单切换；
  - 标签化加入当前小说，自动同步到写作提示区（`charactersInput/knowledgeInput/stylePromptInput`）
- 工具箱（Synopsis/Title/Outline/Detailed Outline/Character）：
  - 任务指令+用户输入+小说类型（`novel-types.js`）+上下文（风格/角色/知识）拼装最终 Prompt，调用统一生成接口（`script.js:1914+`）
  - 流式回显，滚动提示，角色卡可直接保存入库
- 图谱可视化：
  - D3 力导向图，节点按 `importance/category` 配色与尺寸，连线按关系类型着色/线型/箭头，支持搜索与过滤（`static/js/main.js:1` 起）

## 六、数据持久化与格式

- 全部存储于 `data/*.json`，包含：
  - `novels.json`：小说列表与主体内容、标签化的角色/词条/风格、章节集合等
  - `characters.json`、`glossary.json`、`styles.json`：各库集合
  - `games.json`：文本冒险游戏数据
  - `api_key.json`：OpenRouter Key（后端保存预览、前端本地存储可选）
  - `api_configs.json`：自定义 API 列表（base_url/headers/body模板/响应字段映射）
- 写入策略：原子写入（`临时文件写入 → 替换目标文件`）防止并发/异常导致文件损坏（`app.py:87` `save_data_atomic`）

## 七、核心功能清单

- 写作生成与续写（SSE 流式；插入光标位置实时追加）
- 小说 CRUD + 章节管理（创建/重命名/保存/删除/导出）
- 人物卡、世界观词条、风格库的创建/编辑/删除与标签化加入当前小说
- 工具箱：简介/书名/大纲/细纲/人物卡生成，结果可一键并入小说或保存为条目
- 图谱：从正文抽取关系与知识，生成可交互图
- 导入：`txt/json/docx`；导出：`txt/json/docx` 到 `exports/`
- 自定义 API：配置任意第三方推理服务的请求/返回格式，复用同一生成入口

## 八、实现过程要点（技术细节）

- SSE 流式传输：后端统一将不同模型/服务的响应解析为 token 流，前端边读边插入并保持滚动与字数统计（`app.py:543`；`static/js/script.js:1093+`）
- 统一错误处理与用户提示：前后端都在流式错误情况下做及时提示与退出（`script.js:1182+`）
- 章节与正文双路保存：前端根据是否选中章节决定路由与 payload（`script.js:970+`）
- Prompt 组装策略：强调小说类型 → 任务指令 → 用户输入 → 上下文（风格/角色/知识），提升生成质量（`script.js:1994+`）
- D3 图谱增强：节点阴影/光晕、标签背景宽度自适应、关系强度/线型/颜色与过滤（`static/js/main.js:511+`）
- 文件导入（DOCX/JSON/TXT）与导出（TXT/JSON/DOCX）后端统一处理，避免浏览器兼容问题（`app.py:807`、`app.py:930`）
- 打包运行：`resource_path` 适配 PyInstaller，保证打包后读取模板与静态资源路径正确（`app.py:49`）

## 九、运行与部署

- 本地运行：
  - 安装依赖（Flask、requests、python-docx、d3 前端已内置）
  - 运行：`python app.py`，控制台显示地址并自动打开浏览器
  - 默认端口：`5000`（`app.py:350` 定义）
- 打包：
  - 使用 PyInstaller 打包后，可通过 `resource_path` 访问内嵌资源

## 十、模型与 API 支持

- OpenRouter：
  - 后端维护免费模型 ID 与名称映射（`app.py:383`），前端选择后持久化到 `localStorage`（`script.js:404+`）
- 自定义 API：
  - 在 `data/api_configs.json` 中配置多个服务：`name/base_url/headers/body_template/response_mapping`（`app.py:2120+`）
  - 生成时选择自定义服务，后端按映射解析 token 或全文

## 十一、安全与合规

- Key 管理：后端保存 Key 时仅返回掩码预览；前端本地存储 Key 可选（`script.js:318+`、`app.py:1960+`）
- 文件写入：导出与保存路径固定在项目目录下，避免任意路径写入风险
- 秘钥切勿提交到版本库：`data/api_key.json` 仅本地使用

## 十二、关键代码位置速览

- 入口与资源路径：`d:\mota\开源--笔墨星河v1.06\app.py:49`、`app.py:371`
- 模型列表与统一生成（SSE）：`app.py:383`、`app.py:543`
- 小说 CRUD 与章节：`app.py:206`、`app.py:262`、`app.py:1477`、`app.py:1591`
- 导入/导出：`app.py:930`、`app.py:807`
- 人物/词条/风格：`app.py:1055`、`app.py:1263`、`app.py:1728`
- 图谱抽取：`app.py:2257`、`app.py:2401`；前端渲染：`static/js/main.js:1` 起
- 前端主逻辑：`static/js/script.js`（模型/CRUD/工具箱/导入导出/SSE）

---

以上内容覆盖项目的核心模块、接口与实现细节，适合作为团队上手与维护指南。若需拓展到多用户/权限、云端存储或更复杂的打稿流程，可在现有模块基础上平滑演进。
