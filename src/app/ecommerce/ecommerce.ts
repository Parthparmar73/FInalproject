import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { PaymentModalComponent } from '../payment-modal/payment-modal';

@Component({
  selector: 'app-ecommerce',
  imports: [RouterModule, CommonModule, PaymentModalComponent],
  templateUrl: './ecommerce.html',
  styleUrl: './ecommerce.css',
})
export class Ecommerce {
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
