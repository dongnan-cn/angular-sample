import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { CdkDropList, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { TaskCardComponent } from '../task-card/task-card.component';
import { KanbanColumn } from '../../models/kanban.model';
import { Task, CreateTaskRequest } from '../../models/task.model';

/**
 * 看板列组件
 * 显示一个看板列及其包含的任务卡片，支持拖拽排序和添加任务
 */
@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatCardModule,
    MatDividerModule,
    MatMenuModule,
    CdkDropList,
    TaskCardComponent
  ],
  template: `
    <div class="kanban-column">
      <!-- 列头部 -->
      <div class="column-header">
        <div class="column-title-section">
          <h3 class="column-title">{{ column.title }}</h3>
          <mat-icon 
            class="column-icon" 
            [style.color]="column.color">
            list
          </mat-icon>
          <span class="task-count" [matBadge]="tasks.length" matBadgeColor="primary">
            {{ tasks.length }}
          </span>
        </div>
        
        <!-- 列操作菜单 -->
        <button mat-icon-button [matMenuTriggerFor]="columnMenu" class="column-menu">
          <mat-icon>more_vert</mat-icon>
        </button>
        
        <mat-menu #columnMenu="matMenu">
          <button mat-menu-item (click)="onAddTask()">
            <mat-icon>add</mat-icon>
            <span>添加任务</span>
          </button>
          <button mat-menu-item (click)="onEditColumn()">
            <mat-icon>edit</mat-icon>
            <span>编辑列</span>
          </button>
          <mat-divider></mat-divider>
          <button mat-menu-item (click)="onDeleteColumn()" class="delete-action">
            <mat-icon>delete</mat-icon>
            <span>删除列</span>
          </button>
        </mat-menu>
      </div>
      
      <!-- 任务列表区域 -->
      <div 
        class="tasks-container"
        cdkDropList
        [cdkDropListData]="tasks"
        [cdkDropListConnectedTo]="connectedDropLists"
        (cdkDropListDropped)="onTaskDrop($event)">
        
        <!-- 任务卡片列表 -->
        <app-task-card
          *ngFor="let task of tasks; trackBy: trackByTaskId"
          [task]="task"
          [selected]="selectedTaskId === task.id"
          (cardClick)="onTaskClick($event)"
          (edit)="onTaskEdit($event)"
          (delete)="onTaskDelete($event)">
        </app-task-card>
        
        <!-- 空状态提示 -->
        <div class="empty-state" *ngIf="tasks.length === 0">
          <mat-icon class="empty-icon">inbox</mat-icon>
          <p class="empty-text">暂无任务</p>
          <button mat-stroked-button (click)="onAddTask()" class="add-task-btn">
            <mat-icon>add</mat-icon>
            添加任务
          </button>
        </div>
      </div>
      
      <!-- 快速添加任务按钮 -->
      <div class="column-footer" *ngIf="tasks.length > 0">
        <button mat-button (click)="onAddTask()" class="quick-add-btn">
          <mat-icon>add</mat-icon>
          添加任务
        </button>
      </div>
    </div>
  `,
  styles: [`
    .kanban-column {
      width: 300px;
      min-height: 400px;
      margin-right: 16px;
      display: flex;
      flex-direction: column;
      background-color: #f5f5f5;
      border-radius: 8px;
      overflow: hidden;
    }
    
    .column-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background-color: white;
      border-bottom: 1px solid #e0e0e0;
      min-height: 56px;
    }
    
    .column-title-section {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
    }
    
    .column-title {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
      color: #333;
    }
    
    .column-status-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .task-count {
      font-size: 12px;
      color: #666;
      background-color: #e3f2fd;
      padding: 2px 6px;
      border-radius: 10px;
      min-width: 20px;
      text-align: center;
    }
    
    .column-menu {
      width: 32px;
      height: 32px;
      line-height: 32px;
    }
    
    .column-menu mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }
    
    .delete-action {
      color: #f44336;
    }
    
    .tasks-container {
      flex: 1;
      padding: 8px;
      min-height: 200px;
      overflow-y: auto;
    }
    
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
      text-align: center;
      color: #999;
      min-height: 200px;
    }
    
    .empty-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    
    .empty-text {
      margin: 0 0 16px 0;
      font-size: 14px;
    }
    
    .add-task-btn {
      color: #1976d2;
    }
    
    .column-footer {
      padding: 8px;
      background-color: white;
      border-top: 1px solid #e0e0e0;
    }
    
    .quick-add-btn {
      width: 100%;
      color: #666;
      justify-content: flex-start;
    }
    
    .quick-add-btn mat-icon {
      margin-right: 8px;
    }
    
    /* 拖拽相关样式 */
    .cdk-drop-list {
      min-height: 60px;
    }
    
    .cdk-drop-list.cdk-drop-list-receiving {
      background-color: #e8f5e8;
    }
    
    .cdk-drag-placeholder {
      opacity: 0;
    }
    
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    
    /* 滚动条样式 */
    .tasks-container::-webkit-scrollbar {
      width: 6px;
    }
    
    .tasks-container::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .tasks-container::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 3px;
    }
    
    .tasks-container::-webkit-scrollbar-thumb:hover {
      background: #999;
    }
    
    /* 响应式设计 */
    @media (max-width: 768px) {
      .kanban-column {
        width: 280px;
        margin-right: 12px;
      }
      
      .column-header {
        padding: 8px 12px;
      }
      
      .column-title {
        font-size: 14px;
      }
    }
  `]
})
export class KanbanColumnComponent {
  @Input() column!: KanbanColumn;
  @Input() tasks: Task[] = [];
  @Input() selectedTaskId: string | null = null;
  @Input() connectedDropLists: string[] = [];
  
  @Output() taskClick = new EventEmitter<Task>();
  @Output() taskEdit = new EventEmitter<Task>();
  @Output() taskDelete = new EventEmitter<Task>();
  @Output() taskDrop = new EventEmitter<CdkDragDrop<Task[]>>();
  @Output() addTask = new EventEmitter<string>(); // 传递列ID
  @Output() editColumn = new EventEmitter<KanbanColumn>();
  @Output() deleteColumn = new EventEmitter<KanbanColumn>();
  
  /**
   * 任务点击事件
   */
  onTaskClick(task: Task): void {
    this.taskClick.emit(task);
  }
  
  /**
   * 任务编辑事件
   */
  onTaskEdit(task: Task): void {
    this.taskEdit.emit(task);
  }
  
  /**
   * 任务删除事件
   */
  onTaskDelete(task: Task): void {
    this.taskDelete.emit(task);
  }
  
  /**
   * 任务拖拽放置事件
   */
  onTaskDrop(event: CdkDragDrop<Task[]>): void {
    this.taskDrop.emit(event);
  }
  
  /**
   * 添加任务事件
   */
  onAddTask(): void {
    this.addTask.emit(this.column.id);
  }
  
  /**
   * 编辑列事件
   */
  onEditColumn(): void {
    this.editColumn.emit(this.column);
  }
  
  /**
   * 删除列事件
   */
  onDeleteColumn(): void {
    this.deleteColumn.emit(this.column);
  }
  
  /**
   * 任务追踪函数，用于优化渲染性能
   */
  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }
}