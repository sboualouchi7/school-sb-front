// src/app/features/dashboard/parent/parent.routes.ts
import { Routes } from '@angular/router';
import { TableauBordComponent } from './tableau-bord/tableau-bord.component';
import { NotesEnfantComponent } from './notes-enfant/notes-enfant.component';
import { AbsencesEnfantComponent } from './absences-enfant/absences-enfant.component';

export const PARENT_ROUTES: Routes = [
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
    path: 'notes-enfant',
    component: NotesEnfantComponent
  },
  {
    path: 'absences-enfant',
    component: AbsencesEnfantComponent
  }
];
