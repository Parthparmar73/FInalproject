import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

const BACKEND_URL = 'http://localhost:5000';

@Component({
  selector: 'app-custom-quote',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './custom-quote.html',
  styleUrl: './custom-quote.css',
})
export class CustomQuoteComponent {
  @Input() packageName = 'General Inquiry';
  @Output() closed = new EventEmitter<void>();

  form = { name: '', email: '', phone: '', message: '' };
  submitting = false;
  submitted = false;
  error = '';

  close() { this.closed.emit(); }

  async submit() {
    if (!this.form.name || !this.form.email || !this.form.message) {
      this.error = 'Name, Email aur Message required hai.';
      return;
    }
    this.submitting = true;
    this.error = '';
    try {
      const res = await fetch(`${BACKEND_URL}/quote-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.form.name,
          email: this.form.email,
          phone: this.form.phone,
          packageName: this.packageName,
          message: this.form.message
        })
      });
      const data = await res.json();
      if (data.success) {
        this.submitted = true;
      } else {
        this.error = data.message || 'Submit failed.';
      }
    } catch {
      this.error = 'Server se connect nahi ho pa raha.';
    }
    this.submitting = false;
  }
}
