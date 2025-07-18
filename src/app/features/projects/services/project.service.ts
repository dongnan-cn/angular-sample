import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/**
 * 项目数据接口，可根据实际需求扩展
 */
export interface Project {
  id: number;
  name: string;
  // 可扩展更多字段，如描述、成员、状态等
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(private http: HttpClient) {}

  /**
   * 获取项目列表（从 json-server mock API 获取）
   */
  getProjects(): Observable<Project[]> {
    // /api/projects 会被代理到 json-server
    return this.http.get<Project[]>('/api/projects');
  }
} 