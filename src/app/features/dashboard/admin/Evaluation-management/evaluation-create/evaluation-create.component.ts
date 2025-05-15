import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EvaluationService } from '../../../../../core/services/evaluation.service';
import { ModuleService } from '../../../../../core/services/module.service';
import { EtudiantService } from '../../../../../core/services/etudiant.service';
import { EnseignantService } from '../../../../../core/services/enseignant.service';
import { SessionService } from '../../../../../core/services/session.service';
import { EvaluationRequest } from '../../../../../core/dto/evaluation/evaluation-request';
import { EvaluationResponse } from '../../../../../core/dto/evaluation/evaluation-response';
import { ModuleResponse } from '../../../../../core/dto/module/module-response';
import { EtudiantResponse } from '../../../../../core/dto/etudiant/etudiant-response';
import { EnseignantResponse } from '../../../../../core/dto/enseignant/enseignant-response';
import { SessionResponse } from '../../../../../core/dto/session/session-response';
import { TypeEvaluation } from '../../../../../core/enums/TypeEvaluation';

@Component({
  selector: 'app-evaluation-create',
  templateUrl: './evaluation-create.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./evaluation-create.component.css']
})
export class EvaluationCreateComponent implements OnInit, OnChanges {
  @Output() evaluationCreated = new EventEmitter<void>();
  @Output() evaluationUpdated = new EventEmitter<void>();
  @Input() evaluationToEdit: EvaluationResponse | null = null;

  formEvaluation!: FormGroup;
  modules: ModuleResponse[] = [];
  etudiants: EtudiantResponse[] = [];
  enseignants: EnseignantResponse[] = [];
  sessions: SessionResponse[] = [];
  evaluationTypes = Object.values(TypeEvaluation);
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private evaluationService: EvaluationService,
    private moduleService: ModuleService,
    private etudiantService: EtudiantService,
    private enseignantService: EnseignantService,
    private sessionService: SessionService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadModules();
    this.loadEtudiants();
    this.loadEnseignants();
    this.loadSessions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['evaluationToEdit'] && changes['evaluationToEdit'].currentValue) {
      this.isEditMode = true;
      this.updateFormWithEvaluationData();
    } else if (changes['evaluationToEdit'] && !changes['evaluationToEdit'].currentValue) {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  initForm(): void {
    this.formEvaluation = this.fb.group({
      etudiantId: ['', Validators.required],
      moduleId: ['', Validators.required],
      enseignantId: ['', Validators.required],
      sessionId: ['', Validators.required],
      note: ['', [Validators.required, Validators.min(0), Validators.max(20)]],
      dateEvaluation: ['', Validators.required],
      commentaire: [''],
      type: ['', Validators.required]
    });
  }

  loadModules(): void {
    this.moduleService.getAllModules().subscribe({
      next: (response) => {
        if (response.success) {
          this.modules = response.data;
          console.log('Modules loaded:', this.modules.length);
          if (this.isEditMode && this.evaluationToEdit) {
            this.updateFormWithEvaluationData();
          }
        } else {
          console.error('Failed to load modules:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading modules:', error);
      }
    });
  }

  loadEtudiants(): void {
    this.etudiantService.getAllEtudiants().subscribe({
      next: (response) => {
        if (response.success) {
          this.etudiants = response.data;
          console.log('Etudiants loaded:', this.etudiants.length);
          if (this.isEditMode && this.evaluationToEdit) {
            this.updateFormWithEvaluationData();
          }
        } else {
          console.error('Failed to load etudiants:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading etudiants:', error);
      }
    });
  }

  loadEnseignants(): void {
    this.enseignantService.getAllEnseignants().subscribe({
      next: (response) => {
        if (response.success) {
          this.enseignants = response.data;
          console.log('Enseignants loaded:', this.enseignants.length);
          if (this.isEditMode && this.evaluationToEdit) {
            this.updateFormWithEvaluationData();
          }
        } else {
          console.error('Failed to load enseignants:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading enseignants:', error);
      }
    });
  }

  loadSessions(): void {
    this.sessionService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.sessions = response.data;
          console.log('Sessions loaded:', this.sessions.length);
          if (this.isEditMode && this.evaluationToEdit) {
            this.updateFormWithEvaluationData();
          }
        } else {
          console.error('Failed to load sessions:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading sessions:', error);
      }
    });
  }

  updateFormWithEvaluationData(): void {
    if (!this.evaluationToEdit || !this.formEvaluation) return;

    // Convert date format if needed
    let dateEvaluation = this.evaluationToEdit.dateEvaluation;
    if (dateEvaluation && dateEvaluation.includes('-')) {
      const parts = dateEvaluation.split('-');
      if (parts.length === 3 && parts[0].length === 2) {
        dateEvaluation = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    this.formEvaluation.patchValue({
      etudiantId: this.evaluationToEdit.etudiantId,
      moduleId: this.evaluationToEdit.moduleId,
      enseignantId: this.evaluationToEdit.enseignantId,
      sessionId: this.evaluationToEdit.sessionId,
      note: this.evaluationToEdit.note,
      dateEvaluation: dateEvaluation,
      commentaire: this.evaluationToEdit.commentaire || '',
      type: this.evaluationToEdit.type
    });
  }

  onSubmit(): void {
    if (this.formEvaluation.valid) {
      if (this.isEditMode) {
        this.updateEvaluation();
      } else {
        this.createEvaluation();
      }
    } else {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.formEvaluation.controls).forEach(key => {
        const control = this.formEvaluation.get(key);
        control?.markAsTouched();
      });
    }
  }

  createEvaluation(): void {
    const dateEvaluationInput = this.formEvaluation.value.dateEvaluation;
    const dateEvaluation = this.formatDateForBackend(dateEvaluationInput);

    const newEvaluation: EvaluationRequest = {
      etudiantId: this.formEvaluation.value.etudiantId,
      moduleId: this.formEvaluation.value.moduleId,
      enseignantId: this.formEvaluation.value.enseignantId,
      sessionId: this.formEvaluation.value.sessionId,
      note: this.formEvaluation.value.note,
      dateEvaluation: dateEvaluation,
      commentaire: this.formEvaluation.value.commentaire || undefined,
      type: this.formEvaluation.value.type
    };

    this.evaluationService.create(newEvaluation).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Evaluation created successfully:', response.data);
          this.resetForm();
          this.evaluationCreated.emit();
        } else {
          console.error('Failed to create evaluation:', response.message);
        }
      },
      error: (error) => {
        console.error('Error creating evaluation:', error);
      }
    });
  }

  updateEvaluation(): void {
    if (!this.evaluationToEdit) return;

    const dateEvaluationInput = this.formEvaluation.value.dateEvaluation;
    const dateEvaluation = this.formatDateForBackend(dateEvaluationInput);

    const updatedEvaluation: EvaluationRequest = {
      etudiantId: this.formEvaluation.value.etudiantId,
      moduleId: this.formEvaluation.value.moduleId,
      enseignantId: this.formEvaluation.value.enseignantId,
      sessionId: this.formEvaluation.value.sessionId,
      note: this.formEvaluation.value.note,
      dateEvaluation: dateEvaluation,
      commentaire: this.formEvaluation.value.commentaire || undefined,
      type: this.formEvaluation.value.type
    };

    this.evaluationService.update(this.evaluationToEdit.id, updatedEvaluation).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Evaluation updated successfully:', response.data);
          this.resetForm();
          this.isEditMode = false;
          this.evaluationUpdated.emit();
        } else {
          console.error('Failed to update evaluation:', response.message);
        }
      },
      error: (error) => {
        console.error('Error updating evaluation:', error);
      }
    });
  }

  private formatDateForBackend(dateString: string): string {
    if (!dateString) return '';

    const parts = dateString.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
        return dateString;
      }
    }
    return dateString;
  }

  resetForm(): void {
    this.formEvaluation.reset();
    this.initForm();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.resetForm();
  }

  // Helper method to format type for display
  formatType(type: string): string {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }
}