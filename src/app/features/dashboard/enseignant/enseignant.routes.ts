// features/dashboard/enseignant/enseignant.routes.ts - Mise à jour
import { Routes } from '@angular/router';
import { GestionAbsencesComponent } from './gestion-absences/gestion-absences.component';
import { GestionNotesComponent } from './gestion-notes/gestion-notes.component';
import { WidgetNotesRecentesComponent } from "./dashboard/widget-notes-recentes/widget-notes-recentes.component";
import { SeancesEnseignantComponent } from './seances-enseignant/seances-enseignant.component';

export const ENSEIGNANT_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'tableau-bord',
    pathMatch: 'full'
  },
  {
    path: 'tableau-bord',
    component: WidgetNotesRecentesComponent
  },
  {
    path: 'absences',
    component: GestionAbsencesComponent
  },
  {
    path: 'notes',
    component: GestionNotesComponent
  },
  {
    path: 'evaluations',
    redirectTo: 'notes',
    pathMatch: 'full'
  },
  {
    path: 'seances',
    component: SeancesEnseignantComponent
  }
];
