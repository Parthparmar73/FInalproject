import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';   // 👈 ADD THIS

@Component({
  selector: 'app-footer',
  standalone: true,   // 👈 Ensure this is present
  imports: [CommonModule, RouterModule],  // 👈 ADD RouterModule HERE
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class Footer {
  dots = Array(5);
}
