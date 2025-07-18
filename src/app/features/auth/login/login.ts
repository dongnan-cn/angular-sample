import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  /**
   * 登录表单对象，包含用户名和密码字段
   */
  form: FormGroup;
  /**
   * 登录失败时的错误信息
   */
  errorMsg: string = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    // 初始化响应式表单，添加校验规则
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  /**
   * 提交登录表单，调用 AuthService 进行登录
   */
  onSubmit() {
    console.log('onSubmit')
    if (this.form.invalid) return;
    const { username, password } = this.form.value;
    this.auth.login(username, password).subscribe({
      next: () => {
      console.log('subscribe next')

        // 登录成功，跳转到首页或主页面
        this.router.navigateByUrl('/');
      },
      error: err => {
        console.log('subscribe error', err)
        // 登录失败，显示错误信息
        this.errorMsg = '用户名或密码错误';
      }
    });
  }
}
