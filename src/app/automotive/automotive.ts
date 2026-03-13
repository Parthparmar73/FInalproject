import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '@angular/fire/auth';
import { PaymentModalComponent } from '../payment-modal/payment-modal';
import { CustomQuoteComponent } from '../custom-quote/custom-quote';

@Component({
  selector: 'app-automotive',
  imports: [RouterModule, CommonModule, PaymentModalComponent, CustomQuoteComponent],
  templateUrl: './automotive.html',
  styleUrl: './automotive.css',
})
export class Automotive {
  showPayment = false;
  showQuote = false;

  constructor(private auth: Auth, private router: Router) { }

  openPayment() {
    if (this.auth.currentUser) {
      this.showPayment = true;
    } else {
      this.router.navigate(['/login']);
    }
  }
}
