// src/app/features/dashboard/etudiant/etudiant.routes.ts
import { Routes } from '@angular/router';
import { TableauBordComponent } from './tableau-bord/tableau-bord.component';
import { AbsencesComponent } from './absences/absences.component';
import { NotesComponent } from './notes/notes.component';
import { DemandesComponent } from './demandes/demandes.component';

export const ETUDIANT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'tableau-bord',
    pathMatch: 'full'
  },
  {
    path: 'tableau-bord',
    component: TableauBordComponent
  },
  {
    path: 'absences',
    component: AbsencesComponent
  },
  {
    path: 'notes',
    component: NotesComponent
  },
  {
    path: 'demandes',
    component: DemandesComponent
  }
];
