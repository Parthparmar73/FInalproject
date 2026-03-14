import { Component, Input, Output, EventEmitter, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Firestore, collection, addDoc, serverTimestamp } from '@angular/fire/firestore';
import { FirebaseApp } from '@angular/fire/app';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  FirebaseStorage
} from 'firebase/storage';

@Component({
  selector: 'app-apply-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './apply-modal.html',
  styleUrl: './apply-modal.css'
})
export class ApplyModalComponent implements OnInit {
  @Input() jobTitle: string = '';
  @Output() closeModal = new EventEmitter<void>();

  form!: FormGroup;
  selectedFile: File | null = null;
  fileError: string = '';
  isSubmitting: boolean = false;
  submitSuccess: boolean = false;
  submitError: string = '';
  uploadProgress: number = 0;

  // Angular Fire injections (safe — inside injection context)
  private firestore = inject(Firestore);
  private platformId = inject(PLATFORM_ID);
  private fb = inject(FormBuilder);
  private firebaseApp = inject(FirebaseApp);

  // Firebase Storage instance (initialized in ngOnInit, browser-only)
  private storage: FirebaseStorage | null = null;

  ngOnInit() {
    this.form = this.fb.group({
      fullName:    ['', [Validators.required, Validators.minLength(2)]],
      email:       ['', [Validators.required, Validators.email]],
      phone:       ['', [Validators.required, Validators.pattern(/^[+\d\s\-()]{7,15}$/)]],
      experience:  ['', Validators.required],
      coverLetter: ['']
    });

    // Initialize Storage here (inside injection context & browser only)
    if (isPlatformBrowser(this.platformId)) {
      this.storage = getStorage(this.firebaseApp);
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.fileError = '';
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (file.type !== 'application/pdf') {
        this.fileError = 'Only PDF files are accepted.';
        this.selectedFile = null;
        input.value = '';
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        this.fileError = 'File size must be under 5 MB.';
        this.selectedFile = null;
        input.value = '';
        return;
      }
      this.selectedFile = file;
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (!this.selectedFile) {
      this.fileError = 'Please upload your CV in PDF format.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = '';

    try {
      let cvUrl = '';

      // ── Step 1: Try to upload CV to Firebase Storage (non-blocking) ──
      if (this.storage && this.selectedFile) {
        try {
          const timestamp = Date.now();
          const safeName = this.selectedFile.name.replace(/\s+/g, '_');
          const fileRef = ref(
            this.storage,
            `job-applications/${this.jobTitle.replace(/\s+/g, '_')}/${timestamp}_${safeName}`
          );

          const uploadTask = uploadBytesResumable(fileRef, this.selectedFile);

          cvUrl = await new Promise<string>((resolve, reject) => {
            uploadTask.on(
              'state_changed',
              (snapshot) => {
                this.uploadProgress = Math.round(
                  (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                );
              },
              (error) => reject(error),
              async () => {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
              }
            );
          });
          console.log('CV uploaded successfully:', cvUrl);
        } catch (storageErr: any) {
          // Storage upload failed — log it but continue saving to Firestore
          console.warn('CV upload to Storage failed (saving without URL):', storageErr?.code, storageErr?.message);
          cvUrl = '';
        }
      }

      // ── Step 2: Always save application data to Firestore ──
      const applicationsRef = collection(this.firestore, 'job-applications');
      await addDoc(applicationsRef, {
        position:    this.jobTitle,
        fullName:    this.form.value.fullName,
        email:       this.form.value.email,
        phone:       this.form.value.phone,
        experience:  this.form.value.experience,
        coverLetter: this.form.value.coverLetter || '',
        cvFileName:  this.selectedFile?.name || '',
        cvUrl:       cvUrl,
        appliedAt:   serverTimestamp()
      });

      console.log('Application saved to Firestore successfully!');
      this.submitSuccess = true;

    } catch (err: any) {
      console.error('Firestore write failed:', err?.code, err?.message, err);
      if (err?.code === 'permission-denied') {
        this.submitError = 'Permission denied — please update Firestore rules to allow writes.';
      } else {
        this.submitError = `Submission failed (${err?.code || 'unknown error'}). Please try again.`;
      }
    } finally {
      this.isSubmitting = false;
      this.uploadProgress = 0;
    }
  }

  close() {
    this.closeModal.emit();
  }

  get f() {
    return this.form.controls;
  }
}
