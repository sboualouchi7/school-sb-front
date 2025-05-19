// features/dashboard/enseignant/gestion-absences/gestion-absences.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectionModuleComponent } from './selection-module/selection-module.component';
import { SelectionClasseComponent } from './selection-classe/selection-classe.component';
import { ListeEtudiantsComponent } from './liste-etudiants/liste-etudiants.component';
import { ModuleResponse } from '../../../../core/dto/module/module-response';
import { ClasseResponse } from '../../../../core/dto/classe/classe-response';

@Component({
  selector: 'app-gestion-absences',
  standalone: true,
  imports: [
    CommonModule,
    SelectionModuleComponent,
    SelectionClasseComponent,
    ListeEtudiantsComponent
  ],
  templateUrl: './gestion-absences.component.html',
  styleUrls: ['./gestion-absences.component.css']
})
export class GestionAbsencesComponent {
  // Étape actuelle du workflow
  etapeActuelle: 'module' | 'classe' | 'etudiants' = 'module';

  // Données sélectionnées
  moduleSelectionne: ModuleResponse | null = null;
  classeSelectionnee: ClasseResponse | null = null;

  // Méthode appelée lorsqu'un module est sélectionné
  onModuleSelectionne(module: ModuleResponse): void {
    this.moduleSelectionne = module;
    this.etapeActuelle = 'classe';
    console.log('module ', module);
  }

  // Méthode appelée lorsqu'une classe est sélectionnée
  onClasseSelectionnee(classe: ClasseResponse): void {
    this.classeSelectionnee = classe;
    this.etapeActuelle = 'etudiants';
  }

  // Méthode pour revenir à l'étape précédente
  retourEtapePrecedente(): void {
    if (this.etapeActuelle === 'etudiants') {
      this.etapeActuelle = 'classe';
      this.classeSelectionnee = null;
    } else if (this.etapeActuelle === 'classe') {
      this.etapeActuelle = 'module';
      this.moduleSelectionne = null;
    }
  }
}
