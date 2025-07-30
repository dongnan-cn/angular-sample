import { Component, Inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Task, CreateTaskRequest, UpdateTaskRequest, TaskPriority, TaskType } from '../../models/task.model';

export interface TaskDialogData {
  task?: Task; // 如果是编辑模式，传入现有任务
  columnId: string; // 任务所属列ID
  projectId: string; // 项目ID
  mode: 'create' | 'edit'; // 对话框模式
}

/**
 * 任务创建/编辑对话框组件
 */
@Component({
  selector: 'app-task-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="task-dialog">
      <!-- 对话框标题 -->
      <h2 mat-dialog-title class="dialog-title">
        <mat-icon class="title-icon">{{ isEditMode() ? 'edit' : 'add_task' }}</mat-icon>
        {{ isEditMode() ? '编辑任务' : '创建任务' }}
      </h2>

      <!-- 对话框内容 -->
      <mat-dialog-content class="dialog-content">
        <form [formGroup]="taskForm" class="task-form">
          <!-- 任务标题 -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>任务标题 *</mat-label>
            <input matInput formControlName="title" placeholder="请输入任务标题">
            <mat-error *ngIf="taskForm.get('title')?.hasError('required')">
              任务标题不能为空
            </mat-error>
            <mat-error *ngIf="taskForm.get('title')?.hasError('maxlength')">
              任务标题不能超过100个字符
            </mat-error>
          </mat-form-field>

          <!-- 任务描述 -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>任务描述</mat-label>
            <textarea 
              matInput 
              formControlName="description" 
              placeholder="请输入任务描述"
              rows="4">
            </textarea>
            <mat-error *ngIf="taskForm.get('description')?.hasError('maxlength')">
              任务描述不能超过1000个字符
            </mat-error>
          </mat-form-field>

          <!-- 任务类型和优先级 -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>任务类型 *</mat-label>
              <mat-select formControlName="type">
                <mat-option value="STORY">用户故事</mat-option>
                <mat-option value="TASK">任务</mat-option>
                <mat-option value="BUG">缺陷</mat-option>
                <mat-option value="EPIC">史诗</mat-option>
              </mat-select>
              <mat-error *ngIf="taskForm.get('type')?.hasError('required')">
                请选择任务类型
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>优先级 *</mat-label>
              <mat-select formControlName="priority">
                <mat-option value="LOWEST">
                  <span class="priority-option lowest">最低</span>
                </mat-option>
                <mat-option value="LOW">
                  <span class="priority-option low">低</span>
                </mat-option>
                <mat-option value="MEDIUM">
                  <span class="priority-option medium">中等</span>
                </mat-option>
                <mat-option value="HIGH">
                  <span class="priority-option high">高</span>
                </mat-option>
                <mat-option value="HIGHEST">
                  <span class="priority-option highest">最高</span>
                </mat-option>
              </mat-select>
              <mat-error *ngIf="taskForm.get('priority')?.hasError('required')">
                请选择优先级
              </mat-error>
            </mat-form-field>
          </div>

          <!-- 预估工时和截止日期 -->
          <div class="form-row">
            <mat-form-field appearance="outline" class="half-width">
              <mat-label>预估工时（小时）</mat-label>
              <input 
                matInput 
                type="number" 
                formControlName="estimatedHours" 
                placeholder="0"
                min="0"
                step="0.5">
              <mat-error *ngIf="taskForm.get('estimatedHours')?.hasError('min')">
                预估工时不能为负数
              </mat-error>
            </mat-form-field>

            <mat-form-field appearance="outline" class="half-width">
              <mat-label>截止日期</mat-label>
              <input 
                matInput 
                [matDatepicker]="dueDatePicker" 
                formControlName="dueDate"
                placeholder="选择截止日期">
              <mat-datepicker-toggle matSuffix [for]="dueDatePicker"></mat-datepicker-toggle>
              <mat-datepicker #dueDatePicker></mat-datepicker>
            </mat-form-field>
          </div>

          <!-- 表单验证状态显示 -->
          <div class="form-status" *ngIf="taskForm.invalid && taskForm.touched">
            <mat-icon class="error-icon">error</mat-icon>
            <span>请检查并修正表单中的错误</span>
          </div>
        </form>
      </mat-dialog-content>

      <!-- 对话框操作按钮 -->
      <mat-dialog-actions class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">
          取消
        </button>
        <button 
          mat-raised-button 
          color="primary" 
          (click)="onSave()"
          [disabled]="taskForm.invalid || loading()"
          class="save-btn">
          <mat-icon *ngIf="loading()">hourglass_empty</mat-icon>
          {{ isEditMode() ? '更新' : '创建' }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .task-dialog {
      width: 100%;
      max-width: 600px;
    }

    .dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0;
      padding: 24px 24px 0;
      font-size: 20px;
      font-weight: 500;
    }

    .title-icon {
      color: #1976d2;
    }

    .dialog-content {
      padding: 20px 24px;
      max-height: 70vh;
      overflow-y: auto;
    }

    .task-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    .form-row {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }

    .half-width {
      flex: 1;
    }

    .priority-option {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .priority-option.lowest {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .priority-option.low {
      background-color: #fff3e0;
      color: #f57c00;
    }

    .priority-option.medium {
      background-color: #e3f2fd;
      color: #1976d2;
    }

    .priority-option.high {
      background-color: #fce4ec;
      color: #c2185b;
    }

    .priority-option.highest {
      background-color: #ffebee;
      color: #d32f2f;
    }

    .form-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px;
      background-color: #ffebee;
      border-radius: 4px;
      color: #d32f2f;
      font-size: 14px;
    }

    .error-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .dialog-actions {
      padding: 16px 24px 24px;
      justify-content: flex-end;
      gap: 8px;
    }

    .cancel-btn {
      color: #666;
    }

    .save-btn {
      min-width: 80px;
    }

    /* 响应式设计 */
    @media (max-width: 600px) {
      .task-dialog {
        max-width: 100%;
        margin: 0;
      }

      .form-row {
        flex-direction: column;
        gap: 16px;
      }

      .half-width {
        width: 100%;
      }

      .dialog-title {
        font-size: 18px;
        padding: 16px 16px 0;
      }

      .dialog-content {
        padding: 16px;
      }

      .dialog-actions {
        padding: 16px;
      }
    }
  `]
})
export class TaskDialogComponent implements OnInit {
  // 表单对象
  taskForm!: FormGroup;
  
  // 加载状态
  readonly loading = signal<boolean>(false);
  
  // 是否为编辑模式
  readonly isEditMode = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TaskDialogData
  ) {}

  ngOnInit(): void {
    this.isEditMode.set(this.data.mode === 'edit');
    this.initializeForm();
  }

  /**
   * 初始化表单
   */
  private initializeForm(): void {
    this.taskForm = this.fb.group({
      title: [
        this.data.task?.title || '',
        [Validators.required, Validators.maxLength(100)]
      ],
      description: [
        this.data.task?.description || '',
        [Validators.maxLength(1000)]
      ],
      type: [
        this.data.task?.type || TaskType.TASK,
        [Validators.required]
      ],
      priority: [
        this.data.task?.priority || TaskPriority.MEDIUM,
        [Validators.required]
      ],
      estimatedHours: [
        this.data.task?.estimatedHours || 0,
        [Validators.min(0)]
      ],
      dueDate: [
        this.data.task?.dueDate ? new Date(this.data.task.dueDate) : null
      ]
    });
  }

  /**
   * 取消操作
   */
  onCancel(): void {
    this.dialogRef.close();
  }

  /**
   * 保存任务
   */
  onSave(): void {
    if (this.taskForm.valid) {
      this.loading.set(true);
      
      const formValue = this.taskForm.value;
      
      if (this.isEditMode()) {
        // 编辑模式：构建更新请求
        const updateRequest: UpdateTaskRequest = {
          title: formValue.title,
          description: formValue.description,
          type: formValue.type,
          priority: formValue.priority,
          estimatedHours: formValue.estimatedHours,
          dueDate: formValue.dueDate?.toISOString()
        };
        
        this.dialogRef.close({
          action: 'update',
          data: updateRequest
        });
      } else {
        // 创建模式：构建创建请求
        const createRequest: CreateTaskRequest = {
          title: formValue.title,
          description: formValue.description,
          type: formValue.type,
          priority: formValue.priority,
          estimatedHours: formValue.estimatedHours,
          dueDate: formValue.dueDate?.toISOString(),
          projectId: this.data.projectId,
          columnId: this.data.columnId,
          reporterId: 'current-user-id' // TODO: 从用户服务获取当前用户ID
        };
        
        this.dialogRef.close({
          action: 'create',
          data: createRequest
        });
      }
    } else {
      // 标记所有字段为已触摸，以显示验证错误
      this.taskForm.markAllAsTouched();
    }
  }
}