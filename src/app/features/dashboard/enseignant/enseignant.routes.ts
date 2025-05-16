// features/dashboard/enseignant/enseignant.routes.ts
import { Routes } from '@angular/router';
import { GestionAbsencesComponent } from './gestion-absences/gestion-absences.component';
import { GestionNotesComponent } from './gestion-notes/gestion-notes.component';

export const ENSEIGNANT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'absences',
    pathMatch: 'full'
  },
  {
    path: 'absences',
    component: GestionAbsencesComponent
  },
  {
    path: 'notes',
    component: GestionNotesComponent
  }
];
