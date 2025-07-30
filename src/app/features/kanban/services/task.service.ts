import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, tap, catchError, of } from 'rxjs';
import {
  Task,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilter,
  TaskSort,
  TaskStatus,
  TaskPriority,
  TaskType
} from '../models/task.model';

/**
 * 任务服务
 * 负责任务的CRUD操作、状态管理、过滤排序等功能
 */
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/tasks';

  // 使用 Angular 19 的 signal 进行状态管理
  private readonly _tasks = signal<Task[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // 公开的只读信号
  readonly tasks = this._tasks.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  // 过滤和排序状态
  private readonly _currentFilter = signal<TaskFilter>({});
  private readonly _currentSort = signal<TaskSort>({ field: 'createdAt', direction: 'desc' });

  readonly currentFilter = this._currentFilter.asReadonly();
  readonly currentSort = this._currentSort.asReadonly();

  /**
   * 获取所有任务
   */
  loadTasks(projectId?: string): Observable<Task[]> {
    this._loading.set(true);
    this._error.set(null);

    const url = projectId ? `${this.baseUrl}?projectId=${projectId}` : this.baseUrl;

    return this.http.get<Task[]>(url).pipe(
      tap(tasks => {
        this._tasks.set(tasks);
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set('加载任务失败');
        this._loading.set(false);
        console.error('Error loading tasks:', error);
        return of([]);
      })
    );
  }

  /**
   * 根据ID获取单个任务
   */
  getTaskById(id: string): Observable<Task | null> {
    return this.http.get<Task>(`${this.baseUrl}/${id}`).pipe(
      catchError(error => {
        console.error('Error loading task:', error);
        return of(null);
      })
    );
  }

  /**
   * 创建新任务
   */
  createTask(request: CreateTaskRequest): Observable<Task> {
    this._loading.set(true);
    this._error.set(null);

    const newTask: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'comments'> = {
      title: request.title,
      description: request.description,
      status: TaskStatus.TODO,
      priority: request.priority,
      type: request.type,
      assignee: undefined, // 需要根据 assigneeId 查询用户信息
      reporter: { id: request.reporterId, name: '', email: '' }, // 需要根据 reporterId 查询用户信息
      labels: [], // 需要根据 labelIds 查询标签信息
      estimatedHours: request.estimatedHours,
      actualHours: 0,
      dueDate: request.dueDate,
      projectId: request.projectId,
      columnId: request.columnId,
      position: this.getNextPosition(request.columnId)
    };

    return this.http.post<Task>(this.baseUrl, newTask).pipe(
      tap(task => {
        const currentTasks = this._tasks();
        this._tasks.set([...currentTasks, task]);
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set('创建任务失败');
        this._loading.set(false);
        console.error('Error creating task:', error);
        throw error;
      })
    );
  }

  /**
   * 更新任务
   */
  updateTask(id: string, request: UpdateTaskRequest): Observable<Task> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.patch<Task>(`${this.baseUrl}/${id}`, request).pipe(
      tap(updatedTask => {
        const currentTasks = this._tasks();
        const index = currentTasks.findIndex(task => task.id === id);
        if (index !== -1) {
          const newTasks = [...currentTasks];
          newTasks[index] = updatedTask;
          this._tasks.set(newTasks);
        }
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set('更新任务失败');
        this._loading.set(false);
        console.error('Error updating task:', error);
        throw error;
      })
    );
  }

  /**
   * 删除任务
   */
  deleteTask(id: string): Observable<void> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
        const currentTasks = this._tasks();
        this._tasks.set(currentTasks.filter(task => task.id !== id));
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set('删除任务失败');
        this._loading.set(false);
        console.error('Error deleting task:', error);
        throw error;
      })
    );
  }

  /**
   * 移动任务到不同的列
   */
  moveTask(taskId: string, targetColumnId: string, targetPosition: number): Observable<Task> {
    const updateRequest: UpdateTaskRequest = {
      columnId: targetColumnId,
      position: targetPosition,
      status: this.getStatusByColumnId(targetColumnId)
    };

    return this.updateTask(taskId, updateRequest);
  }

  /**
   * 批量更新任务位置（用于拖拽重排序）
   */
  updateTaskPositions(updates: { id: string; position: number; columnId?: string }[]): Observable<Task[]> {
    this._loading.set(true);
    this._error.set(null);

    return this.http.patch<Task[]>(`${this.baseUrl}/batch-update-positions`, { updates }).pipe(
      tap(updatedTasks => {
        const currentTasks = this._tasks();
        const newTasks = currentTasks.map(task => {
          const update = updatedTasks.find(updated => updated.id === task.id);
          return update || task;
        });
        this._tasks.set(newTasks);
        this._loading.set(false);
      }),
      catchError(error => {
        this._error.set('更新任务位置失败');
        this._loading.set(false);
        console.error('Error updating task positions:', error);
        throw error;
      })
    );
  }

  /**
   * 设置任务过滤条件
   */
  setFilter(filter: TaskFilter): void {
    this._currentFilter.set(filter);
  }

  /**
   * 设置任务排序
   */
  setSort(sort: TaskSort): void {
    this._currentSort.set(sort);
  }

  /**
   * 获取过滤后的任务
   */
  getFilteredTasks(): Task[] {
    const tasks = this._tasks();
    const filter = this._currentFilter();
    const sort = this._currentSort();

    let filteredTasks = tasks;

    // 应用过滤条件
    if (filter.status && filter.status.length > 0) {
      filteredTasks = filteredTasks.filter(task => filter.status!.includes(task.status));
    }

    if (filter.priority && filter.priority.length > 0) {
      filteredTasks = filteredTasks.filter(task => filter.priority!.includes(task.priority));
    }

    if (filter.type && filter.type.length > 0) {
      filteredTasks = filteredTasks.filter(task => filter.type!.includes(task.type));
    }

    if (filter.assigneeIds && filter.assigneeIds.length > 0) {
      filteredTasks = filteredTasks.filter(task => 
        task.assignee && filter.assigneeIds!.includes(task.assignee.id)
      );
    }

    if (filter.projectId) {
      filteredTasks = filteredTasks.filter(task => task.projectId === filter.projectId);
    }

    if (filter.searchText) {
      const searchText = filter.searchText.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title.toLowerCase().includes(searchText) ||
        (task.description && task.description.toLowerCase().includes(searchText))
      );
    }

    // 应用排序
    filteredTasks.sort((a, b) => {
      const aValue = this.getTaskSortValue(a, sort.field);
      const bValue = this.getTaskSortValue(b, sort.field);
      
      if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return filteredTasks;
  }

  /**
   * 根据列ID获取任务
   */
  getTasksByColumnId(columnId: string): Task[] {
    return this.getFilteredTasks()
      .filter(task => task.columnId === columnId)
      .sort((a, b) => a.position - b.position);
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
    this._tasks.set([]);
    this._loading.set(false);
    this._error.set(null);
    this._currentFilter.set({});
    this._currentSort.set({ field: 'createdAt', direction: 'desc' });
  }

  // 私有辅助方法

  /**
   * 获取列中下一个任务的位置
   */
  private getNextPosition(columnId: string): number {
    const tasksInColumn = this.getTasksByColumnId(columnId);
    return tasksInColumn.length > 0 
      ? Math.max(...tasksInColumn.map(task => task.position)) + 1 
      : 0;
  }

  /**
   * 根据列ID获取对应的任务状态
   */
  private getStatusByColumnId(columnId: string): TaskStatus {
    // 这里可以根据实际的列配置来映射状态
    // 暂时使用简单的映射逻辑
    switch (columnId) {
      case 'todo': return TaskStatus.TODO;
      case 'in-progress': return TaskStatus.IN_PROGRESS;
      case 'review': return TaskStatus.REVIEW;
      case 'done': return TaskStatus.DONE;
      default: return TaskStatus.TODO;
    }
  }

  /**
   * 获取任务排序字段的值
   */
  private getTaskSortValue(task: Task, field: TaskSort['field']): any {
    switch (field) {
      case 'createdAt': return new Date(task.createdAt).getTime();
      case 'updatedAt': return new Date(task.updatedAt).getTime();
      case 'dueDate': return task.dueDate ? new Date(task.dueDate).getTime() : 0;
      case 'priority': return this.getPriorityWeight(task.priority);
      case 'title': return task.title.toLowerCase();
      default: return 0;
    }
  }

  /**
   * 获取优先级权重（用于排序）
   */
  private getPriorityWeight(priority: TaskPriority): number {
    switch (priority) {
      case TaskPriority.URGENT: return 4;
      case TaskPriority.HIGH: return 3;
      case TaskPriority.MEDIUM: return 2;
      case TaskPriority.LOW: return 1;
      default: return 0;
    }
  }
}