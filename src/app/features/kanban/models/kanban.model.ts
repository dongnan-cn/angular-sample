import { Task } from './task.model';

/**
 * 看板列接口
 */
export interface KanbanColumn {
  /** 列唯一标识 */
  id: string;
  
  /** 列标题 */
  title: string;
  
  /** 列描述 */
  description?: string;
  
  /** 列颜色（用于UI显示） */
  color?: string;
  
  /** 列在看板中的排序位置 */
  position: number;
  
  /** 列中的任务列表 */
  tasks: Task[];
  
  /** 列的最大任务数量限制（WIP限制） */
  wipLimit?: number;
  
  /** 是否可以拖拽任务到此列 */
  isDroppable: boolean;
  
  /** 是否可以从此列拖拽任务 */
  isDraggable: boolean;
  
  /** 所属看板ID */
  kanbanId: string;
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 看板接口
 */
export interface Kanban {
  /** 看板唯一标识 */
  id: string;
  
  /** 看板名称 */
  name: string;
  
  /** 看板描述 */
  description?: string;
  
  /** 看板列列表 */
  columns: KanbanColumn[];
  
  /** 所属项目ID */
  projectId: string;
  
  /** 看板创建者 */
  createdBy: string;
  
  /** 看板成员ID列表 */
  memberIds: string[];
  
  /** 是否为默认看板 */
  isDefault: boolean;
  
  /** 看板设置 */
  settings: KanbanSettings;
  
  /** 创建时间 */
  createdAt: Date;
  
  /** 更新时间 */
  updatedAt: Date;
}

/**
 * 看板设置接口
 */
export interface KanbanSettings {
  /** 是否启用WIP限制 */
  enableWipLimit: boolean;
  
  /** 是否显示任务计数 */
  showTaskCount: boolean;
  
  /** 是否显示任务优先级 */
  showPriority: boolean;
  
  /** 是否显示任务分配者 */
  showAssignee: boolean;
  
  /** 是否显示任务标签 */
  showLabels: boolean;
  
  /** 是否显示任务截止日期 */
  showDueDate: boolean;
  
  /** 卡片显示模式 */
  cardDisplayMode: 'compact' | 'detailed';
  
  /** 自动刷新间隔（秒） */
  autoRefreshInterval?: number;
}

/**
 * 创建看板列的请求接口
 */
export interface CreateColumnRequest {
  title: string;
  description?: string;
  color?: string;
  position: number;
  wipLimit?: number;
  kanbanId: string;
}

/**
 * 更新看板列的请求接口
 */
export interface UpdateColumnRequest {
  title?: string;
  description?: string;
  color?: string;
  position?: number;
  wipLimit?: number;
  isDroppable?: boolean;
  isDraggable?: boolean;
}

/**
 * 创建看板的请求接口
 */
export interface CreateKanbanRequest {
  name: string;
  description?: string;
  projectId: string;
  memberIds: string[];
  settings?: Partial<KanbanSettings>;
}

/**
 * 更新看板的请求接口
 */
export interface UpdateKanbanRequest {
  name?: string;
  description?: string;
  memberIds?: string[];
  settings?: Partial<KanbanSettings>;
}

/**
 * 拖拽操作接口
 */
export interface DragDropOperation {
  /** 任务ID */
  taskId: string;
  
  /** 源列ID */
  sourceColumnId: string;
  
  /** 目标列ID */
  targetColumnId: string;
  
  /** 源位置索引 */
  sourceIndex: number;
  
  /** 目标位置索引 */
  targetIndex: number;
  
  /** 操作时间戳 */
  timestamp: Date;
}

/**
 * 看板统计信息接口
 */
export interface KanbanStats {
  /** 总任务数 */
  totalTasks: number;
  
  /** 各状态任务数统计 */
  tasksByStatus: Record<string, number>;
  
  /** 各优先级任务数统计 */
  tasksByPriority: Record<string, number>;
  
  /** 各类型任务数统计 */
  tasksByType: Record<string, number>;
  
  /** 逾期任务数 */
  overdueTasks: number;
  
  /** 今日到期任务数 */
  dueTodayTasks: number;
  
  /** 平均完成时间（天） */
  averageCompletionTime?: number;
}

/**
 * 默认看板列配置
 */
export const DEFAULT_KANBAN_COLUMNS: Omit<KanbanColumn, 'id' | 'tasks' | 'kanbanId' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: '待办',
    description: '新创建的任务',
    color: '#f4f5f7',
    position: 0,
    wipLimit: undefined,
    isDroppable: true,
    isDraggable: true
  },
  {
    title: '进行中',
    description: '正在开发的任务',
    color: '#e3fcef',
    position: 1,
    wipLimit: 3,
    isDroppable: true,
    isDraggable: true
  },
  {
    title: '待审核',
    description: '等待代码审核的任务',
    color: '#fff4e6',
    position: 2,
    wipLimit: 2,
    isDroppable: true,
    isDraggable: true
  },
  {
    title: '已完成',
    description: '已完成的任务',
    color: '#e6fcff',
    position: 3,
    wipLimit: undefined,
    isDroppable: true,
    isDraggable: false
  }
];

/**
 * 默认看板设置
 */
export const DEFAULT_KANBAN_SETTINGS: KanbanSettings = {
  enableWipLimit: true,
  showTaskCount: true,
  showPriority: true,
  showAssignee: true,
  showLabels: true,
  showDueDate: true,
  cardDisplayMode: 'detailed',
  autoRefreshInterval: 30
};