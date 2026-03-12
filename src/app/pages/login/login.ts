<<<<<<< HEAD
import { Component, NgZone, ChangeDetectorRef } from '@angular/core';
=======
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
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
<<<<<<< HEAD
showNew: boolean = false;
showConfirm: boolean = false;
  // Login
  email: string = '';
  password: string = '';

  // Forgot password
=======

  email = '';
  password = '';

>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
  showForgotPassword = false;
  fpStep: 1 | 2 | 3 = 1;

  forgotEmail = '';
  generatedOtp = '';
  otpExpiry = 0;

  otpValues: string[] = ['', '', '', '', '', ''];

  isSending = false;
  forgotError = '';

<<<<<<< HEAD
  // New password
=======
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
  newPassword = '';
  confirmPassword = '';
  pwUpdateMsg = '';

  private readonly ADMIN_EMAIL = 'admin@pixelroot.com';

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
<<<<<<< HEAD

  login() {
    if (!this.email || !this.password) return;

    const entered = this.email.toLowerCase().trim();
=======
  login() {
    const enteredEmail = this.email.toLowerCase().trim();
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)

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

<<<<<<< HEAD
  // ================= FORGOT UI =================

=======
  // ================= FORGOT PASSWORD =================
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
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
<<<<<<< HEAD

=======
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
  sendOtp() {

    this.forgotError = '';

<<<<<<< HEAD
    if (!this.forgotEmail.includes('@')) {
      this.forgotError = 'Enter valid email';
=======
    if (!this.forgotEmail || !this.forgotEmail.includes('@')) {
      this.forgotError = 'Please enter a valid email address.';
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
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
<<<<<<< HEAD

      .then(res => res.json())

      .then((data: any) => {

        this.ngZone.run(() => {

=======
      .then(res => res.json())
      .then((data: any) => {
        this.ngZone.run(() => {
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
          if (data.registered) {
            this.dispatchOtp();
          } else {
            this.isSending = false;
<<<<<<< HEAD
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

=======
            this.forgotError = data.message || 'This email is not registered.';
          }
        });
      })
      .catch(() => {
        this.ngZone.run(() => {
          this.isSending = false;
          this.forgotError = 'Cannot connect to server.';
        });
      });
  }

  // ================= RESEND OTP =================
  resendOtp() {

    this.forgotError = '';
    this.otpValues = ['', '', '', '', '', ''];

    if (!this.forgotEmail) {
      this.forgotError = 'Email missing.';
      return;
    }

    this.dispatchOtp();
  }

  // ================= DISPATCH OTP =================
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
  private dispatchOtp() {

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    this.generatedOtp = otp;
<<<<<<< HEAD

=======
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
    this.otpExpiry = Date.now() + 10 * 60 * 1000;

    const params = {
      email: this.forgotEmail,
      name: this.forgotEmail,
      otp_code: otp,
      message: `Your OTP is ${otp}`
    };

<<<<<<< HEAD
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

=======
    this.isSending = false;
    this.fpStep = 2;
    this.cdr.detectChanges();

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
      .then(() => console.log('OTP Sent ✅'))
      .catch(err => {
        console.error(err);
        this.forgotError = 'OTP Failed. Try again.';
        this.cdr.detectChanges();
      });
  }

  // ================= OTP INPUT =================
  onOtpInput(index: number, e: Event) {
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
    const input = e.target as HTMLInputElement;

    const digit = input.value.replace(/\D/g, '').slice(-1);
<<<<<<< HEAD

=======
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
    input.value = digit;

<<<<<<< HEAD
    this.otpValues[i] = digit;

    if (digit && i < 5) {
      setTimeout(() => {
        const next =
          document.getElementById(`otp-${i + 1}`) as HTMLInputElement;

        if (next) next.focus();

=======
    if (digit && index < 5) {
      setTimeout(() => {
        const next = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
        if (next) {
          next.value = '';
          this.otpValues[index + 1] = '';
          next.focus();
        }
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
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

<<<<<<< HEAD
  // ================= VERIFY OTP =================

  verifyOtp() {

    if (this.otpString.length < 6) {
      this.forgotError = 'Enter full OTP';
=======
  verifyOtp() {

    if (this.otpString.length < 6) {
      this.forgotError = 'Enter all 6 digits.';
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
      return;
    }

    if (Date.now() > this.otpExpiry) {
<<<<<<< HEAD
      this.forgotError = 'OTP expired';
=======
      this.forgotError = 'OTP expired.';
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
      return;
    }

    if (this.otpString !== this.generatedOtp) {
<<<<<<< HEAD
      this.forgotError = 'Wrong OTP';
      return;
    }

=======
      this.forgotError = 'Incorrect OTP.';
      return;
    }

    this.forgotError = '';
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
    this.fpStep = 3;
    this.forgotError = '';
  }

<<<<<<< HEAD
  resendOtp() {
    this.fpStep = 1;
    this.otpValues = ['', '', '', '', '', ''];
    this.forgotError = '';
  }

  // ================= UPDATE PASSWORD =================

=======
  // ================= UPDATE PASSWORD =================
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
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
<<<<<<< HEAD
=======
      })
    })
      .then(res => res.json())
      .then((data: any) => {
        this.ngZone.run(() => {
          if (data.success) {
            this.pwUpdateMsg = '✅ Password updated successfully!';
          } else {
            this.forgotError = data.message || 'Failed to update password.';
          }
        });
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
      })
    })

      .then(res => res.json())

      .then((data: any) => {

        this.ngZone.run(() => {
<<<<<<< HEAD

          if (data.success) {
            this.pwUpdateMsg = 'Password updated';
          } else {
            this.forgotError = 'Update failed';
          }

=======
          this.forgotError = 'Cannot connect to backend.';
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
        });

      })

      .catch(() => {

        this.ngZone.run(() => {
          this.forgotError = 'Server error';
        });

      });

  }
<<<<<<< HEAD

=======
>>>>>>> 74f4638 (admin mese packege add kar sakte hai)
}