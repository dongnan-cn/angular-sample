import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
// 引入 HttpClientModule 用于发起 HTTP 请求
import { HttpClientModule } from '@angular/common/http';
// 引入 HttpClientInMemoryWebApiModule 用于拦截 HTTP 请求并返回 mock 数据
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';
// 引入自定义的 InMemoryDataService
import { InMemoryDataService } from './core/services/in-memory-data.service';
// 引入 AuthInterceptor
import { authInterceptor } from './features/auth/interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // 使用 importProvidersFrom 注入 HttpClientModule 和 Mock API 拦截器
    // delay: 500 用于模拟网络延迟，便于前端开发调试
    importProvidersFrom(
      HttpClientModule,
      HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, { delay: 500 })
    ),
    // 注册 AuthInterceptor，使其对所有 HTTP 请求生效
    {
      provide: HTTP_INTERCEPTORS,
      useValue: authInterceptor,
      multi: true
    }
  ]
};
