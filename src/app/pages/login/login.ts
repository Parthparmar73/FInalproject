import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { Auth } from '@angular/fire/auth';
import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_0ynlsv9';
const EMAILJS_TEMPLATE_ID = 'template_tkcr2el';
const EMAILJS_PUBLIC_KEY = 'I-J7SPwlUSaMHLNin';
const BACKEND_URL = 'http://localhost:5000';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
showNew: boolean = false;
showConfirm: boolean = false;
  // Login
  email: string = '';
  password: string = '';

  // Forgot password
  showForgotPassword = false;
  fpStep: 1 | 2 | 3 = 1;

  forgotEmail = '';
  generatedOtp = '';
  otpExpiry = 0;

  otpValues: string[] = ['', '', '', '', '', ''];

  isSending = false;
  forgotError = '';

  // New password
  newPassword = '';
  confirmPassword = '';
  pwUpdateMsg = '';

  private readonly ADMIN_EMAIL = 'admin@pixelroot.com';

  constructor(
    private auth: AuthService,
    private fireAuth: Auth,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  // ================= LOGIN =================

  login() {
    if (!this.email || !this.password) return;

    const entered = this.email.toLowerCase().trim();

    this.auth.login(this.email, this.password)
      .then(() => {
        if (entered === this.ADMIN_EMAIL) {
          this.router.navigate(['/admin-dashboard']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      })
      .catch((err: any) => alert(err.message));
  }

  // ================= FORGOT UI =================

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

  // ================= SEND OTP =================

  sendOtp() {

    this.forgotError = '';

    if (!this.forgotEmail.includes('@')) {
      this.forgotError = 'Enter valid email';
      return;
    }

    this.isSending = true;

    fetch(`${BACKEND_URL}/check-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: this.forgotEmail.toLowerCase().trim()
      })
    })

      .then(res => res.json())

      .then((data: any) => {

        this.ngZone.run(() => {

          if (data.registered) {
            this.dispatchOtp();
          } else {
            this.isSending = false;
            this.forgotError = 'Email not registered';
          }

        });

      })

      .catch(() => {

        this.ngZone.run(() => {
          this.isSending = false;
          this.forgotError = 'Server error';
        });

      });

  }

  // ================= SEND MAIL =================

  private dispatchOtp() {

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    this.generatedOtp = otp;

    this.otpExpiry = Date.now() + 10 * 60 * 1000;

    const params = {
      email: this.forgotEmail,
      name: this.forgotEmail,
      otp_code: otp,
      message: `Your OTP is ${otp}`
    };

    // Show OTP UI immediately
    this.isSending = false;
    this.fpStep = 2;

    this.cdr.detectChanges();

    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)

      .then(() => {
        console.log('OTP Sent');
      })

      .catch(() => {
        this.forgotError = 'OTP failed';
        this.cdr.detectChanges();
      });

  }

  // ================= OTP INPUT =================

  onOtpInput(i: number, e: Event) {

    const input = e.target as HTMLInputElement;

    const digit = input.value.replace(/\D/g, '').slice(-1);

    input.value = digit;

    this.otpValues[i] = digit;

    if (digit && i < 5) {
      setTimeout(() => {
        const next =
          document.getElementById(`otp-${i + 1}`) as HTMLInputElement;

        if (next) next.focus();

      }, 10);
    }
  }

  onOtpKeydown(i: number, e: KeyboardEvent) {

    if (e.key === 'Backspace' && !this.otpValues[i] && i > 0) {

      this.otpValues[i - 1] = '';

      const prev =
        document.getElementById(`otp-${i - 1}`) as HTMLInputElement;

      if (prev) prev.focus();
    }
  }

  get otpString(): string {
    return this.otpValues.join('');
  }

  // ================= VERIFY OTP =================

  verifyOtp() {

    if (this.otpString.length < 6) {
      this.forgotError = 'Enter full OTP';
      return;
    }

    if (Date.now() > this.otpExpiry) {
      this.forgotError = 'OTP expired';
      return;
    }

    if (this.otpString !== this.generatedOtp) {
      this.forgotError = 'Wrong OTP';
      return;
    }

    this.fpStep = 3;
    this.forgotError = '';
  }

  resendOtp() {
    this.fpStep = 1;
    this.otpValues = ['', '', '', '', '', ''];
    this.forgotError = '';
  }

  // ================= UPDATE PASSWORD =================

  updatePassword() {

    this.forgotError = '';
    this.pwUpdateMsg = '';

    if (this.newPassword.length < 6) {
      this.forgotError = 'Min 6 chars';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.forgotError = 'Not matching';
      return;
    }

    fetch(`${BACKEND_URL}/update-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: this.forgotEmail,
        newPassword: this.newPassword
      })
    })

      .then(res => res.json())

      .then((data: any) => {

        this.ngZone.run(() => {

          if (data.success) {
            this.pwUpdateMsg = 'Password updated';
          } else {
            this.forgotError = 'Update failed';
          }

        });

      })

      .catch(() => {

        this.ngZone.run(() => {
          this.forgotError = 'Server error';
        });

      });

  }

}