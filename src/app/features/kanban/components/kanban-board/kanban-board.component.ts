import { Component, Input, Output, EventEmitter, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { KanbanColumnComponent } from '../kanban-column/kanban-column.component';
import { TaskDialogComponent, TaskDialogData } from '../task-dialog/task-dialog.component';
import { Kanban, KanbanColumn } from '../../models/kanban.model';
import { Task } from '../../models/task.model';
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      position: relative;
    }
    
    .kanban-board::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
      pointer-events: none;
    }
    
    .board-toolbar {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      color: #333;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      z-index: 10;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
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
      font-size: 24px;
      font-weight: 600;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
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
    
    .toolbar-actions button {
      background: rgba(102, 126, 234, 0.1);
      border-radius: 8px;
      transition: all 0.3s ease;
    }
    
    .toolbar-actions button:hover {
      background: rgba(102, 126, 234, 0.2);
      transform: translateY(-1px);
    }
    
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      gap: 16px;
      color: rgba(255, 255, 255, 0.8);
    }
    
    .board-container {
      flex: 1;
      overflow: hidden;
      padding: 24px;
      position: relative;
      z-index: 1;
    }
    
    .columns-wrapper {
      display: flex;
      height: 100%;
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 16px;
      gap: 16px;
    }
    
    .add-column-container {
      display: flex;
      align-items: flex-start;
      padding-top: 16px;
    }
    
    .add-column-btn {
      min-width: 280px;
      height: 80px;
      border: 2px dashed rgba(255, 255, 255, 0.4);
      color: white;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(15px);
      border-radius: 16px;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    }
    
    .add-column-btn:hover {
      border-color: rgba(255, 255, 255, 0.8);
      color: white;
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-3px);
      box-shadow: 0 12px 35px rgba(0, 0, 0, 0.2);
    }
    
    .add-column-btn mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }
    
    .empty-board {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      text-align: center;
      color: rgba(255, 255, 255, 0.8);
      padding: 32px;
    }
    
    .empty-icon {
      font-size: 80px;
      width: 80px;
      height: 80px;
      margin-bottom: 24px;
      opacity: 0.6;
      color: rgba(255, 255, 255, 0.7);
    }
    
    .empty-board h3 {
      margin: 0 0 12px 0;
      font-size: 28px;
      font-weight: 600;
      color: white;
    }
    
    .empty-board p {
      margin: 0 0 32px 0;
      font-size: 18px;
      max-width: 400px;
      line-height: 1.6;
    }
    
    .empty-board button {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      padding: 12px 24px;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }
    
    .empty-board button:hover {
      background: rgba(255, 255, 255, 0.25);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    }
    
    /* 滚动条样式 */
    .columns-wrapper::-webkit-scrollbar {
      height: 8px;
    }
    
    .columns-wrapper::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
    }
    
    .columns-wrapper::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.3);
      border-radius: 4px;
    }
    
    .columns-wrapper::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.5);
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
        font-size: 20px;
      }
      
      .board-container {
        padding: 16px;
      }
      
      .add-column-btn {
        min-width: 200px;
        height: 50px;
        font-size: 14px;
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
  private readonly dialog = inject(MatDialog);
  
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
    const dialogData: TaskDialogData = {
      task: task,
      columnId: task.columnId,
      projectId: task.projectId,
      mode: 'edit'
    };

    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'update') {
        this.taskService.updateTask(task.id, result.data).subscribe({
          next: () => {
            this.showMessage('任务更新成功');
          },
          error: (error: any) => {
            console.error('更新任务失败:', error);
            this.showMessage('更新任务失败');
          }
        });
      }
    });
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
    const dialogData: TaskDialogData = {
      columnId: columnId,
      projectId: this.projectId || '',
      mode: 'create'
    };

    const dialogRef = this.dialog.open(TaskDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.action === 'create') {
        this.taskService.createTask(result.data).subscribe({
          next: () => {
            this.showMessage('任务创建成功');
          },
          error: (error: any) => {
            console.error('创建任务失败:', error);
            this.showMessage('创建任务失败');
          }
        });
      }
    });
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