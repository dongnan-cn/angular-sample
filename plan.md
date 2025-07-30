# Angular 19 Jira Clone 项目计划书

## 1. 项目名称
Angular 19 Jira Clone - 基于 Angular 19 的全功能项目管理与协作平台模拟。

## 2. 项目目标
本项目旨在通过构建一个模拟 Jira 核心功能的单页应用（SPA），帮助开发者全面深入地学习和实践 Angular 19 的各项主要特性，包括但不限于：

- 熟练掌握 Angular 19 核心概念（组件、服务、路由、模块/独立组件）。
- 深入理解并广泛应用 RxJS 进行响应式编程，处理异步数据流。
- 掌握 Angular Signals 的使用，探索其在状态管理和性能优化中的优势。
- 实践 Angular CDK 中的拖放功能，实现动态用户界面。
- 通过 Mock 数据模拟后端行为，专注于前端业务逻辑与交互。
- 构建一个用户友好的界面，模拟真实的 Jira 使用体验。

## 3. 项目模块划分

### 3.1. 认证与授权模块 (Auth)
**目标**：实现用户登录、注册、注销功能，并模拟基于角色的访问控制。

**主要功能：**
- 用户登录：输入用户名和密码，模拟 JWT 认证流程。
- 用户注册：允许新用户注册。
- 用户注销：清除本地存储的 JWT。
- 路由守卫：`CanActivate`, `CanLoad`, `CanMatch` 保护需要认证才能访问的路由。
- 权限控制：模拟管理员和普通用户角色，并限制不同角色对某些页面的访问。

**Angular 特性应用：**
- 响应式表单 (Reactive Forms)：用于登录和注册表单，包含表单验证。
- 服务 (Services)：`AuthService` 用于处理认证逻辑、JWT 存储/获取。
- HTTP 拦截器 (Http Interceptor)：模拟自动附带 JWT 到请求头。
- 路由守卫 (Route Guards)：控制页面访问权限。
- 独立组件 (Standalone Components)：认证相关组件（如 Login, Register）可设计为独立组件。

### 3.2. 项目管理模块 (Projects)
**目标**：实现项目的创建、查看、编辑和删除，以及项目成员的管理。

**主要功能：**
- 项目列表：显示所有项目卡片或列表。
- 项目详情：查看单个项目的详细信息、成员列表和关联的任务。
- 项目 CRUD：创建新项目、编辑现有项目信息、删除项目。
- 项目成员管理：模拟添加和移除项目成员。

**Angular 特性应用：**
- 组件 (Components)：`ProjectListComponent`, `ProjectDetailComponent`, `ProjectFormComponent` 等。
- 路由 (Routing)：`projects`, `projects/:id`, `projects/new` 等路由路径。
- 服务 (Services)：`ProjectService` 处理项目数据的获取和操作。
- 响应式表单 (Reactive Forms)：用于项目创建和编辑表单。
- RxJS 操作符：如 `switchMap` 用于从路由参数获取项目详情。

### 3.3. 任务管理模块 (Tasks / Kanban Board)
**目标**：实现任务的创建、分配、状态流转以及在类似看板的界面中进行管理。

**主要功能：**
- 任务看板：展示不同状态（待办、进行中、已完成等）的任务列。
- 任务拖放：使用 Angular CDK Drag and Drop 实现任务在不同列之间以及列内排序的拖拽。
- 任务 CRUD：创建新任务、编辑任务详情（标题、描述、优先级、负责人、截止日期）、删除任务。
- 任务详情弹窗：点击任务卡片弹出详情框，展示更多信息和评论。
- 任务评论：模拟对任务的评论功能。

**Angular 特性应用：**
- 组件 (Components)：`KanbanBoardComponent`, `TaskCardComponent`, `TaskDetailDialogComponent`, `TaskFormComponent`, `CommentListComponent` 等。
- Angular CDK：`DragDropModule` 实现拖放功能。
- 服务 (Services)：`TaskService` 和 `CommentService`。
- RxJS 操作符：大量用于处理拖放事件流、筛选/排序任务、模拟实时评论等。
- 信号 (Signals)：在 `TaskCardComponent` 或 `TaskDetailDialogComponent` 中使用信号管理任务的局部状态（如展开/折叠状态，编辑模式）。
- 内容投影 (Content Projection)：创建更灵活的组件。

### 3.4. 用户中心模块 (User Profile & Admin)
**目标**：提供用户个人信息管理和（可选）简单的管理员功能。

**主要功能：**
- 用户个人资料：查看和编辑当前登录用户的基本信息。
- 用户列表 (管理员)：模拟管理员查看所有用户列表的功能。

**Angular 特性应用：**
- 组件 (Components)：`UserProfileComponent`, `UserListComponent`。
- 路由 (Routing)：`profile`, `admin/users`。
- 响应式表单 (Reactive Forms)：用于编辑用户资料。
- 路由守卫：限制 admin 路由只有管理员可访问。

## 4. Angular 核心特性在项目中的具体应用

- **独立组件 (Standalone Components)：** 新创建的组件和部分现有组件将采用独立组件模式，减少 NgModule 的依赖。
- **Angular Signals (稳定版)：**
  - 组件状态管理：使用 `signal()` 管理组件的内部响应式状态。
  - 派生状态：使用 `computed()` 基于现有信号派生新状态。
  - 副作用：使用 `effect()` 响应信号变化执行副作用（如日志、与外部库交互）。
  - 与 RxJS 结合：探索 `toSignal()` 和 `fromSignal()` 进行互操作。
- **RxJS 深度使用：**
  - HTTP 请求处理：`HttpClient` 返回 Observable，使用 `tap`, `catchError`。
  - 数据流转换：`map`, `filter`, `scan`, `reduce` 等。
  - 事件处理：处理 UI 事件（如输入框防抖 `debounceTime`）。
  - 组合操作符：`combineLatest`, `forkJoin`, `zip` 等处理多个异步源。
  - 错误处理与重试：`catchError`, `retry`, `retryWhen`。
  - 取消订阅：使用 `takeUntil`, `Subject` 或 `DestroyRef` 避免内存泄漏。
- **变更检测策略 (Change Detection Strategy)：** 在组件中应用 `OnPush` 策略，理解其工作原理及如何配合 RxJS/Signals 提升性能。
- **模板引用变量 (#)：** 访问 DOM 元素或组件实例。
- **视图查询 (@ViewChild, @ViewChildren)：** 在父组件中访问子组件或 DOM 元素。
- **延迟加载视图 (@defer)：** 在不影响初始加载的区域（如不常用模态框、折叠内容）应用此特性。
- **Angular 19 特有更新（待定，基于预测）：**
  - Zoneless 应用 (Experimental/Stable)：如 Angular 19 使 Zoneless 模式更稳定或默认，可尝试在此模式下开发，进一步理解 Angular 的变更检测机制。
  - 新的 @binding 语法或模板改进：关注 Angular 19 发布日志，整合任何新的模板或绑定语法糖。
  - 性能和构建工具链的改进：享受 Angular 持续的性能优化。

## 5. Mock 后端行为实现方案

我们将采用 **json-server** 来模拟后端行为，因为它能够模拟完整的 RESTful CRUD 操作，并且服务层代码与真实后端几乎一致，方便后期切换。

**实现步骤：**

1. 安装 json-server：
   ```shell
   npm install -g json-server
   ```
2. 创建 db.json 文件：在项目根目录下新建 `db.json`，定义初始的 users, projects, tasks 等集合数据。
3. 在 `db.json` 中初始化 Mock 数据，例如：
   ```json
   {
     "users": [
       { "id": 1, "username": "admin", "password": "admin", "role": "admin" },
       { "id": 2, "username": "user", "password": "user", "role": "user" }
     ],
     "projects": [],
     "tasks": []
   }
   ```
4. 启动 json-server：
   ```shell
   json-server --watch db.json --port 3000
   ```
5. 配置代理：在 Angular 项目根目录下创建 `proxy.conf.json`，内容如下：
   ```json
   {
     "/api": {
       "target": "http://localhost:3000",
       "secure": false,
       "changeOrigin": true,
       "pathRewrite": { "^/api": "" }
     }
   }
   ```
   并在启动 Angular 项目时加上代理参数：
   ```shell
   ng serve --proxy-config proxy.conf.json
   ```
6. 服务层代码：你的 `ProjectService`, `TaskService`, `AuthService` 等将继续使用 `HttpClient` 发送正常的 HTTP 请求（GET, POST, PUT, DELETE），`json-server` 会自动拦截并处理这些请求。
7. JWT 认证模拟：
   - 由于 json-server 不支持自定义登录端点，前端通过 `/api/users?username=xxx&password=xxx` 查询用户，登录成功后前端自行生成并存储 token。
   - 其他请求通过 HTTP 拦截器将这个 Mock JWT 附加到 Authorization 头中，用于模拟后续的认证检查。
8. 数据持久性：每次修改 db.json 或通过 API 修改数据，json-server 会自动更新本地文件，数据不会因页面刷新而丢失。

## 6. 项目结构与工具

- **Angular CLI：** 用于项目初始化、生成组件/服务/模块等。
- **项目结构：** 遵循 Angular 最佳实践，按功能或类型组织文件。例如：

  ```text
  src/app/
  ├── core/               // 核心服务, 拦截器, 认证逻辑, 路由守卫
  │   ├── auth/
  │   ├── services/
  │   └── guards/
  ├── features/           // 各大功能模块
  │   ├── auth/           // 登录/注册组件
  │   ├── projects/       // 项目列表/详情/表单组件
  │   │   ├── components/
  │   │   ├── services/
  │   │   └── pages/
  │   ├── tasks/          // 看板/任务卡片/详情组件
  │   └── users/          // 用户管理/个人资料组件
  ├── shared/             // 可复用组件, 管道, 指令 (无业务逻辑)
  │   ├── components/
  │   ├── directives/
  │   └── pipes/
  ├── assets/
  │   └── mock-data/      // 静态 JSON Mock 数据 (备用或部分功能)
  ├── app.config.ts       // 独立组件的全局配置
  ├── app.component.ts
  ├── app.routes.ts
  └── main.ts
  ```
- **样式框架：** 可选择 Angular Material, PrimeNG, 或 Tailwind CSS，以快速构建美观的 UI。
- **版本控制：** 使用 Git 进行版本控制，并推送到 GitHub/GitLab。

## 7. 开发流程建议

1. **项目初始化：** 使用 Angular CLI 创建新项目（确保安装最新版 CLI 以支持 Angular 19）。
2. **配置 Mock API：** 首先集成 `angular-in-memory-web-api` 并创建基础的 `InMemoryDataService`。
3. **认证模块开发：** 优先实现登录/注册、JWT 存储与拦截器，确保用户可以“登录”并获取 Mock Token。
4. **路由配置：** 设置所有主要模块的路由，并实现路由守卫。
5. **项目模块开发：**
   - 实现项目列表展示，从 Mock API 获取数据。
   - 开发项目详情页，并实现 CRUD 操作。
   - 考虑使用 Angular Signals 管理项目详情的响应式状态。
6. **任务模块开发 (核心功能)：**
   - 搭建看板布局。
   - 集成 Angular CDK Drag and Drop。
   - 实现任务的 CRUD 操作。
   - 深入使用 RxJS 处理任务流转、过滤、排序等。
7. **其他模块：** 逐步实现用户中心、通知等功能。
8. **优化与重构：** 在开发过程中，持续关注代码质量，进行适当重构，例如将模块转换为独立组件，优化 RxJS 使用，应用 OnPush 策略等。

## 8. 项目初始化与Mock后端搭建

### 8.1 使用 Angular CLI 初始化项目

```shell
# 安装最新版 Angular CLI（如未安装）
npm install -g @angular/cli@next
# 创建新项目（建议使用独立组件架构）
ng new angular-jira-clone --standalone --routing --style=scss
# 进入项目目录
cd angular-jira-clone
```

> **注释：**
> - `--standalone`：启用独立组件模式，减少 NgModule 依赖。
> - `--routing`：自动生成路由配置。
> - `--style=scss`：使用 SCSS 作为样式预处理器。

## 9. 核心功能实现清单

### 🔥 高优先级 - 核心业务功能

#### 9.1 看板管理系统 (Kanban Board)
**实现目标**：构建 Jira 风格的任务看板，支持拖拽操作

**功能清单**：
- [ ] 看板页面布局设计（待办、进行中、测试、已完成列）
- [ ] 任务卡片组件（显示标题、负责人、优先级、标签）
- [ ] 使用 Angular CDK 实现拖拽功能
- [ ] 任务状态变更逻辑
- [ ] 看板数据持久化

**技术要点**：
- Angular CDK DragDrop 模块
- Signals 状态管理
- RxJS 处理拖拽事件流

#### 9.2 任务管理 (Task Management)
**实现目标**：完整的任务生命周期管理

**功能清单**：
- [ ] 任务创建表单（标题、描述、优先级、负责人、截止日期）
- [ ] 任务详情弹窗组件
- [ ] 任务编辑功能
- [ ] 任务删除确认
- [ ] 任务筛选器（按状态、负责人、优先级）
- [ ] 任务搜索功能
- [ ] 任务排序（优先级、创建时间、截止日期）

**技术要点**：
- Reactive Forms 表单验证
- Angular Material Dialog
- RxJS 操作符处理筛选和搜索

#### 9.3 项目管理增强
**实现目标**：扩展现有项目功能，支持完整的项目管理

**功能清单**：
- [ ] 项目详情页面设计
- [ ] 项目创建和编辑表单
- [ ] 项目删除功能
- [ ] 项目成员管理（添加/移除成员）
- [ ] 项目任务统计（总数、完成率、进度）
- [ ] 项目设置页面

**技术要点**：
- 路由参数处理
- 组件间通信
- 数据统计计算

### 🚀 中优先级 - 用户体验功能

#### 9.4 用户管理系统
**实现目标**：完善用户相关功能

**功能清单**：
- [ ] 用户个人资料页面
- [ ] 头像上传功能
- [ ] 用户信息编辑
- [ ] 用户列表页面（管理员）
- [ ] 角色权限管理
- [ ] 用户搜索功能

#### 9.5 评论和协作
**实现目标**：增强团队协作能力

**功能清单**：
- [ ] 任务评论组件
- [ ] 评论列表展示
- [ ] @提及功能
- [ ] 活动日志记录
- [ ] 通知系统基础框架

#### 9.6 搜索和过滤
**实现目标**：提升信息查找效率

**功能清单**：
- [ ] 全局搜索组件
- [ ] 高级筛选器
- [ ] 保存的筛选器
- [ ] 快速筛选选项
- [ ] 搜索结果高亮

### 📊 中低优先级 - 数据分析功能

#### 9.7 报表和统计
**功能清单**：
- [ ] 项目进度报表
- [ ] 团队效率分析
- [ ] 任务完成趋势图
- [ ] 工作量统计

#### 9.8 Sprint 管理
**功能清单**：
- [ ] Sprint 创建和管理
- [ ] Sprint 计划页面
- [ ] Sprint 回顾功能
- [ ] 燃尽图实现

### 🎨 低优先级 - 增强功能

#### 9.9 界面和体验优化
**功能清单**：
- [ ] 深色/浅色主题切换
- [ ] 响应式设计优化
- [ ] 快捷键支持
- [ ] 加载状态优化
- [ ] 错误处理优化

#### 9.10 高级功能
**功能清单**：
- [ ] 文件附件上传
- [ ] 时间跟踪功能
- [ ] 自定义字段
- [ ] 工作流配置
- [ ] 数据导出功能

## 10. 实现计划

### 第一阶段：核心看板功能（预计 1-2 周）
1. 看板布局和基础组件
2. 任务卡片设计
3. 拖拽功能实现
4. 基础任务 CRUD

### 第二阶段：任务管理完善（预计 1 周）
1. 任务详情弹窗
2. 筛选和搜索功能
3. 任务表单优化

### 第三阶段：项目管理增强（预计 1 周）
1. 项目详情页
2. 项目成员管理
3. 项目统计功能

### 后续阶段：
按优先级逐步实现用户管理、评论协作、报表统计等功能。

---

**备注**：每个功能实现完成后，都应该编写相应的单元测试，确保代码质量和功能稳定性。


