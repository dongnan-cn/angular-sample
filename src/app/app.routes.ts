import { Routes } from '@angular/router';
// 引入登录和注册组件
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Home } from './features/home/home';
import { authGuard } from './features/auth/guards/auth.guard';

/**
 * 应用主路由配置
 * /login  登录页
 * /register  注册页
 * 其他业务路由可后续补充
 */
export const routes: Routes = [
  {
    path: 'login',
    component: Login
  },
  {
    path: 'register',
    component: Register
  },
  {
    path: 'kanban',
    loadChildren: () => import('./features/kanban/kanban.module').then(m => m.KanbanModule),
    canActivate: [authGuard]
  },
  // 默认路由指向主页，需登录后才能访问
  { path: '', component: Home, canActivate: [authGuard] }
];
