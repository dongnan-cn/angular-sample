import { Component, Input, Output, EventEmitter, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';
import { Kanban, KanbanColumn } from '../../models/kanban.model';
import { Task, CreateTaskRequest, UpdateTaskRequest } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { KanbanService } from '../../services/kanban.service';

/**
 * 看板面板组件
 * 管理整个看板的显示、任务拖拽、列管理等功能
 */
@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    KanbanColumnComponent
  ],
  template: `
    <div class="kanban-board">
      <!-- 看板头部工具栏 -->
      <mat-toolbar class="board-toolbar">
        <div class="toolbar-content">
          <div class="board-info">
            <h2 class="board-title">{{ kanban()?.name || '看板' }}</h2>
          <span class="board-description" *ngIf="kanban()?.description">
            {{ kanban()?.description }}
          </span>
          </div>
          
          <div class="toolbar-actions">
            <!-- 过滤和排序菜单 -->
            <button mat-icon-button [matMenuTriggerFor]="filterMenu">
              <mat-icon>filter_list</mat-icon>
            </button>
            
            <mat-menu #filterMenu="matMenu">
              <button mat-menu-item (click)="onFilterByAssignee()">
                <mat-icon>person</mat-icon>
                <span>按分配者过滤</span>
              </button>
              <button mat-menu-item (click)="onFilterByPriority()">
                <mat-icon>priority_high</mat-icon>
                <span>按优先级过滤</span>
              </button>
              <button mat-menu-item (click)="onClearFilters()">
                <mat-icon>clear</mat-icon>
                <span>清除过滤</span>
              </button>
            </mat-menu>
            
            <!-- 看板设置菜单 -->
            <button mat-icon-button [matMenuTriggerFor]="settingsMenu">
              <mat-icon>settings</mat-icon>
            </button>
            
            <mat-menu #settingsMenu="matMenu">
              <button mat-menu-item (click)="onAddColumn()">
                <mat-icon>add</mat-icon>
                <span>添加列</span>
              </button>
              <button mat-menu-item (click)="onEditBoard()">
                <mat-icon>edit</mat-icon>
                <span>编辑看板</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="onBoardSettings()">
                <mat-icon>tune</mat-icon>
                <span>看板设置</span>
              </button>
            </mat-menu>
            
            <!-- 刷新按钮 -->
            <button mat-icon-button (click)="onRefresh()" [disabled]="loading()">
              <mat-icon>refresh</mat-icon>
            </button>
          </div>
        </div>
      </mat-toolbar>
      
      <!-- 加载状态 -->
      <div class="loading-container" *ngIf="loading()">
        <mat-spinner diameter="40"></mat-spinner>
        <p>加载中...</p>
      </div>
      
      <!-- 看板列容器 -->
      <div class="board-container" *ngIf="!loading()">
        <div class="columns-wrapper">
          <app-kanban-column
            *ngFor="let column of columns(); trackBy: trackByColumnId"
            [column]="column"
            [tasks]="getTasksByColumnId(column.id)"
            [selectedTaskId]="selectedTaskId()"
            [connectedDropLists]="getConnectedDropLists()"
            (taskClick)="onTaskClick($event)"
            (taskEdit)="onTaskEdit($event)"
            (taskDelete)="onTaskDelete($event)"
            (taskDrop)="onTaskDrop($event)"
            (addTask)="onAddTask($event)"
            (editColumn)="onEditColumn($event)"
            (deleteColumn)="onDeleteColumn($event)">
          </app-kanban-column>
          
          <!-- 添加列按钮 -->
          <div class="add-column-container">
            <button mat-stroked-button (click)="onAddColumn()" class="add-column-btn">
              <mat-icon>add</mat-icon>
              添加列
            </button>
          </div>
        </div>
      </div>
      
      <!-- 空状态 -->
      <div class="empty-board" *ngIf="!loading() && columns().length === 0">
        <mat-icon class="empty-icon">view_kanban</mat-icon>
        <h3>看板为空</h3>
        <p>开始创建您的第一个列来组织任务</p>
        <button mat-raised-button color="primary" (click)="onAddColumn()">
          <mat-icon>add</mat-icon>
          创建列
        </button>
      </div>
    </div>
  `,
  styles: [`
    .kanban-board {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: #fafafa;
    }
    
    .board-toolbar {
      background-color: white;
      color: #333;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 10;
    }
    
    .toolbar-content {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .board-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    
    .board-title {
      margin: 0;
      font-size: 20px;
      font-weight: 500;
    }
    
    .board-description {
      font-size: 14px;
      color: #666;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .toolbar-actions {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      gap: 16px;
      color: #666;
    }
    
    .board-container {
      flex: 1;
      overflow: hidden;
      padding: 16px;
    }
    
    .columns-wrapper {
      display: flex;
      height: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 16px;
    }
    
    .add-column-container {
      display: flex;
      align-items: flex-start;
      padding-top: 16px;
    }
    
    .add-column-btn {
      min-width: 200px;
      height: 48px;
      border: 2px dashed #ccc;
      color: #666;
      background-color: transparent;
    }
    
    .add-column-btn:hover {
      border-color: #1976d2;
      color: #1976d2;
      background-color: #f3f7ff;
    }
    
    .empty-board {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      text-align: center;
      color: #666;
      padding: 32px;
    }
    
    .empty-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    .empty-board h3 {
      margin: 0 0 8px 0;
      font-size: 24px;
      font-weight: 400;
    }
    
    .empty-board p {
      margin: 0 0 24px 0;
      font-size: 16px;
      max-width: 400px;
    }
    
    /* 滚动条样式 */
    .columns-wrapper::-webkit-scrollbar {
      height: 8px;
    }
    
    .columns-wrapper::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    
    .columns-wrapper::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 4px;
    }
    
    .columns-wrapper::-webkit-scrollbar-thumb:hover {
      background: #999;
    }
    
    /* 响应式设计 */
    @media (max-width: 768px) {
      .board-toolbar {
        padding: 0 8px;
      }
      
      .toolbar-content {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
      }
      
      .board-title {
        font-size: 18px;
      }
      
      .board-container {
        padding: 8px;
      }
      
      .add-column-btn {
        min-width: 150px;
      }
    }
  `]
})
export class KanbanBoardComponent implements OnInit {
  @Input() kanbanId: string | null = null;
  @Input() projectId: string | null = null;
  
  @Output() taskSelected = new EventEmitter<Task>();
  @Output() boardUpdated = new EventEmitter<Kanban>();
  
  private readonly taskService = inject(TaskService);
  private readonly kanbanService = inject(KanbanService);
  private readonly snackBar = inject(MatSnackBar);
  
  // 响应式状态管理
  readonly loading = signal<boolean>(false);
  readonly kanban = signal<Kanban | null>(null);
  readonly selectedTaskId = signal<string | null>(null);
  
  // 计算属性
  readonly columns = computed(() => this.kanban()?.columns || []);
  readonly tasks = this.taskService.tasks;
  
  ngOnInit(): void {
    this.loadBoard();
  }
  
  /**
   * 加载看板数据
   */
  async loadBoard(): Promise<void> {
    if (!this.kanbanId && !this.projectId) {
      this.showMessage('缺少看板ID或项目ID');
      return;
    }
    
    this.loading.set(true);
    
    try {
      // 加载看板信息
      if (this.kanbanId) {
        this.kanbanService.loadKanbanById(this.kanbanId).subscribe({
          next: (kanban: Kanban | null) => {
            if (kanban) {
              this.kanban.set(kanban);
              this.loadTasks();
            } else {
              this.loading.set(false);
            }
          },
          error: (error: any) => {
            console.error('加载看板失败:', error);
            this.showMessage('加载看板失败');
            this.loading.set(false);
          }
        });
      } else if (this.projectId) {
        // 如果只有项目ID，加载项目的默认看板
        this.kanbanService.loadKanbansByProject(this.projectId).subscribe({
          next: (kanbans: Kanban[]) => {
            const defaultKanban = kanbans[0]; // 取第一个看板作为默认
            if (defaultKanban) {
              this.kanban.set(defaultKanban);
              this.loadTasks();
            } else {
              this.loading.set(false);
            }
          },
          error: (error: any) => {
            console.error('加载项目看板失败:', error);
            this.showMessage('加载项目看板失败');
            this.loading.set(false);
          }
        });
      }
    } catch (error) {
      console.error('加载看板数据失败:', error);
      this.showMessage('加载看板数据失败');
      this.loading.set(false);
    }
  }
  
  /**
   * 加载任务数据
   */
  private loadTasks(): void {
    const currentKanban = this.kanban();
    if (!currentKanban) return;
    
    this.taskService.loadTasks(currentKanban.projectId).subscribe({
      next: () => {
        this.loading.set(false);
      },
      error: (error: any) => {
        console.error('加载任务失败:', error);
        this.showMessage('加载任务失败');
        this.loading.set(false);
      }
    });
  }
  
  /**
   * 根据列ID获取任务
   */
  getTasksByColumnId(columnId: string): Task[] {
    return this.taskService.getTasksByColumnId(columnId);
  }
  
  /**
   * 获取连接的拖拽列表ID
   */
  getConnectedDropLists(): string[] {
    return this.columns().map(col => col.id);
  }
  
  /**
   * 任务点击事件
   */
  onTaskClick(task: Task): void {
    this.selectedTaskId.set(task.id);
    this.taskSelected.emit(task);
  }
  
  /**
   * 任务编辑事件
   */
  onTaskEdit(task: Task): void {
    // TODO: 打开任务编辑对话框
    console.log('编辑任务:', task);
  }
  
  /**
   * 任务删除事件
   */
  onTaskDelete(task: Task): void {
    if (confirm(`确定要删除任务 "${task.title}" 吗？`)) {
      this.taskService.deleteTask(task.id).subscribe({
        next: () => {
          this.showMessage('任务删除成功');
        },
        error: (error: any) => {
          console.error('删除任务失败:', error);
          this.showMessage('删除任务失败');
        }
      });
    }
  }
  
  /**
   * 任务拖拽放置事件
   */
  onTaskDrop(event: CdkDragDrop<Task[]>): void {
    if (event.previousContainer === event.container) {
      // 同一列内移动
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      // 跨列移动
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // 更新任务的列ID和位置
      const task = event.container.data[event.currentIndex];
      const targetColumnId = this.getColumnIdFromDropList(event.container.id);
      
      if (targetColumnId && task) {
        this.taskService.moveTask(task.id, targetColumnId, event.currentIndex).subscribe({
          next: () => {
            this.showMessage('任务移动成功');
          },
          error: (error: any) => {
            console.error('移动任务失败:', error);
            this.showMessage('移动任务失败');
            // 回滚操作
            transferArrayItem(
              event.container.data,
              event.previousContainer.data,
              event.currentIndex,
              event.previousIndex
            );
          }
        });
      }
    }
  }
  
  /**
   * 添加任务事件
   */
  onAddTask(columnId: string): void {
    // TODO: 打开添加任务对话框
    console.log('添加任务到列:', columnId);
  }
  
  /**
   * 编辑列事件
   */
  onEditColumn(column: KanbanColumn): void {
    // TODO: 打开编辑列对话框
    console.log('编辑列:', column);
  }
  
  /**
   * 删除列事件
   */
  onDeleteColumn(column: KanbanColumn): void {
    if (confirm(`确定要删除列 "${column.title}" 吗？此操作将删除列中的所有任务。`)) {
      // TODO: 实现删除列功能
      console.log('删除列:', column);
    }
  }
  
  /**
   * 添加列事件
   */
  onAddColumn(): void {
    // TODO: 打开添加列对话框
    console.log('添加新列');
  }
  
  /**
   * 编辑看板事件
   */
  onEditBoard(): void {
    // TODO: 打开编辑看板对话框
    console.log('编辑看板');
  }
  
  /**
   * 看板设置事件
   */
  onBoardSettings(): void {
    // TODO: 打开看板设置对话框
    console.log('看板设置');
  }
  
  /**
   * 过滤相关事件
   */
  onFilterByAssignee(): void {
    // TODO: 实现按分配者过滤
    console.log('按分配者过滤');
  }
  
  onFilterByPriority(): void {
    // TODO: 实现按优先级过滤
    console.log('按优先级过滤');
  }
  
  onClearFilters(): void {
    this.taskService.setFilter({});
    this.showMessage('已清除所有过滤条件');
  }
  
  /**
   * 刷新看板
   */
  onRefresh(): void {
    this.loadBoard();
  }
  
  /**
   * 列追踪函数
   */
  trackByColumnId(index: number, column: KanbanColumn): string {
    return column.id;
  }
  
  /**
   * 从拖拽列表ID获取列ID
   */
  private getColumnIdFromDropList(dropListId: string): string | null {
    // 假设拖拽列表ID就是列ID，或者需要根据实际情况解析
    return dropListId;
  }
  
  /**
   * 显示消息提示
   */
  private showMessage(message: string): void {
    this.snackBar.open(message, '关闭', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}