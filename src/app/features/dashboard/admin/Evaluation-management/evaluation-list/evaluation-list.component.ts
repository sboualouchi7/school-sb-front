import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { EvaluationResponse } from '../../../../../core/dto/evaluation/evaluation-response';
import { EvaluationService } from '../../../../../core/services/evaluation.service';
import { EtudiantService } from '../../../../../core/services/etudiant.service';
import { EtudiantResponse } from '../../../../../core/dto/etudiant/etudiant-response';

@Component({
  selector: 'app-evaluation-list',
  templateUrl: './evaluation-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatSortModule
  ],
  styleUrls: ['./evaluation-list.component.css']
})
export class EvaluationListComponent implements OnInit {
  displayedColumns: string[] = ['id', 'nomEtudiant', 'libelleModule', 'type', 'dateEvaluation', 'note', 'commentaire', 'estValidee', 'actions'];
  evaluations: EvaluationResponse[] = [];
  etudiants: EtudiantResponse[] = [];
  filteredEtudiants: EtudiantResponse[] = [];
  
  showDeleteConfirmation = false;
  evaluationIdToDelete: number | null = null;

  @Output() editEvaluationEvent = new EventEmitter<EvaluationResponse>();

  constructor(
    private evaluationService: EvaluationService,
    private etudiantService: EtudiantService
  ) {}

  ngOnInit(): void {
    this.loadAllEvaluations();
    this.loadAllEtudiants();
  }

  loadAllEvaluations(): void {
    this.evaluationService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.evaluations = response.data;
          console.log('Evaluations loaded:', this.evaluations.length);
        } else {
          console.error('Failed to load evaluations:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading evaluations:', error);
      }
    });
  }

  loadAllEtudiants(): void {
    this.etudiantService.getAllEtudiants().subscribe({
      next: (response) => {
        if (response.success) {
          this.etudiants = response.data;
          this.filteredEtudiants = this.etudiants;
          console.log('Etudiants loaded:', this.etudiants.length);
        } else {
          console.error('Failed to load etudiants:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading etudiants:', error);
      }
    });
  }

  loadEvaluationsByModule(moduleId: number): void {
    this.evaluationService.getByModule(moduleId).subscribe({
      next: (response) => {
        if (response.success) {
          this.evaluations = response.data;
          console.log(`Evaluations for module ${moduleId}:`, this.evaluations.length);
        } else {
          console.error(`Failed to load evaluations for module ${moduleId}:`, response.message);
        }
      },
      error: (error) => {
        console.error(`Error loading evaluations for module ${moduleId}:`, error);
      }
    });
  }

  loadEvaluationsByModuleAndClasse(moduleId: number, classeId: number): void {
    // First, filter students by class
    this.etudiantService.getEtudiantsByClasseId(classeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.filteredEtudiants = response.data;
          const etudiantIds = this.filteredEtudiants.map(e => e.id);
          
          // Then, get all evaluations for the module
          this.evaluationService.getByModule(moduleId).subscribe({
            next: (evalResponse) => {
              if (evalResponse.success) {
                // Filter evaluations for students in the specified class
                this.evaluations = evalResponse.data.filter(evals => 
                  etudiantIds.includes(evals.etudiantId)
                );
                console.log(`Filtered evaluations for module ${moduleId} and classe ${classeId}:`, this.evaluations.length);
              } else {
                console.error(`Failed to load evaluations for module ${moduleId}:`, evalResponse.message);
              }
            },
            error: (error) => {
              console.error(`Error loading evaluations for module ${moduleId}:`, error);
            }
          });
        } else {
          console.error(`Failed to load students for class ${classeId}:`, response.message);
        }
      },
      error: (error) => {
        console.error(`Error loading students for class ${classeId}:`, error);
      }
    });
  }

  editEvaluation(evaluation: EvaluationResponse): void {
    this.editEvaluationEvent.emit(evaluation);
  }

  deleteEvaluation(id: number): void {
    this.evaluationIdToDelete = id;
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.evaluationIdToDelete = null;
  }

  confirmDelete(): void {
    if (this.evaluationIdToDelete) {
      this.evaluationService.delete(this.evaluationIdToDelete).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Evaluation deleted successfully');
            this.loadAllEvaluations(); // Reload the list
          } else {
            console.error('Failed to delete evaluation:', response.message);
          }
          this.showDeleteConfirmation = false;
          this.evaluationIdToDelete = null;
        },
        error: (error) => {
          console.error('Error deleting evaluation:', error);
          this.showDeleteConfirmation = false;
          this.evaluationIdToDelete = null;
        }
      });
    }
  }

  validateEvaluation(id: number, estValidee: boolean): void {
    this.evaluationService.valider(id, !estValidee).subscribe({
      next: (response) => {
        if (response.success) {
          console.log(`Evaluation ${id} ${estValidee ? 'invalidated' : 'validated'} successfully`);
          // Update the evaluation status in the current list
          const index = this.evaluations.findIndex(e => e.id === id);
          if (index !== -1) {
            this.evaluations[index].estValidee = !estValidee;
          }
        } else {
          console.error(`Failed to ${estValidee ? 'invalidate' : 'validate'} evaluation:`, response.message);
        }
      },
      error: (error) => {
        console.error(`Error ${estValidee ? 'invalidating' : 'validating'} evaluation:`, error);
      }
    });
  }

  // Helper method to format type for display
  formatType(type: string): string {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
}