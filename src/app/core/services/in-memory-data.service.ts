import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Injectable } from '@angular/core';
import { RequestInfo, ResponseOptions, ParsedRequestUrl } from 'angular-in-memory-web-api';

/**
 * InMemoryDataService 用于模拟后端数据库，拦截 HTTP 请求并返回 mock 数据。
 * 这里定义了初始的用户、项目、任务等集合。
 */
@Injectable({ providedIn: 'root' })
export class InMemoryDataService implements InMemoryDbService {
  /**
   * 创建初始 mock 数据集合
   * @returns 包含 users、projects、tasks 的对象
   */
  createDb() {
    console.log('createDb');
    // 用户集合，包含管理员和普通用户
    const users = [
      { id: 1, username: 'admin', password: 'admin', role: 'admin' },
      { id: 2, username: 'user', password: 'user', role: 'user' }
    ];
    // 项目集合，初始为空
    const projects: any[] = [];
    // 任务集合，初始为空
    const tasks: any[] = [];
    // 返回所有集合对象
    return { users, projects, tasks };
  }

  /**
   * 拦截自定义 /api/login 请求，实现用户名密码校验和 token 返回
   */
  post(reqInfo: RequestInfo) {
    console.log('getin here');
    // 只处理 /api/login 请求
    if (reqInfo.url.endsWith('/login')) {
      // 获取请求体中的用户名和密码
      const { username, password } = reqInfo.utils.getJsonBody(reqInfo.req);
      // 关键：直接从 db 获取 users 集合
      const users = (reqInfo.utils.getDb() as any).users;
      const user = users.find((u: any) => u.username === username && u.password === password);
      if (user) {
        // 登录成功，返回 base64 token
        const token = btoa(`${user.username}:${user.role}`);
        const options: ResponseOptions = {
          body: { token },
          status: 200
        };
        return reqInfo.utils.createResponse$(() => options);
      } else {
        // 登录失败，返回 401
        const options: ResponseOptions = {
          status: 401,
          body: { error: '用户名或密码错误' }
        };
        return reqInfo.utils.createResponse$(() => options);
      }
    }
    // 其他 POST 请求按默认处理
    return undefined;
  }

  /**
   * 让 /api/login 被识别为自定义端点，post 方法才能拦截
   */
  parseRequestUrl(url: string, utils: any): ParsedRequestUrl {
    console.log('parseRequestUrl', url);
    const parsed = utils.parseRequestUrl(url) as ParsedRequestUrl;
    if (url.endsWith('/login')) {
      parsed.collectionName = 'login';
      parsed.apiBase = url;
      parsed.id = '';
      parsed.resourceUrl = url;
    }
    return parsed;
  }

  /**
   * 可选：自定义ID生成逻辑，确保每个新对象有唯一ID
   * @param collection 当前集合
   * @returns 新的唯一ID
   */
  genId<T extends { id: any }>(collection: T[]): any {
    // 如果集合不为空，返回当前最大ID+1，否则返回1
    return collection.length > 0 ? Math.max(...collection.map(item => +item.id)) + 1 : 1;
  }
} 