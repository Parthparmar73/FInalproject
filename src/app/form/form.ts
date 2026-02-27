import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../services/contact';
import { AuthService } from '../services/auth.service';
import { OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form',
  standalone: true,          // 👈 add this
  imports: [FormsModule, HttpClientModule, CommonModule],    // 👈 add this
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form implements OnInit {
isLoggedIn$!: Observable<boolean>;

ngOnInit() {
  this.isLoggedIn$ = this.authService.isLoggedIn();
}
  constructor(
    private contactService: ContactService,
    private authService: AuthService) { }
  onSubmit(form: any) {
    if (form.invalid) return;

    this.authService.isLoggedIn().subscribe(isLogged => {

    if (!isLogged) {
      alert('You must be logged in to submit the contact form.');
      return;
    }

    this.contactService.submitForm(form.value)
    .subscribe({
      next: (res: any) => {
    alert('Consultation request submitted');
    form.reset();
  },
  error: (err: any) => {
    alert('Something went wrong');
    console.error(err);
  }
});
  });
}
}
