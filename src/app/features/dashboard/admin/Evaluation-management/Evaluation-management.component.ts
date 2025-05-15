import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationListComponent } from './evaluation-list/evaluation-list.component';
import { EvaluationCreateComponent } from './evaluation-create/evaluation-create.component';
import { ModuleResponse } from '../../../../core/dto/module/module-response';
import { ClasseResponse } from '../../../../core/dto/classe/classe-response';
import { ModuleService } from '../../../../core/services/module.service';
import { ClasseService } from '../../../../core/services/classe.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EvaluationResponse } from '../../../../core/dto/evaluation/evaluation-response';

@Component({
  selector: 'app-evaluation-management',
  templateUrl: './evaluation-management.component.html',
  standalone: true,
  imports: [
    CommonModule,
    EvaluationListComponent,
    EvaluationCreateComponent,
    ReactiveFormsModule
  ],
  styleUrls: ['./evaluation-management.component.css']
})
export class EvaluationManagementComponent implements OnInit {
  @ViewChild(EvaluationListComponent) listComponent!: EvaluationListComponent;
  
  showModal = false;
  evaluationToEdit: EvaluationResponse | null = null;
  
  modules: ModuleResponse[] = [];
  classes: ClasseResponse[] = [];
  filterForm: FormGroup;
  
  constructor(
    private moduleService: ModuleService,
    private classeService: ClasseService,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      moduleId: ['', Validators.required],
      classeId: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadModules();
    this.loadClasses();
    
    // Listen for changes to moduleId to filter evaluations
    this.filterForm.get('moduleId')?.valueChanges.subscribe(moduleId => {
      if (moduleId && this.filterForm.get('classeId')?.value) {
        this.filterEvaluations();
      }
    });
    
    // Listen for changes to classeId to filter evaluations
    this.filterForm.get('classeId')?.valueChanges.subscribe(classeId => {
      if (classeId && this.filterForm.get('moduleId')?.value) {
        this.filterEvaluations();
      }
    });
  }

  loadModules(): void {
    this.moduleService.getAllModules().subscribe({
      next: (response) => {
        if (response.success) {
          this.modules = response.data;
          console.log('Modules loaded:', this.modules.length);
        } else {
          console.error('Failed to load modules:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading modules:', error);
      }
    });
  }

  loadClasses(): void {
    this.classeService.getAllClasses().subscribe({
      next: (response) => {
        if (response.success) {
          this.classes = response.data;
          console.log('Classes loaded:', this.classes.length);
        } else {
          console.error('Failed to load classes:', response.message);
        }
      },
      error: (error) => {
        console.error('Error loading classes:', error);
      }
    });
  }

  filterEvaluations(): void {
    const moduleId = this.filterForm.get('moduleId')?.value;
    const classeId = this.filterForm.get('classeId')?.value;
    
    if (moduleId && classeId && this.listComponent) {
      this.listComponent.loadEvaluationsByModuleAndClasse(moduleId, classeId);
    }
  }

  resetFilters(): void {
    this.filterForm.reset();
    if (this.listComponent) {
      this.listComponent.loadAllEvaluations();
    }
  }

  openModal(): void {
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    this.showModal = false;
    this.evaluationToEdit = null;
    document.body.style.overflow = 'auto';
  }

  onEvaluationCreated(): void {
    this.closeModal();
    this.refreshEvaluationList();
  }

  onEvaluationUpdated(): void {
    this.closeModal();
    this.refreshEvaluationList();
  }

  onEditEvaluation(evaluation: EvaluationResponse): void {
    this.evaluationToEdit = evaluation;
    this.openModal();
  }

  refreshEvaluationList(): void {
    if (this.listComponent) {
      const moduleId = this.filterForm.get('moduleId')?.value;
      const classeId = this.filterForm.get('classeId')?.value;
      
      if (moduleId && classeId) {
        this.listComponent.loadEvaluationsByModuleAndClasse(moduleId, classeId);
      } else {
        this.listComponent.loadAllEvaluations();
      }
    }
  }
}