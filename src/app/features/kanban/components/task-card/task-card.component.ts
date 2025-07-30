import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { CdkDrag } from '@angular/cdk/drag-drop';
import { Task, TaskPriority, TaskType } from '../../models/task.model';

/**
 * 任务卡片组件
 * 显示单个任务的信息，支持拖拽和基本操作
 */
@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatTooltipModule,
    MatMenuModule,
    CdkDrag
  ],
  template: `
    <mat-card 
      class="task-card" 
      cdkDrag
      [cdkDragData]="task"
      (click)="onCardClick()"
      [class.selected]="selected">
      
      <!-- 任务头部：类型图标和优先级 -->
      <div class="task-header">
        <mat-icon class="task-type-icon" [class]="getTypeIconClass()">{{ getTypeIcon() }}</mat-icon>
        <mat-icon class="priority-icon" [class]="getPriorityClass()">{{ getPriorityIcon() }}</mat-icon>
        
        <!-- 更多操作菜单 -->
        <button mat-icon-button [matMenuTriggerFor]="menu" class="more-menu" (click)="$event.stopPropagation()">
          <mat-icon>more_vert</mat-icon>
        </button>
        
        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="onEdit()">
            <mat-icon>edit</mat-icon>
            <span>编辑</span>
          </button>
          <button mat-menu-item (click)="onDelete()">
            <mat-icon>delete</mat-icon>
            <span>删除</span>
          </button>
        </mat-menu>
      </div>
      
      <!-- 任务标题 -->
      <mat-card-content>
        <h4 class="task-title" [matTooltip]="task.title">{{ task.title }}</h4>
        
        <!-- 任务描述（如果有） -->
        <p class="task-description" *ngIf="task.description" [matTooltip]="task.description">
          {{ task.description }}
        </p>
        
        <!-- 任务标签 -->
        <div class="task-labels" *ngIf="task.labels && task.labels.length > 0">
          <mat-chip-set>
            <mat-chip *ngFor="let label of task.labels" [style.background-color]="label.color">
              {{ label.name }}
            </mat-chip>
          </mat-chip-set>
        </div>
      </mat-card-content>
      
      <!-- 任务底部：分配者、工时、截止日期 -->
      <div class="task-footer">
        <div class="task-meta">
          <!-- 预估工时 -->
          <div class="time-info" *ngIf="task.estimatedHours">
            <mat-icon class="time-icon">schedule</mat-icon>
            <span>{{ task.estimatedHours }}h</span>
          </div>
          
          <!-- 截止日期 -->
          <div class="due-date" *ngIf="task.dueDate" [class.overdue]="isOverdue()">
            <mat-icon class="date-icon">event</mat-icon>
            <span>{{ formatDate(task.dueDate) }}</span>
          </div>
        </div>
        
        <!-- 分配者头像 -->
        <div class="assignee" *ngIf="task.assignee">
          <div class="avatar" [matTooltip]="task.assignee.name">
            {{ getInitials(task.assignee.name) }}
          </div>
        </div>
      </div>
    </mat-card>
  `,
  styles: [`
    .task-card {
      margin-bottom: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      border-left: 4px solid transparent;
      position: relative;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 1px solid rgba(0, 0, 0, 0.05);
    }
    
    .task-card:hover {
      box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
      border-color: rgba(102, 126, 234, 0.2);
    }
    
    .task-card.selected {
      border-left-color: #667eea;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
      box-shadow: 0 8px 25px rgba(102, 126, 234, 0.2);
    }
    
    .task-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding: 16px 16px 0 16px;
    }
    
    .task-type-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      padding: 4px;
      border-radius: 6px;
      background: rgba(255, 255, 255, 0.9);
    }
    
    .task-type-icon.story { 
      color: #38a169;
      background: rgba(56, 161, 105, 0.1);
    }
    .task-type-icon.bug { 
      color: #e53e3e;
      background: rgba(229, 62, 62, 0.1);
    }
    .task-type-icon.task { 
      color: #3182ce;
      background: rgba(49, 130, 206, 0.1);
    }
    .task-type-icon.epic { 
      color: #805ad5;
      background: rgba(128, 90, 213, 0.1);
    }
    
    .priority-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      padding: 2px;
      border-radius: 4px;
    }
    
    .priority-icon.highest { 
      color: #c53030;
      background: rgba(197, 48, 48, 0.1);
    }
    .priority-icon.high { 
      color: #dd6b20;
      background: rgba(221, 107, 32, 0.1);
    }
    .priority-icon.medium { 
      color: #d69e2e;
      background: rgba(214, 158, 46, 0.1);
    }
    .priority-icon.low { 
      color: #38a169;
      background: rgba(56, 161, 105, 0.1);
    }
    .priority-icon.lowest { 
      color: #68d391;
      background: rgba(104, 211, 145, 0.1);
    }
    
    .more-menu {
      width: 28px;
      height: 28px;
      line-height: 28px;
      border-radius: 6px;
      transition: all 0.2s ease;
    }
    
    .more-menu:hover {
      background: rgba(102, 126, 234, 0.1);
    }
    
    .more-menu mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: #718096;
    }
    
    .task-title {
      margin: 0 0 8px 0;
      font-size: 15px;
      font-weight: 600;
      line-height: 1.4;
      color: #2d3748;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      padding: 0 16px;
    }
    
    .task-description {
      margin: 0 0 12px 0;
      font-size: 13px;
      color: #718096;
      line-height: 1.4;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      padding: 0 16px;
    }
    
    .task-labels {
      margin-bottom: 12px;
      padding: 0 16px;
    }
    
    .task-labels mat-chip {
      font-size: 11px;
      height: 22px;
      color: white;
      margin-right: 6px;
      border-radius: 11px;
      font-weight: 500;
    }
    
    .task-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 8px;
      padding: 0 16px 16px 16px;
    }
    
    .task-meta {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .time-info, .due-date {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 12px;
      color: #718096;
      background: rgba(113, 128, 150, 0.1);
      padding: 4px 8px;
      border-radius: 6px;
      font-weight: 500;
    }
    
    .time-icon, .date-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
    }
    
    .due-date.overdue {
      color: #e53e3e;
      background: rgba(229, 62, 62, 0.1);
    }
    
    .assignee .avatar {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
      border: 2px solid white;
    }
    
    /* 拖拽状态样式 */
    .cdk-drag-preview {
      box-sizing: border-box;
      border-radius: 4px;
      box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2),
                  0 8px 10px 1px rgba(0, 0, 0, 0.14),
                  0 3px 14px 2px rgba(0, 0, 0, 0.12);
      transform: rotate(5deg);
    }
    
    .cdk-drag-placeholder {
      opacity: 0;
    }
    
    .cdk-drag-animating {
      transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
  `]
})
export class TaskCardComponent {
  @Input() task!: Task;
  @Input() selected = false;
  
  @Output() cardClick = new EventEmitter<Task>();
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();
  
  /**
   * 卡片点击事件
   */
  onCardClick(): void {
    this.cardClick.emit(this.task);
  }
  
  /**
   * 编辑任务
   */
  onEdit(): void {
    this.edit.emit(this.task);
  }
  
  /**
   * 删除任务
   */
  onDelete(): void {
    this.delete.emit(this.task);
  }
  
  /**
   * 获取任务类型图标
   */
  getTypeIcon(): string {
    switch (this.task.type) {
      case TaskType.STORY:
        return 'bookmark';
      case TaskType.BUG:
        return 'bug_report';
      case TaskType.TASK:
        return 'check_box';
      case TaskType.EPIC:
        return 'flag';
      default:
        return 'help';
    }
  }
  
  /**
   * 获取任务类型样式类
   */
  getTypeIconClass(): string {
    return this.task.type.toLowerCase();
  }
  
  /**
   * 获取优先级配置
   */
  getPriorityConfig(): { icon: string; color: string } {
    switch (this.task.priority) {
      case TaskPriority.HIGHEST:
        return { icon: 'keyboard_double_arrow_up', color: '#ff5630' };
      case TaskPriority.HIGH:
        return { icon: 'keyboard_arrow_up', color: '#ff8b00' };
      case TaskPriority.MEDIUM:
        return { icon: 'remove', color: '#ffab00' };
      case TaskPriority.LOW:
        return { icon: 'keyboard_arrow_down', color: '#36b37e' };
      case TaskPriority.LOWEST:
        return { icon: 'keyboard_double_arrow_down', color: '#57d9a3' };
      default:
        return { icon: 'remove', color: '#666' };
    }
  }
  
  /**
   * 获取优先级图标
   */
  getPriorityIcon(): string {
    return this.getPriorityConfig().icon;
  }
  
  /**
   * 获取优先级样式类
   */
  getPriorityClass(): string {
    return this.task.priority.toLowerCase();
  }
  
  /**
   * 检查是否过期
   */
  isOverdue(): boolean {
    if (!this.task.dueDate) return false;
    return new Date(this.task.dueDate) < new Date();
  }
  
  /**
   * 格式化日期
   */
  formatDate(date: string | Date): string {
    const d = new Date(date);
    const now = new Date();
    const diffTime = d.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return '今天';
    if (diffDays === 1) return '明天';
    if (diffDays === -1) return '昨天';
    if (diffDays > 0 && diffDays <= 7) return `${diffDays}天后`;
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)}天前`;
    
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }
  
  /**
   * 获取用户姓名首字母
   */
  getInitials(name: string): string {
    if (!name) return '?';
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}