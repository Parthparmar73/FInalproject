import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { PaymentModalComponent } from '../payment-modal/payment-modal';

@Component({
  selector: 'app-performance',
  imports: [RouterModule, CommonModule, PaymentModalComponent],
  templateUrl: './performance.html',
  styleUrl: './performance.css',
})
export class Performance {
  showPayment = false;

  constructor(private auth: Auth, private router: Router) { }

  openPayment() {
    if (this.auth.currentUser) {
      this.showPayment = true;
    } else {
      this.router.navigate(['/login']);
    }
  }
}
