// src/app/features/dashboard/etudiant/notes/notes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EtudiantDashboardService } from '../../../../core/services/etudiant-dashboard.service';
import { EvaluationResponse } from '../../../../core/dto/evaluation/evaluation-response';
import { ModuleResponse } from '../../../../core/dto/module/module-response';

interface GroupedEvaluations {
  [key: string]: {
    module: string;
    moduleId: number;
    moyenne: number | null;
    evaluations: EvaluationResponse[];
  }
}

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.css']
})
export class NotesComponent implements OnInit {
  evaluations: EvaluationResponse[] = [];
  modules: ModuleResponse[] = [];
  groupedEvaluations: GroupedEvaluations = {};

  selectedModuleId: number | null = null;

  isLoading = {
    evaluations: false,
    modules: false,
    moyenne: false
  };

  error: {
    evaluations: string | null,
    modules: string | null,
    moyenne: string | null
  } = {
    evaluations: null,
    modules: null,
    moyenne: null
  };

  constructor(private etudiantService: EtudiantDashboardService) {}

  ngOnInit(): void {
    this.loadModules();
    this.loadEvaluations();
  }

  loadModules(): void {
    this.isLoading.modules = true;
    this.error.modules = null;

    this.etudiantService.getMesModules().subscribe({
      next: (response) => {
        if (response.success) {
          this.modules = response.data;
        } else {
          this.error.modules = response.message || 'Erreur lors du chargement des modules';
        }
        this.isLoading.modules = false;
      },
      error: (err) => {
        this.error.modules = 'Erreur de connexion au serveur';
        this.isLoading.modules = false;
        console.error('Erreur lors du chargement des modules:', err);
      }
    });
  }

  loadEvaluations(): void {
    this.isLoading.evaluations = true;
    this.error.evaluations = null;

    if (this.selectedModuleId) {
      // Filtrer par module
      this.etudiantService.getMesNotesParModule(this.selectedModuleId).subscribe(this.handleEvaluationsResponse.bind(this));
    } else {
      // Charger toutes les évaluations
      this.etudiantService.getMesNotes().subscribe(this.handleEvaluationsResponse.bind(this));
    }
  }

  handleEvaluationsResponse(response: any): void {
    if (response.success) {
      this.evaluations = response.data;
      // Grouper les évaluations par module
      this.groupEvaluationsByModule();
    } else {
      this.error.evaluations = response.message || 'Erreur lors du chargement des évaluations';
    }
    this.isLoading.evaluations = false;
  }

  groupEvaluationsByModule(): void {
    this.groupedEvaluations = {};

    this.evaluations.forEach(evaluation => {
      const moduleId = evaluation.moduleId;
      const moduleLibelle = evaluation.libelleModule;

      if (!this.groupedEvaluations[moduleId]) {
        this.groupedEvaluations[moduleId] = {
          module: moduleLibelle,
          moduleId: moduleId,
          moyenne: null,
          evaluations: []
        };

        // Charger la moyenne pour ce module
        this.loadModuleMoyenne(moduleId);
      }

      this.groupedEvaluations[moduleId].evaluations.push(evaluation);
    });

    // Trier les évaluations par date (de la plus récente à la plus ancienne)
    Object.values(this.groupedEvaluations).forEach(group => {
      group.evaluations.sort((a, b) => new Date(b.dateEvaluation).getTime() - new Date(a.dateEvaluation).getTime());
    });
  }

  loadModuleMoyenne(moduleId: number): void {
    this.isLoading.moyenne = true;
    this.error.moyenne = null;

    this.etudiantService.getMaMoyenneParModule(moduleId).subscribe({
      next: (response) => {
        if (response.success) {
          if (this.groupedEvaluations[moduleId]) {
            this.groupedEvaluations[moduleId].moyenne = response.data;
          }
        } else {
          this.error.moyenne = response.message || 'Erreur lors du chargement de la moyenne';
        }
        this.isLoading.moyenne = false;
      },
      error: (err) => {
        this.error.moyenne = 'Erreur de connexion au serveur';
        this.isLoading.moyenne = false;
        console.error('Erreur lors du chargement de la moyenne:', err);
      }
    });
  }

  onModuleChange(): void {
    this.loadEvaluations();
  }

  resetFilters(): void {
    this.selectedModuleId = null;
    this.loadEvaluations();
  }

  // Helper pour récupérer les clés d'objet
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  // Formatter la date pour l'affichage
  formatDateForDisplay(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Formatter le type d'évaluation pour l'affichage
  formatEvaluationType(type: string): string {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  // Obtenir la couleur de la note
  getNoteColorClass(note: number): string {
    if (note < 8) return 'note-very-low';
    if (note < 10) return 'note-low';
    if (note < 12) return 'note-medium';
    if (note < 14) return 'note-good';
    if (note < 16) return 'note-very-good';
    return 'note-excellent';
  }

  // Obtenir la couleur de la moyenne
  getMoyenneColorClass(moyenne: number | null): string {
    if (moyenne === null) return '';
    return this.getNoteColorClass(moyenne);
  }
}
