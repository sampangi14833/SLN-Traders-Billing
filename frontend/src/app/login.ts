import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  providers: [AuthService],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  data = { email: '', password: '' };
  message = '';
  isError = true;
  forgotMode = false;
  otpSent = false;
  forgotEmail = '';
  otp = '';
  newPassword = '';

  constructor(private auth: AuthService, private router: Router) {}

  login() {
    this.auth.login(this.data).subscribe({
      next: (res: any) => {
        if (res?.token) {
          this.auth.saveToken(res.token, this.data.email);
          this.router.navigate(['/home']);
          return;
        }
        if (res?.success && res?.data) {
          this.auth.saveToken(res.data, this.data.email);
          this.router.navigate(['/home']);
          return;
        }
        this.setMessage(res?.message || 'Invalid credentials', true);
      },
      error: (err) => {
        this.setMessage(err?.error?.message || 'Login failed', true);
      }
    });
  }

  toggleForgotPassword() {
    this.forgotMode = !this.forgotMode;
    this.message = '';
    this.isError = true;
    this.otpSent = false;
    this.forgotEmail = '';
    this.otp = '';
    this.newPassword = '';
  }

  sendForgotOtp() {
    const email = this.forgotEmail.trim();
    if (!email) {
      this.setMessage('Enter your registered email ID', true);
      return;
    }

    if (!this.isValidEmail(email)) {
      this.setMessage('Enter a valid email ID', true);
      return;
    }

    this.auth.forgotPassword(email).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.otpSent = true;
          this.setMessage(res.message || 'OTP sent successfully', false);
        } else {
          this.otpSent = false;
          this.setMessage(res.message || 'Email is not registered', true);
        }
      },
      error: (err) => {
        this.otpSent = false;
        this.setMessage(err?.error?.message || 'Email is not registered', true);
      }
    });
  }

  resetPassword() {
    this.auth.resetPassword({ email: this.forgotEmail.trim(), otp: this.otp, newPassword: this.newPassword }).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.setMessage(res.message || 'Password reset successful', false);
          this.forgotMode = false;
          this.otpSent = false;
          this.forgotEmail = '';
          this.otp = '';
          this.newPassword = '';
        } else {
          this.setMessage(res.message || 'Failed to reset password', true);
        }
      },
      error: (err) => {
        this.setMessage(err?.error?.message || 'Failed to reset password', true);
      }
    });
  }

  private isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private setMessage(message: string, isError: boolean) {
    this.message = message;
    this.isError = isError;
  }
}
