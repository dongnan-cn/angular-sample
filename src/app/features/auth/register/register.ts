import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  /**
   * 注册表单对象，包含用户名、密码、确认密码字段
   */
  form: FormGroup;
  /**
   * 注册失败时的错误信息
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
      password: ['', [Validators.required, Validators.minLength(4)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  /**
   * 自定义校验器：检查两次输入的密码是否一致
   */
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  /**
   * 提交注册表单，调用 AuthService 进行注册
   */
  onSubmit() {
    if (this.form.invalid) return;
    const { username, password } = this.form.value;
    this.auth.register(username, password).subscribe({
      next: () => {
        // 注册成功后跳转到登录页
        this.router.navigateByUrl('/login');
      },
      error: err => {
        // 注册失败，显示错误信息
        this.errorMsg = '注册失败，用户名可能已存在';
      }
    });
  }
}
