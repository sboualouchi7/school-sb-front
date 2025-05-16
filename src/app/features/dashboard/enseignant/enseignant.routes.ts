// features/dashboard/enseignant/enseignant.routes.ts
import { Routes } from '@angular/router';
import { GestionAbsencesComponent } from './gestion-absences/gestion-absences.component';

export const ENSEIGNANT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'absences',
    pathMatch: 'full'
  },
  {
    path: 'absences',
    component: GestionAbsencesComponent
  }
  // Vous pouvez ajouter d'autres routes pour les fonctionnalités à venir
];
