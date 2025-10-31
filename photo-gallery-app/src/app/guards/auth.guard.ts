import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = () => {
  const msalService = inject(MsalService);
  const router = inject(Router);

  return msalService.handleRedirectObservable().pipe(
    map(() => {
      const accounts = msalService.instance.getAllAccounts();
      if (accounts.length > 0) {
        msalService.instance.setActiveAccount(accounts[0]);
        return true;
      }
      router.navigate(['/login']);
      return false;
    })
  );
};
