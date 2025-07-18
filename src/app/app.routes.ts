import { Routes } from '@angular/router';
// 引入登录和注册组件
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';

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
  // 默认路由可根据实际需求调整
  { path: '', redirectTo: '/login', pathMatch: 'full' }
];
