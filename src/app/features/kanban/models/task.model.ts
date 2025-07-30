/**
 * 任务优先级枚举
 */
export enum TaskPriority {
  LOWEST = 'LOWEST',
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  HIGHEST = 'HIGHEST'
}

/**
 * 任务状态枚举
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  REVIEW = 'review',
  DONE = 'done'
}

/**
 * 任务类型枚举
 */
export enum TaskType {
  STORY = 'story',
  BUG = 'bug',
  TASK = 'task',
  EPIC = 'epic'
}

/**
 * 任务分配者接口
 */
export interface TaskAssignee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * 任务标签接口
 */
export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

/**
 * 任务评论接口
 */
export interface TaskComment {
  id: string;
  content: string;
  author: TaskAssignee;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * 任务模型接口
 */
export interface Task {
  /** 任务唯一标识 */
  id: string;
  
  /** 任务标题 */
  title: string;
  
  /** 任务描述 */
  description?: string;
  
  /** 任务状态 */
  status: TaskStatus;
  
  /** 任务优先级 */
  priority: TaskPriority;
  
  /** 任务类型 */
  type: TaskType;
  
  /** 任务分配者 */
  assignee?: TaskAssignee;
  
  /** 任务创建者 */
  reporter: TaskAssignee;
  
  /** 任务标签 */
  labels: TaskLabel[];
  
  /** 预估工时（小时） */
  estimatedHours?: number;
  
  /** 实际工时（小时） */
  actualHours?: number;
  
  /** 截止日期 */
  dueDate?: string;
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 更新时间 */
  updatedAt: Date;
  
  /** 任务评论 */
  comments: TaskComment[];
  
  /** 所属项目ID */
  projectId: string;
  
  /** 所属看板列ID */
  columnId: string;
  
  /** 在列中的排序位置 */
  position: number;
}

/**
 * 创建任务请求接口
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority: TaskPriority;
  type: TaskType;
  assigneeId?: string;
  reporterId: string;
  labelIds?: string[];
  estimatedHours?: number;
  dueDate?: string;
  projectId: string;
  columnId: string;
}

/**
 * 更新任务的请求接口
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  assigneeId?: string;
  labelIds?: string[];
  estimatedHours?: number;
  actualHours?: number;
  dueDate?: string;
  columnId?: string;
  position?: number;
}

/**
 * 任务过滤条件接口
 */
export interface TaskFilter {
  status?: TaskStatus[];
  priority?: TaskPriority[];
  type?: TaskType[];
  assigneeIds?: string[];
  labelIds?: string[];
  projectId?: string;
  searchText?: string;
}

/**
 * 任务排序选项
 */
export interface TaskSort {
  field: 'createdAt' | 'updatedAt' | 'priority' | 'dueDate' | 'title';
  direction: 'asc' | 'desc';
}