import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';

import { authState } from '@angular/fire/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private auth: Auth) {}

  // ✅ LOGIN
  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  // ✅ REGISTER
  register(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password);
  }

  // ✅ LOGOUT
  logout() {
    return signOut(this.auth);
  }

  // ✅ SESSION TRACKER (CORRECT)
  getUser(): Observable<User | null> {
    return authState(this.auth);
  }
}
