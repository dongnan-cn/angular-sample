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
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
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