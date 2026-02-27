import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth, onAuthStateChanged } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {

  showContactPopup = false;
  contactForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private firestore: Firestore,
    private auth: Auth,
    private router: Router
    ) { }

  ngOnInit() {
    this.contactForm = this.fb.group({
      fname: ['', [Validators.required, Validators.minLength(2)]],
      lname: ['', Validators.required],
      cname: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      number: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      service: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  openContactPopup() {
    this.showContactPopup = true;
  }

  closeContactPopup() {
    this.showContactPopup = false;
  }

  async submitContactForm() {

    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const user = this.auth.currentUser;

    if (!user) {
      alert('You must be logged in to submit the contact form.');
      this.router.navigate(['/login']);
      return;
    }
    try {
      const contactcollection = collection(this.firestore, 'contacts');

      await addDoc(contactcollection, {
        ...this.contactForm.value,
        createdAt: new Date()
    });

    alert('Message sent successfully!');

    this.contactForm.reset();
    this.closeContactPopup();
    }
    catch (error){
      console.error('Error adding document: ', error);
      alert('something went wrong');
    }
  }
}
