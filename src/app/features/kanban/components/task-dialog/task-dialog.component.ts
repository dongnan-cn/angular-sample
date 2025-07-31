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
  templateUrl: './task-dialog.component.html',
  styleUrls: ['./task-dialog.component.scss']
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