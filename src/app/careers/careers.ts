import { Component, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ApplyModalComponent } from '../apply-modal/apply-modal';

@Component({
  selector: 'app-careers',
  standalone: true,
  imports: [CommonModule, ApplyModalComponent],
  templateUrl: './careers.html',
  styleUrl: './careers.css',
})
export class Careers {
  isModalOpen = false;
  selectedJob = '';

  private platformId = inject(PLATFORM_ID);

  openModal(jobTitle: string) {
    this.selectedJob = jobTitle;
    this.isModalOpen = true;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedJob = '';
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }
}
