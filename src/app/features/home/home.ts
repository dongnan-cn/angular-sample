import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../auth/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  /**
   * 当前登录用户
   */
  user: User | null = null;

  constructor(private auth: AuthService, private router: Router) {
    // 订阅 currentUser 信号，获取当前用户信息
    this.user = this.auth.currentUser();
  }

  /**
   * 退出登录，清除 token 并跳转到登录页
   */
  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
