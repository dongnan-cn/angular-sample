import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * AuthGuard 路由守卫：用于保护需要登录才能访问的路由
 * 如果未登录，则自动跳转到登录页
 */
export const authGuard: CanActivateFn = (route, state) => {
  // 使用 inject() 获取依赖
  const auth = inject(AuthService);
  const router = inject(Router);

  // 检查本地是否有 token
  if (auth.getToken()) {
    return true; // 已登录，允许访问
  } else {
    // 未登录，跳转到登录页
    router.navigateByUrl('/login');
    return false;
  }
}; 