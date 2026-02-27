import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { PaymentModalComponent } from '../payment-modal/payment-modal';

@Component({
  selector: 'app-manufacturing',
  imports: [RouterModule, CommonModule, PaymentModalComponent],
  templateUrl: './manufacturing.html',
  styleUrl: './manufacturing.css',
})
export class Manufacturing {
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
