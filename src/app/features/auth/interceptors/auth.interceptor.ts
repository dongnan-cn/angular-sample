import { Injectable } from '@angular/core';
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

/**
 * AuthInterceptor HTTP 拦截器：
 * 自动为所有需要认证的请求添加 Authorization 头（携带 JWT Token）
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  console.log('AuthInterceptor: 拦截请求')
  // 获取 AuthService 实例
  const auth = inject(AuthService);
  // 获取本地存储的 token
  const token = auth.getToken();
  console.log('token 0: ', token)
  // 如果有 token，则克隆请求并添加 Authorization 头
  if (token) {
    console.log('token: ', token)
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq);
  }
  // 没有 token，直接发送原始请求
  return next(req);
}; 