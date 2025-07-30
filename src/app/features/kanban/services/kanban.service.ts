import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap, catchError, of, forkJoin } from 'rxjs';
import {
  Kanban,
  KanbanColumn,
  CreateKanbanRequest,
  UpdateKanbanRequest,
  CreateColumnRequest,
  UpdateColumnRequest,
  DragDropOperation,
  KanbanStats,
  DEFAULT_KANBAN_COLUMNS,
  DEFAULT_KANBAN_SETTINGS
} from '../models/kanban.model';
import { TaskService } from './task.service';
import { Task, TaskStatus } from '../models/task.model';

/**
 * 看板服务
 * 负责看板和看板列的管理、拖拽操作、统计数据等功能
 */
@Injectable({
  providedIn: 'root'
})
export class KanbanService {
  private readonly http = inject(HttpClient);
  private readonly taskService = inject(TaskService);
  private readonly baseUrl = '/api/kanbans';
  private readonly columnsUrl = '/api/kanban-columns';

  // 使用 Angular 19 的 signal 进行状态管理
  private readonly _currentKanban = signal<Kanban | null>(null);
  private readonly _kanbans = signal<Kanban[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // 公开的只读信号
  readonly currentKanban = this._currentKanban.asReadonly();
  readonly kanbans = this._kanbans.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // 计算属性：当前看板的列
  readonly currentColumns = computed(() => {
    const kanban = this._currentKanban();
    return kanban ? kanban.columns.sort((a, b) => a.position - b.position) : [];
  });

  // 计算属性：看板统计信息
  readonly kanbanStats = computed(() => {
    const kanban = this._currentKanban();
    const tasks = this.taskService.tasks();
    
    if (!kanban || tasks.length === 0) {
      return this.getEmptyStats();
    }

    return this.calculateStats(tasks.filter(task => task.projectId === kanban.projectId));
  });

  /**
   * 获取项目的所有看板
   */
  loadKanbansByProject(projectId: string): Observable<Kanban[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<Kanban[]>(`${this.baseUrl}?projectId=${projectId}`).pipe(
      tap(kanbans => {
        this._kanbans.set(kanbans);
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set('加载看板失败');
        this._loading.set(false);
        console.error('Error loading kanbans:', error);
        return of([]);
      })
    );
  }

  /**
   * 根据ID获取看板详情
   */
  loadKanbanById(id: string): Observable<Kanban | null> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.get<Kanban>(`${this.baseUrl}/${id}`).pipe(
      tap(kanban => {
        this._currentKanban.set(kanban);
        this._loading.set(false);
        // 同时加载该看板项目的任务
        this.taskService.loadTasks(kanban.projectId).subscribe();
      }),
      catchError(error => {
        this._error.set('加载看板详情失败');
        this._loading.set(false);
        console.error('Error loading kanban:', error);
        return of(null);
      })
    );
  }

  /**
   * 创建新看板
   */
  createKanban(request: CreateKanbanRequest): Observable<Kanban> {
    this._loading.set(true);
    this._error.set(null);

    const newKanban: Omit<Kanban, 'id' | 'columns' | 'createdAt' | 'updatedAt'> = {
      name: request.name,
      description: request.description,
      projectId: request.projectId,
      createdBy: '', // 需要从当前用户获取
      memberIds: request.memberIds,
      isDefault: false,
      settings: { ...DEFAULT_KANBAN_SETTINGS, ...request.settings }
    };

    return this.http.post<Kanban>(this.baseUrl, newKanban).pipe(
      tap(kanban => {
        // 创建默认列
        this.createDefaultColumns(kanban.id).subscribe(() => {
          const currentKanbans = this._kanbans();
          this._kanbans.set([...currentKanbans, kanban]);
          this._loading.set(false);
        });
      }),
      catchError(error => {
        this._error.set('创建看板失败');
        this._loading.set(false);
        console.error('Error creating kanban:', error);
        throw error;
      })
    );
  }

  /**
   * 更新看板
   */
  updateKanban(id: string, request: UpdateKanbanRequest): Observable<Kanban> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.patch<Kanban>(`${this.baseUrl}/${id}`, request).pipe(
      tap(updatedKanban => {
        // 更新当前看板
        if (this._currentKanban()?.id === id) {
          this._currentKanban.set(updatedKanban);
        }
        
        // 更新看板列表
        const currentKanbans = this._kanbans();
        const index = currentKanbans.findIndex(kanban => kanban.id === id);
        if (index !== -1) {
          const newKanbans = [...currentKanbans];
          newKanbans[index] = updatedKanban;
          this._kanbans.set(newKanbans);
        }
        
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set('更新看板失败');
        this._loading.set(false);
        console.error('Error updating kanban:', error);
        throw error;
      })
    );
  }

  /**
   * 删除看板
   */
  deleteKanban(id: string): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        // 如果删除的是当前看板，清空当前看板
        if (this._currentKanban()?.id === id) {
          this._currentKanban.set(null);
        }
        
        // 从看板列表中移除
        const currentKanbans = this._kanbans();
        this._kanbans.set(currentKanbans.filter(kanban => kanban.id !== id));
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set('删除看板失败');
        this._loading.set(false);
        console.error('Error deleting kanban:', error);
        throw error;
      })
    );
  }

  /**
   * 创建看板列
   */
  createColumn(request: CreateColumnRequest): Observable<KanbanColumn> {
    this._loading.set(true);
    this._error.set(null);

    const newColumn: Omit<KanbanColumn, 'id' | 'tasks' | 'createdAt' | 'updatedAt'> = {
      title: request.title,
      description: request.description,
      color: request.color || '#f4f5f7',
      position: request.position,
      wipLimit: request.wipLimit,
      isDroppable: true,
      isDraggable: true,
      kanbanId: request.kanbanId
    };

    return this.http.post<KanbanColumn>(this.columnsUrl, newColumn).pipe(
      tap(column => {
        // 更新当前看板的列
        const currentKanban = this._currentKanban();
        if (currentKanban && currentKanban.id === request.kanbanId) {
          const updatedKanban = {
            ...currentKanban,
            columns: [...currentKanban.columns, column]
          };
          this._currentKanban.set(updatedKanban);
        }
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set('创建看板列失败');
        this._loading.set(false);
        console.error('Error creating column:', error);
        throw error;
      })
    );
  }

  /**
   * 更新看板列
   */
  updateColumn(id: string, request: UpdateColumnRequest): Observable<KanbanColumn> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.patch<KanbanColumn>(`${this.columnsUrl}/${id}`, request).pipe(
      tap(updatedColumn => {
        // 更新当前看板的列
        const currentKanban = this._currentKanban();
        if (currentKanban) {
          const columnIndex = currentKanban.columns.findIndex(col => col.id === id);
          if (columnIndex !== -1) {
            const updatedColumns = [...currentKanban.columns];
            updatedColumns[columnIndex] = updatedColumn;
            const updatedKanban = {
              ...currentKanban,
              columns: updatedColumns
            };
            this._currentKanban.set(updatedKanban);
          }
        }
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set('更新看板列失败');
        this._loading.set(false);
        console.error('Error updating column:', error);
        throw error;
      })
    );
  }

  /**
   * 删除看板列
   */
  deleteColumn(id: string): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.delete<void>(`${this.columnsUrl}/${id}`).pipe(
      tap(() => {
        // 从当前看板中移除列
        const currentKanban = this._currentKanban();
        if (currentKanban) {
          const updatedColumns = currentKanban.columns.filter(col => col.id !== id);
          const updatedKanban = {
            ...currentKanban,
            columns: updatedColumns
          };
          this._currentKanban.set(updatedKanban);
        }
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set('删除看板列失败');
        this._loading.set(false);
        console.error('Error deleting column:', error);
        throw error;
      })
    );
  }

  /**
   * 处理拖拽操作
   */
  handleDragDrop(operation: DragDropOperation): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    // 如果是同一列内的重排序
    if (operation.sourceColumnId === operation.targetColumnId) {
      return this.reorderTasksInColumn(operation);
    } else {
      // 跨列移动
      return this.moveTaskBetweenColumns(operation);
    }
  }

  /**
   * 获取列中的任务（包含实时任务数据）
   */
  getColumnTasks(columnId: string): Task[] {
    return this.taskService.getTasksByColumnId(columnId);
  }

  /**
   * 检查WIP限制
   */
  checkWipLimit(columnId: string, additionalTasks: number = 0): boolean {
    const column = this.currentColumns().find(col => col.id === columnId);
    if (!column || !column.wipLimit) {
      return true; // 没有WIP限制
    }

    const currentTaskCount = this.getColumnTasks(columnId).length;
    return (currentTaskCount + additionalTasks) <= column.wipLimit;
  }

  /**
   * 设置当前看板
   */
  setCurrentKanban(kanban: Kanban): void {
    this._currentKanban.set(kanban);
  }

  /**
   * 清除错误状态
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * 重置服务状态
   */
  reset(): void {
    this._currentKanban.set(null);
    this._kanbans.set([]);
    this._loading.set(false);
    this._error.set(null);
  }

  // 私有辅助方法

  /**
   * 创建默认看板列
   */
  private createDefaultColumns(kanbanId: string): Observable<KanbanColumn[]> {
    const columnRequests = DEFAULT_KANBAN_COLUMNS.map(columnConfig => ({
      ...columnConfig,
      kanbanId
    }));

    const createRequests = columnRequests.map(request => 
      this.http.post<KanbanColumn>(this.columnsUrl, request)
    );

    return forkJoin(createRequests);
  }

  /**
   * 列内任务重排序
   */
  private reorderTasksInColumn(operation: DragDropOperation): Observable<void> {
    const tasks = this.getColumnTasks(operation.sourceColumnId);
    const updates = tasks.map((task, index) => ({
      id: task.id,
      position: index === operation.sourceIndex ? operation.targetIndex : 
                index > operation.sourceIndex && index <= operation.targetIndex ? index - 1 :
                index < operation.sourceIndex && index >= operation.targetIndex ? index + 1 : index,
      columnId: operation.sourceColumnId
    }));

    return this.taskService.updateTaskPositions(updates).pipe(
      tap(() => this._loading.set(false)),
      map(() => void 0),
      catchError(error => {
        this._error.set('重排序任务失败');
        this._loading.set(false);
        console.error('Error reordering tasks:', error);
        throw error;
      })
    );
  }

  /**
   * 跨列移动任务
   */
  private moveTaskBetweenColumns(operation: DragDropOperation): Observable<void> {
    // 检查目标列的WIP限制
    if (!this.checkWipLimit(operation.targetColumnId, 1)) {
      this._error.set('目标列已达到WIP限制');
      this._loading.set(false);
      return of(void 0);
    }

    return this.taskService.moveTask(
      operation.taskId,
      operation.targetColumnId,
      operation.targetIndex
    ).pipe(
      tap(() => this._loading.set(false)),
      map(() => void 0),
      catchError(error => {
        this._error.set('移动任务失败');
        this._loading.set(false);
        console.error('Error moving task:', error);
        throw error;
      })
    );
  }

  /**
   * 计算看板统计信息
   */
  private calculateStats(tasks: Task[]): KanbanStats {
    const totalTasks = tasks.length;
    
    const tasksByStatus = tasks.reduce((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tasksByPriority = tasks.reduce((acc, task) => {
      acc[task.priority] = (acc[task.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const tasksByType = tasks.reduce((acc, task) => {
      acc[task.type] = (acc[task.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const overdueTasks = tasks.filter(task => 
      task.dueDate && new Date(task.dueDate) < today
    ).length;

    const dueTodayTasks = tasks.filter(task => 
      task.dueDate && 
      new Date(task.dueDate) >= today && 
      new Date(task.dueDate) < tomorrow
    ).length;

    return {
      totalTasks,
      tasksByStatus,
      tasksByPriority,
      tasksByType,
      overdueTasks,
      dueTodayTasks,
      averageCompletionTime: this.calculateAverageCompletionTime(tasks)
    };
  }

  /**
   * 计算平均完成时间
   */
  private calculateAverageCompletionTime(tasks: Task[]): number | undefined {
    const completedTasks = tasks.filter(task => task.status === TaskStatus.DONE);
    
    if (completedTasks.length === 0) {
      return undefined;
    }

    const totalDays = completedTasks.reduce((sum, task) => {
      const created = new Date(task.createdAt);
      const updated = new Date(task.updatedAt);
      const days = Math.ceil((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      return sum + days;
    }, 0);

    return Math.round(totalDays / completedTasks.length * 10) / 10;
  }

  /**
   * 获取空的统计信息
   */
  private getEmptyStats(): KanbanStats {
    return {
      totalTasks: 0,
      tasksByStatus: {},
      tasksByPriority: {},
      tasksByType: {},
      overdueTasks: 0,
      dueTodayTasks: 0,
      averageCompletionTime: undefined
    };
  }
}