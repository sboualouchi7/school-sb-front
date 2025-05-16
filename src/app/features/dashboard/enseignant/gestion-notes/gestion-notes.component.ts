// features/dashboard/enseignant/gestion-notes/gestion-notes.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectionModuleComponent } from './selection-module/selection-module.component';
import { SelectionClasseComponent } from './selection-classe/selection-classe.component';
import { TableauNotesComponent } from './tableau-notes/tableau-notes.component';
import { ModuleResponse } from '../../../../core/dto/module/module-response';
import { ClasseResponse } from '../../../../core/dto/classe/classe-response';

@Component({
  selector: 'app-gestion-notes',
  standalone: true,
  imports: [
    CommonModule,
    SelectionModuleComponent,
    SelectionClasseComponent,
    TableauNotesComponent
  ],
  templateUrl: './gestion-notes.component.html',
  styleUrls: ['./gestion-notes.component.css']
})
export class GestionNotesComponent {
  // Étape actuelle du workflow
  etapeActuelle: 'module' | 'classe' | 'notes' = 'module';

  // Données sélectionnées
  moduleSelectionne: ModuleResponse | null = null;
  classeSelectionnee: ClasseResponse | null = null;

  // Méthode appelée lorsqu'un module est sélectionné
  onModuleSelectionne(module: ModuleResponse): void {
    this.moduleSelectionne = module;
    this.etapeActuelle = 'classe';
  }

  // Méthode appelée lorsqu'une classe est sélectionnée
  onClasseSelectionnee(classe: ClasseResponse): void {
    this.classeSelectionnee = classe;
    this.etapeActuelle = 'notes';
  }

  // Méthode pour revenir à l'étape précédente
  retourEtapePrecedente(): void {
    if (this.etapeActuelle === 'notes') {
      this.etapeActuelle = 'classe';
      this.classeSelectionnee = null;
    } else if (this.etapeActuelle === 'classe') {
      this.etapeActuelle = 'module';
      this.moduleSelectionne = null;
    }
  }
}
