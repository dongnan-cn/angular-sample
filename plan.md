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

我们将采用 `angular-in-memory-web-api` 来模拟后端行为，因为它能够模拟完整的 RESTful CRUD 操作，并且服务层代码与真实后端几乎一致，方便后期切换。

**实现步骤：**

1. 安装 angular-in-memory-web-api：
   ```shell
   npm install angular-in-memory-web-api
   ```
2. 创建 InMemoryDataService：实现 `InMemoryDbService` 接口，定义初始的 projects, tasks, users, auth 等集合数据。
3. 在 `createDb()` 方法中初始化 Mock 数据。
4. 实现 `genId()` 方法以支持非数字 ID（如字符串 ID）。
5. 配置 `HttpClientInMemoryWebApiModule`：
   - 在 `app.config.ts` 中，导入并使用：
     ```typescript
     HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, { delay: 500 })
     ```
     // delay 参数用于模拟网络延迟
6. 服务层代码：你的 `ProjectService`, `TaskService`, `AuthService` 等将继续使用 `HttpClient` 发送正常的 HTTP 请求（GET, POST, PUT, DELETE），`angular-in-memory-web-api` 会自动拦截并处理这些请求。
7. JWT 认证模拟：
   - 在 `InMemoryDataService` 中模拟一个 `/authenticate` 端点，接收到正确的用户名/密码时，返回一个硬编码的 Mock JWT 字符串。
   - 前端的 `AuthService` 接收到这个字符串后，将其存储在 `localStorage` 中。
   - 其他请求通过 HTTP 拦截器将这个 Mock JWT 附加到 Authorization 头中，用于模拟后续的认证检查。
8. 数据持久性：每次刷新页面，Mock 数据会重置为 `InMemoryDataService` 中定义的初始状态。

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

### 8.2 安装并配置 angular-in-memory-web-api

```shell
npm install angular-in-memory-web-api --save
```

### 8.3 创建 InMemoryDataService

1. 在 `src/app/core/services/` 目录下新建 `in-memory-data.service.ts` 文件：
2. 实现 `InMemoryDbService` 接口，定义初始的 users、projects、tasks、auth 等集合数据。
3. 实现 `createDb()` 方法，返回初始数据对象。
4. 可选：实现 `genId()` 方法，支持自定义ID生成。

```typescript
// src/app/core/services/in-memory-data.service.ts
import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InMemoryDataService implements InMemoryDbService {
  createDb() {
    // 这里定义初始的 mock 数据
    const users = [
      { id: 1, username: 'admin', password: 'admin', role: 'admin' },
      { id: 2, username: 'user', password: 'user', role: 'user' }
    ];
    const projects = [];
    const tasks = [];
    return { users, projects, tasks };
  }
  // 可选：自定义ID生成逻辑
  genId<T extends { id: any }>(collection: T[]): any {
    return collection.length > 0 ? Math.max(...collection.map(item => +item.id)) + 1 : 1;
  }
}
```

### 8.4 配置 HttpClientInMemoryWebApiModule

1. 在 `app.config.ts` 或 `app.module.ts` 中引入并配置：

```typescript
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
import { InMemoryDataService } from './core/services/in-memory-data.service';

// ...
imports: [
  // ... 其他模块
  HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, { delay: 500 }) // 模拟网络延迟
]
```

### 8.5 测试基础 HTTP 请求

- 使用 Angular 的 HttpClient 在服务中发起 GET/POST/PUT/DELETE 请求，确认 Mock API 能正常返回数据。
- 可在 `app.component.ts` 或新建一个 service 进行简单测试。

### 8.6 目录结构建议

```text
src/app/
├── core/
│   └── services/
│       └── in-memory-data.service.ts
├── app.config.ts 或 app.module.ts
└── ...
```

> **注释：**
> - 建议将 Mock 服务放在 core/services 目录，便于统一管理。
> - 后续可根据实际业务扩展 mock 数据结构。
