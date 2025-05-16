import { Routes } from '@angular/router';
import { HomeComponent } from './shared/pages/home/home.component';
import { RoleRedirectGuard } from './core/guards/role-redirect.guard';
import { authGuard } from './core/guards/auth.guard';
import { Role } from './core/enums/Role';
import {roleGuard} from "./core/guards/role.guard";
import {DashboardComponent} from "./shared/layout/dashboard/dashboard.component";
import { UnauthorizedComponent } from './shared/pages/unauthorized/unauthorized.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        canActivate: [RoleRedirectGuard],
        loadComponent: () => import('./shared/layout/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./features/dashboard/admin/admin.module').then(m => m.AdminModule),
        canActivate: [authGuard, roleGuard([Role.ADMIN])]
      },
      {
        path: 'enseignant',
        loadChildren: () =>
          import('./features/dashboard/enseignant/enseignant.routes').then(m => m.ENSEIGNANT_ROUTES),
        canActivate: [authGuard, roleGuard([Role.ENSEIGNANT])]
      },
      {
        path: 'etudiant',
        loadChildren: () =>
          import('./features/dashboard/etudiant/etudiant.routes').then(m => m.ETUDIANT_ROUTES),
        canActivate: [authGuard, roleGuard([Role.ETUDIANT])]
      },
      {
        path: 'parent',
        loadChildren: () =>
          import('./features/dashboard/parent/parent.routes').then(m => m.PARENT_ROUTES),
        canActivate: [authGuard, roleGuard([Role.PARENT])]
      }
    ]
  },
  {
    path: 'home',
    component: HomeComponent
  },// app.routes.ts - Assurez-vous que cette route existe
  {
    path: 'dashboard/enseignant',
    loadChildren: () =>
      import('./features/dashboard/enseignant/enseignant.routes').then(m => m.ENSEIGNANT_ROUTES),
    canActivate: [authGuard, roleGuard([Role.ENSEIGNANT])]
  },
  {
    path: 'unauthorized',
    component: UnauthorizedComponent
  },
];
