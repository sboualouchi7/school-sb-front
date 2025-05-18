// src/app/features/dashboard/parent/notes-enfant/notes-enfant.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentDashboardService } from '../../../../core/services/parent-dashboard.service';
import { EtudiantResponse } from '../../../../core/dto/etudiant/etudiant-response';
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
  selector: 'app-notes-enfant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes-enfant.component.html',
  styleUrls: ['./notes-enfant.component.css']
})
export class NotesEnfantComponent implements OnInit, OnChanges {
  @Input() enfant!: EtudiantResponse;

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

  constructor(private parentService: ParentDashboardService) {}

  ngOnInit(): void {
    if (this.enfant) {
      this.loadModules();
      this.loadEvaluations();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['enfant'] && this.enfant) {
      this.resetFilters();
      this.loadModules();
      this.loadEvaluations();
    }
  }

  loadModules(): void {
    if (!this.enfant) return;

    this.isLoading.modules = true;
    this.error.modules = null;

    this.parentService.getModulesEnfant(this.enfant.id).subscribe({
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
    if (!this.enfant) return;

    this.isLoading.evaluations = true;
    this.error.evaluations = null;

    if (this.selectedModuleId) {
      // Filtrer par module
      this.parentService.getNotesEnfantParModule(this.enfant.id, this.selectedModuleId)
        .subscribe(this.handleEvaluationsResponse.bind(this));
    } else {
      // Charger toutes les évaluations
      this.parentService.getNotesEnfant(this.enfant.id)
        .subscribe(this.handleEvaluationsResponse.bind(this));
    }
  }

  handleEvaluationsResponse(response: any): void {
    if (response.success) {
      this.evaluations = response.data;
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
      group.evaluations.sort((a, b) =>
        new Date(b.dateEvaluation).getTime() - new Date(a.dateEvaluation).getTime()
      );
    });
  }

  loadModuleMoyenne(moduleId: number): void {
    if (!this.enfant) return;

    this.isLoading.moyenne = true;
    this.error.moyenne = null;

    this.parentService.getMoyenneEnfantParModule(this.enfant.id, moduleId).subscribe({
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
    this.groupedEvaluations = {};
    this.evaluations = [];
    this.error = {
      evaluations: null,
      modules: null,
      moyenne: null
    };
  }

  // Helper pour récupérer les clés d'objet
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  // Formatter la date pour l'affichage
  formatDateForDisplay(dateString: string): string {
    if (!dateString) return '';

    try {
      let dateObject: Date;

      if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
        const parts = dateString.split('-');
        dateObject = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dateObject = new Date(dateString);
      } else if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        const parts = dateString.split('/');
        dateObject = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        dateObject = new Date(dateString);
      }

      if (isNaN(dateObject.getTime())) {
        return 'Date invalide';
      }

      return dateObject.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Date invalide';
    }
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

  // Calculer la moyenne générale de l'enfant
  calculateMoyenneGenerale(): number | null {
    const moyennes = Object.values(this.groupedEvaluations)
      .map(group => group.moyenne)
      .filter(moyenne => moyenne !== null) as number[];

    if (moyennes.length === 0) return null;

    const total = moyennes.reduce((sum, moyenne) => sum + moyenne, 0);
    return Math.round((total / moyennes.length) * 100) / 100;
  }

  // Compter le nombre total d'évaluations
  getTotalEvaluations(): number {
    return this.evaluations.length;
  }

  // Compter les évaluations par module sélectionné
  getEvaluationsCountForModule(): number {
    if (this.selectedModuleId && this.groupedEvaluations[this.selectedModuleId]) {
      return this.groupedEvaluations[this.selectedModuleId].evaluations.length;
    }
    return this.getTotalEvaluations();
  }

  // Obtenir la note maximale d'un ensemble d'évaluations
  getMaxNote(evaluations: EvaluationResponse[]): number {
    if (evaluations.length === 0) return 0;
    return Math.max(...evaluations.map(evals => evals.note));
  }

  // Obtenir la note minimale d'un ensemble d'évaluations
  getMinNote(evaluations: EvaluationResponse[]): number {
    if (evaluations.length === 0) return 0;
    return Math.min(...evaluations.map(evals => evals.note));
  }
}
