import { Injectable } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {


  user$: Observable<User | null>;

  constructor(private auth: Auth) {
    this.user$ = authState(this.auth);
  }

  constructor(private auth: Auth) {}


  login(email: string, password: string) {
    return signInWithEmailAndPassword(
      this.auth,
      email,
      password
    );
  }

  register(email: string, password: string) {
    return createUserWithEmailAndPassword(
      this.auth,
      email,
      password
    );
  }

  logout() {
    return signOut(this.auth);
  }

  getUser() {
    return this.user$;
  }
  //logged in or not
  isLoggedIn(): Observable<boolean> {
    return this.user$.pipe(
      map(user => !!user) // Convert user object to boolean
    );
  }

}
