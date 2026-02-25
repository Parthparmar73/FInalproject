import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ContactService {
  
  private apiurl = 'http://localhost:5000/api/contact'; // Express backend URL

  constructor(private http: HttpClient) {}

  submitForm(data: any) {
    return this.http.post(this.apiurl, data);
  }
}
