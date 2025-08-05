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
import { Task } from '../../models/task.model';

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
  templateUrl: './kanban-column.component.html',
  styleUrls: ['./kanban-column.component.scss']
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