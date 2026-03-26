import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  providers: [AuthService],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  email = '';
  otp = '';
  verified = false;
  message = '';
  isError = false;

  user = {
    name: '',
    email: '',
    password: ''
  };

  constructor(private auth: AuthService, private router: Router) {}

  sendOtp() {
    this.auth.sendOtp(this.email).subscribe({
      next: (res: any) => {
        this.setMessage(res.message || 'OTP sent successfully', false);
      },
      error: (err) => {
        this.setMessage(err?.error?.message || 'Failed to send OTP', true);
      }
    });
  }

  verifyOtp() {
    this.auth.verifyOtp(this.email, this.otp)
      .subscribe({
        next: (res: any) => {
          this.verified = true;
          this.setMessage(res.message || 'OTP verified successfully', false);
        },
        error: (err) => {
          this.verified = false;
          this.setMessage(err?.error?.message || 'Invalid OTP', true);
        }
      });
  }

  register() {
    this.user.email = this.email;

    this.auth.register(this.user).subscribe({
      next: (res: any) => {
        this.setMessage(res.message || 'Registration complete', !res.success);
        if (res.success) {
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.setMessage(err?.error?.message || 'Registration failed', true);
      }
    });
  }

  private setMessage(message: string, isError: boolean) {
    this.message = message;
    this.isError = isError;
  }
}
