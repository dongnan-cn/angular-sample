import { InMemoryDbService } from 'angular-in-memory-web-api';
import { Injectable } from '@angular/core';

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
   * 可选：自定义ID生成逻辑，确保每个新对象有唯一ID
   * @param collection 当前集合
   * @returns 新的唯一ID
   */
  genId<T extends { id: any }>(collection: T[]): any {
    // 如果集合不为空，返回当前最大ID+1，否则返回1
    return collection.length > 0 ? Math.max(...collection.map(item => +item.id)) + 1 : 1;
  }
} 