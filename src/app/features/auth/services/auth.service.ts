import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

/**
 * 用户信息接口，可根据实际需求扩展
 */
export interface User {
  id: number;
  username: string;
  password?: string;
  role: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  /**
   * 当前登录用户的信号（响应式状态）
   */
  currentUser = signal<User | null>(null);

  /**
   * JWT Token 的本地存储 key
   */
  private readonly TOKEN_KEY = 'jira_clone_token';

  constructor(private http: HttpClient) {
    // 初始化时尝试从本地存储恢复用户信息
    const token = this.getToken();
    if (token) {
      // 实际项目应解码 token 获取用户信息，这里仅做简单模拟
      const user = this.parseToken(token);
      if (user) this.currentUser.set(user);
    }
  }

  /**
   * 登录方法，直接查询 users 集合，模拟登录校验
   * @param username 用户名
   * @param password 密码
   */
  login(username: string, password: string): Observable<User[]> {
    console.log('login')
    return this.http.get<User[]>(`/api/users?username=${username}&password=${password}`).pipe(
      tap(users => {
        console.log('pipe here')
        if (users.length > 0) {
          // 登录成功，模拟 token
          const user = users[0];
          const token = btoa(`${user.username}:${user.role}`);
          this.setToken(token);
          this.currentUser.set(user);
        }
      })
    );
  }

  /**
   * 注册方法，调用 mock API 创建新用户
   * @param username 用户名
   * @param password 密码
   */
  register(username: string, password: string): Observable<User> {
    return this.http.post<User>('/api/users', { username, password, role: 'user' });
  }

  /**
   * 登出方法，清除本地 token 和用户状态
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUser.set(null);
  }

  /**
   * 获取本地存储的 JWT token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * 保存 JWT token 到本地存储
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * 解析 token 获取用户信息（这里只做简单模拟，实际应解码 JWT）
   */
  private parseToken(token: string): User | null {
    // 这里假设 token 直接是用户名:role 形式，仅为演示
    try {
      const [username, role] = atob(token).split(':');
      return { id: 0, username, role };
    } catch {
      return null;
    }
  }
} 