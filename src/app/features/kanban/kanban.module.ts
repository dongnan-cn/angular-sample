import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ReactiveFormsModule } from '@angular/forms';

// 导入组件（稍后创建）
import { KanbanPageComponent } from './pages/kanban-page/kanban-page.component';
// import { KanbanBoardComponent } from './components/kanban-board/kanban-board.component';
// import { KanbanColumnComponent } from './components/kanban-column/kanban-column.component';
// import { TaskCardComponent } from './components/task-card/task-card.component';
// import { TaskFormComponent } from './components/task-form/task-form.component';

const routes: Routes = [
  {
    path: '',
    // component: KanbanPageComponent
    loadComponent: () => import('./pages/kanban-page/kanban-page.component').then(m => m.KanbanPageComponent)
  }
];

@NgModule({
  declarations: [
    // 组件声明将在创建组件后添加
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    DragDropModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule
  ],
  exports: [
    RouterModule
  ]
})
export class KanbanModule { }