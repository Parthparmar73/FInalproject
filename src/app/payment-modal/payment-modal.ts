import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-payment-modal',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './payment-modal.html',
    styleUrl: './payment-modal.css'
})
export class PaymentModalComponent {
    @Input() price: string = '$4,000';
    @Input() productName: string = 'Blueprint';
    @Output() closed = new EventEmitter<void>();

    activeTab: 'card' | 'upi' = 'card';
    step: 'form' | 'processing' | 'success' = 'form';
    txnId: string = '';

    // Card fields
    cardNumber: string = '';
    cardName: string = '';
    expiry: string = '';
    cvv: string = '';
    showCvv: boolean = false;

    // UPI field
    upiId: string = '';
    selectedUpiApp: string = '';

    upiApps = [
        { name: 'GPay', icon: '🟢', vpa: 'gpay' },
        { name: 'PhonePe', icon: '🟣', vpa: 'ybl' },
        { name: 'Paytm', icon: '🔵', vpa: 'paytm' },
        { name: 'BHIM', icon: '🇮🇳', vpa: 'upi' },
    ];


    // Validation errors
    errors: { [key: string]: string } = {};

    setTab(tab: 'card' | 'upi') {
        this.activeTab = tab;
        this.errors = {};
        this.selectedUpiApp = '';
    }

    selectUpiApp(app: string) {
        this.selectedUpiApp = this.selectedUpiApp === app ? '' : app;
    }

    getQrUrl(): string {
        const amount = this.price.replace(/[^0-9.]/g, '');
        const upiLink = `upi://pay?pa=pixelroot@okaxis&pn=Pixelroot&am=${amount}&cu=INR&tn=Blueprint+Purchase`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}&bgcolor=ffffff&color=000000&margin=10`;
    }


    formatCardNumber(event: Event) {
        const input = event.target as HTMLInputElement;
        let value = input.value.replace(/\D/g, '').substring(0, 16);
        value = value.replace(/(.{4})/g, '$1 ').trim();
        this.cardNumber = value;
    }

    formatExpiry(event: Event) {
        const input = event.target as HTMLInputElement;
        let value = input.value.replace(/\D/g, '').substring(0, 4);
        if (value.length >= 3) {
            value = value.substring(0, 2) + '/' + value.substring(2);
        }
        this.expiry = value;
    }

    getCardType(): string {
        const num = this.cardNumber.replace(/\s/g, '');
        if (num.startsWith('4')) return 'visa';
        if (/^5[1-5]/.test(num)) return 'mastercard';
        if (/^3[47]/.test(num)) return 'amex';
        if (num.startsWith('6')) return 'rupay';
        return 'generic';
    }

    validate(): boolean {
        this.errors = {};
        if (this.activeTab === 'card') {
            const raw = this.cardNumber.replace(/\s/g, '');
            if (raw.length < 16) this.errors['cardNumber'] = 'Enter a valid 16-digit card number';
            if (!this.cardName.trim()) this.errors['cardName'] = 'Cardholder name is required';
            if (!this.expiry || this.expiry.length < 5) this.errors['expiry'] = 'Enter valid expiry (MM/YY)';
            if (!this.cvv || this.cvv.length < 3) this.errors['cvv'] = 'Enter valid CVV';
        } else {
            if (!this.upiId.includes('@')) this.errors['upiId'] = 'Enter a valid UPI ID (e.g. name@upi)';
        }
        return Object.keys(this.errors).length === 0;
    }

    pay() {
        if (!this.validate()) return;
        this.txnId = Math.floor(Math.random() * 9000000 + 1000000).toString();
        this.step = 'processing';
        setTimeout(() => {
            this.step = 'success';
        }, 2500);
    }

    close() {
        this.step = 'form';
        this.cardNumber = '';
        this.cardName = '';
        this.expiry = '';
        this.cvv = '';
        this.upiId = '';
        this.selectedUpiApp = '';
        this.errors = {};
        this.closed.emit();
    }
}
