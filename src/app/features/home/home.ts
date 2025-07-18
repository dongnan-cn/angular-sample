import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../auth/services/auth.service';
import { Router } from '@angular/router';
import { ProjectService, Project } from '../projects/services/project.service';
import { Sidebar } from '../layout/sidebar/sidebar';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  /**
   * 当前登录用户
   */
  user: User | null = null;
  /**
   * 项目列表
   */
  projects: Project[] = [];

  constructor(
    private auth: AuthService,
    private router: Router,
    private projectService: ProjectService
  ) {
    // 订阅 currentUser 信号，获取当前用户信息
    this.user = this.auth.currentUser();
  }

  ngOnInit(): void {
    // 组件初始化时获取项目列表
    this.projectService.getProjects().subscribe(projects => {
      this.projects = projects;
    });
  }

  /**
   * 退出登录，清除 token 并跳转到登录页
   */
  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
