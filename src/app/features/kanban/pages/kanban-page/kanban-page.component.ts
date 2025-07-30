import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { KanbanBoardComponent } from '../../components/kanban-board/kanban-board.component';
import { Task } from '../../models/task.model';

/**
 * 看板页面组件
 * 看板管理系统的主页面
 */
@Component({
  selector: 'app-kanban-page',
  standalone: true,
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    KanbanBoardComponent
  ],
  template: `
    <div class="kanban-page">
      <!-- 看板面板 -->
      <app-kanban-board
        [kanbanId]="kanbanId()"
        [projectId]="projectId()"
        (taskSelected)="onTaskSelected($event)"
        (boardUpdated)="onBoardUpdated($event)">
      </app-kanban-board>
      
      <!-- 任务详情侧边栏 (TODO: 后续实现) -->
      <div class="task-detail-sidebar" *ngIf="selectedTask()">
        <h3>任务详情</h3>
        <p>{{ selectedTask()?.title }}</p>
        <!-- TODO: 实现完整的任务详情组件 -->
      </div>
    </div>
  `,
  styles: [`
    .kanban-page {
      height: 100vh;
      display: flex;
      overflow: hidden;
    }
    
    app-kanban-board {
      flex: 1;
    }
    
    .task-detail-sidebar {
      width: 400px;
      background-color: white;
      border-left: 1px solid #e0e0e0;
      padding: 16px;
      overflow-y: auto;
    }
    
    .task-detail-sidebar h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 500;
    }
    
    /* 响应式设计 */
    @media (max-width: 768px) {
      .kanban-page {
        flex-direction: column;
      }
      
      .task-detail-sidebar {
        width: 100%;
        height: 300px;
        border-left: none;
        border-top: 1px solid #e0e0e0;
      }
    }
  `]
})
export class KanbanPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  
  // 响应式状态
  readonly kanbanId = signal<string | null>(null);
  readonly projectId = signal<string | null>(null);
  readonly selectedTask = signal<Task | null>(null);
  
  ngOnInit(): void {
    // 从路由参数获取看板ID或项目ID
    this.route.params.subscribe(params => {
      if (params['kanbanId']) {
        this.kanbanId.set(params['kanbanId']);
      }
      if (params['projectId']) {
        this.projectId.set(params['projectId']);
      }
    });
    
    // 从查询参数获取项目ID（备用方案）
    this.route.queryParams.subscribe(queryParams => {
      if (queryParams['projectId'] && !this.projectId()) {
        this.projectId.set(queryParams['projectId']);
      }
    });
  }
  
  /**
   * 任务选择事件处理
   */
  onTaskSelected(task: Task): void {
    this.selectedTask.set(task);
  }
  
  /**
   * 看板更新事件处理
   */
  onBoardUpdated(kanban: any): void {
    console.log('看板已更新:', kanban);
    // TODO: 处理看板更新逻辑
  }
}