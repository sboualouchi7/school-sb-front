// src/app/core/guards/role-redirect.guard.ts
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { CanActivateFn } from '@angular/router';

export const RoleRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const userRole = authService.getCurrentUserRole();

  switch (userRole) {
    case 'ADMIN':
      router.navigate(['/dashboard/admin']);
      break;
    case 'ENSEIGNANT':
      router.navigate(['/dashboard/enseignant']);
      break;
    case 'ETUDIANT':
      router.navigate(['/dashboard/etudiant']);
      break;
    case 'PARENT':
      router.navigate(['/dashboard/parent']);
      break;
    default:
      router.navigate(['/unauthorized']);
  }

  return false;
};
