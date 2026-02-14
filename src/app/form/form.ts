import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-form',
  standalone: true,          // 👈 add this
  imports: [FormsModule],    // 👈 add this
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form {

  onSubmit() {
    console.log('Form submitted');
  }

}
