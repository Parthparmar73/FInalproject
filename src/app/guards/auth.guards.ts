import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { authState } from '@angular/fire/auth';
import { map } from 'rxjs';

export const AuthGuard: CanActivateFn = () => {

  const auth = inject(Auth);
  const router = inject(Router);

  return authState(auth).pipe(

    map(user => {

      if (user) return true;

      alert('Please login first ❗');

      router.navigate(['/login']);

      return false;

    })

  );
};
