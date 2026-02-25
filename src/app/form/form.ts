import { Component } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../services/contact';

@Component({
  selector: 'app-form',
  standalone: true,          // 👈 add this
  imports: [FormsModule, HttpClientModule],    // 👈 add this
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form {

  constructor(private contactService: ContactService) { }
  onSubmit(form: any) {
    if (form.invalid) return;

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
  }
}
