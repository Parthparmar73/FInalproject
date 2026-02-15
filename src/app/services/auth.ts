import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Firebase not available in this build — provide safe stubs so the app compiles.
  private readonly _unavailableMessage = 'Firebase is not installed in this build.';

  constructor() {}

  // LOGIN — preserve API surface by returning a rejected Promise
  login(email: string, password: string): Promise<never> {
    return Promise.reject(new Error(this._unavailableMessage));
  }

  // REGISTER
  register(email: string, password: string): Promise<never> {
    return Promise.reject(new Error(this._unavailableMessage));
  }

  // LOGOUT
  logout(): Promise<never> {
    return Promise.reject(new Error(this._unavailableMessage));
  }

  // SESSION TRACKER — emits `null` so consumers treat user as unauthenticated
  getUser(): Observable<any | null> {
    return of(null);
  }
}
