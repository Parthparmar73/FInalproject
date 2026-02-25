import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Auth } from '@angular/fire/auth';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_dchxafh';
const EMAILJS_TEMPLATE_ID = 'template_ooqixki';
const EMAILJS_PUBLIC_KEY = 'duOy0lrK1pF3nfnwn';
const BACKEND_URL = 'http://localhost:5000'; // Express backend

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {

  // Login
  email = '';
  password = '';

  // Forgot password — 3 steps
  showForgotPassword = false;
  fpStep: 1 | 2 | 3 = 1;
  forgotEmail = '';
  generatedOtp = '';
  otpExpiry = 0;
  otpValues = ['', '', '', '', '', ''];
  isSending = false;
  forgotError = '';

  // Step 3 — new password
  newPassword = '';
  confirmPassword = '';
  pwUpdateMsg = '';
  showNew = false;
  showConfirm = false;

  constructor(
    private auth: AuthService,
    private fireAuth: Auth,
    private router: Router,
    private ngZone: NgZone
  ) { 
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  // ===== LOGIN =====
  login() {
    this.auth.login(this.email, this.password)
      .then(() => this.router.navigate(['/dashboard']))
      .catch(err => alert(err.message));
  }

  // ===== OPEN / CLOSE =====
  openForgotPassword() {
    this.showForgotPassword = true;
    this.fpStep = 1;
    this.forgotEmail = '';
    this.generatedOtp = '';
    this.otpValues = ['', '', '', '', '', ''];
    this.forgotError = '';
    this.isSending = false;
    this.newPassword = '';
    this.confirmPassword = '';
    this.pwUpdateMsg = '';
  }

  closeForgotPassword() {
    this.showForgotPassword = false;
  }

  // ===== STEP 1: SEND OTP =====
  sendOtp() {
    this.forgotError = '';
    if (!this.forgotEmail || !this.forgotEmail.includes('@')) {
      this.forgotError = 'Please enter a valid email address.';
      return;
    }
    this.isSending = true;
    this.forgotError = '';

    // Check with backend if this email is registered in Firebase
    fetch(`${BACKEND_URL}/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.forgotEmail.toLowerCase().trim() })
    })
      .then(res => res.json())
      .then((data: any) => {
        this.ngZone.run(() => {
          if (data.registered) {
            this.dispatchOtp(); // Email is registered — send OTP
          } else {
            this.isSending = false;
            this.forgotError = data.message || 'This email is not registered. Please sign up first.';
          }
        });
      })
      .catch(() => {
        this.ngZone.run(() => {
          this.isSending = false;
          this.forgotError = 'Cannot connect to server. Please try again.';
        });
      });
  }

  // Sends the OTP after confirming email is registered
  private dispatchOtp() {

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
    this.generatedOtp = otp;
  
    this.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 min
  
    const params = {
      email: this.forgotEmail,
      name: this.forgotEmail,
      otp_code: otp,
      message: `Your OTP is: ${otp}. Valid for 10 minutes.`
    };
  
    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
  
      .then(() => {
  
        console.log('OTP Sent ✅');
  
        this.ngZone.run(() => {
  
          this.isSending = false;
  
          this.fpStep = 2; // ✅ only after success
  
        });
  
      })
  
      .catch((err: any) => {
  
        console.error('EmailJS error:', err);
  
        this.ngZone.run(() => {
  
          this.isSending = false;
  
          this.forgotError = 'OTP send nahi hua. Try again.';
  
        });
  
      });
  
  }

  // ===== STEP 2: OTP INPUT =====
  onOtpInput(index: number, e: Event) {
    const input = e.target as HTMLInputElement;
    const digit = input.value.replace(/\D/g, '').slice(-1);

    // Set only 1 digit in current box
    input.value = digit;
    this.otpValues[index] = digit;

    // Advance to next box — clear it first (setTimeout prevents keypress bleed)
    if (digit && index < 5) {
      setTimeout(() => {
        const next = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
        if (next) {
          next.value = '';               // clear before focus!
          this.otpValues[index + 1] = '';
          next.focus();
        }
      }, 10);
    }
  }

  onOtpKeydown(index: number, e: KeyboardEvent) {
    if (e.key === 'Backspace' && !this.otpValues[index] && index > 0) {
      this.otpValues[index - 1] = '';
      const prev = document.getElementById(`otp-${index - 1}`) as HTMLInputElement;
      if (prev) { prev.value = ''; prev.focus(); }
    }
  }

  get otpString(): string {
    return this.otpValues.join('');
  }

  // ===== STEP 2: VERIFY OTP =====
  verifyOtp() {
    const entered = this.otpString;
    if (entered.length < 6) {
      this.forgotError = 'Please enter all 6 digits.';
      return;
    }
    if (Date.now() > this.otpExpiry) {
      this.forgotError = 'OTP expired. Please request a new one.';
      return;
    }
    if (entered !== this.generatedOtp) {
      this.forgotError = 'Incorrect OTP. Try again.';
      return;
    }
    // OTP matched → go to step 3
    this.forgotError = '';
    this.fpStep = 3;
  }

  resendOtp() {
    this.otpValues = ['', '', '', '', '', ''];
    this.forgotError = '';
    this.fpStep = 1;
  }

  // ===== STEP 3: UPDATE PASSWORD =====
  updatePassword() {
    this.forgotError = '';
    this.pwUpdateMsg = '';

    if (!this.newPassword || this.newPassword.length < 6) {
      this.forgotError = 'Password must be at least 6 characters.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.forgotError = 'Passwords do not match.';
      return;
    }

    fetch(`${BACKEND_URL}/update-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: this.forgotEmail, newPassword: this.newPassword })
    })
      .then(res => res.json())
      .then((data: any) => {
        this.ngZone.run(() => {
          if (data.success) {
            if (data.resetEmailSent) {
              // Admin SDK not available — reset email sent as fallback
              this.pwUpdateMsg = '✅ Password reset email sent! Check your inbox and click the link to set your new password.';
            } else {
              // Admin SDK updated password directly
              this.pwUpdateMsg = '✅ Password updated successfully! You can now login with your new password.';
            }
          } else {
            this.forgotError = data.message || 'Failed to update password. Please try again.';
          }
        });
      })
      .catch(() => {
        this.ngZone.run(() => {
          this.forgotError = 'Cannot connect to server. Please ensure the backend is running.';
        });
      });
  }
}
