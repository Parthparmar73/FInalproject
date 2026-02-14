import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-quote-modal',
  standalone: true,  // ✅ standalone
  imports: [CommonModule],  // Angular directives like *ngIf
  templateUrl: './quote-modal.html',
  styleUrls: ['./quote-modal.css']
})
export class QuoteModalComponent {
  @Input() service: any;
  @Output() closeModal = new EventEmitter<void>();

  close() {
    this.closeModal.emit();
  }
}
