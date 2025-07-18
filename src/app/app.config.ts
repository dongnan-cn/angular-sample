import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
// 引入 HttpClientModule 用于发起 HTTP 请求
import { HttpClientModule, provideHttpClient, withInterceptors } from '@angular/common/http';
import { InMemoryDataService } from './core/services/in-memory-data.service';
// 引入 AuthInterceptor
import { authInterceptor } from './features/auth/interceptors/auth.interceptor';
import { routes } from './app.routes';
// 引入类型
import { HttpClientInMemoryWebApiModule, ParsedRequestUrl, RequestInfoUtilities } from 'angular-in-memory-web-api';

// 独立的 parseRequestUrl 逻辑，确保 /api/login 能被正确拦截
function customParseRequestUrl(url: string, utils: RequestInfoUtilities): ParsedRequestUrl {
  const parsed = utils.parseRequestUrl(url) as ParsedRequestUrl;
  if (url.endsWith('/login')) {
    parsed.collectionName = 'login';
    parsed.apiBase = url;
    parsed.id = '';
    parsed.resourceUrl = url;
  }
  return parsed;
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // 使用 importProvidersFrom 注入 HttpClientModule 和 Mock API 拦截器
    // delay: 500 用于模拟网络延迟，便于前端开发调试
    importProvidersFrom(
      HttpClientModule,
      HttpClientInMemoryWebApiModule.forRoot(InMemoryDataService, {
        delay: 500,
        passThruUnknownUrl: false,
        parseRequestUrl: customParseRequestUrl
      } as any)
    ),
    // 用函数式方式注册 AuthInterceptor
    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    )
  ]
};
