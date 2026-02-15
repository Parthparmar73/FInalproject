import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css'],
})
export class Register {

  register(form: NgForm) {

    if (form.invalid) {
      return;
    }

    console.log('Form Data:', form.value);
    alert('Registration Successful ✅');

  }
}
