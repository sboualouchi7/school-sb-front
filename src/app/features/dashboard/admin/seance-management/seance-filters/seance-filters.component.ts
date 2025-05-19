import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EnseignantService } from '../../../../../core/services/enseignant.service';
import { ModuleService } from '../../../../../core/services/module.service';
import { EnseignantResponse } from '../../../../../core/dto/enseignant/enseignant-response';
import { ModuleResponse } from '../../../../../core/dto/module/module-response';
import { StatusSeance } from '../../../../../core/enums/StatusSeance';
import { SeanceFilters } from '../seance-management.component';

@Component({
  selector: 'app-seance-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './seance-filters.component.html',
  styleUrls: ['./seance-filters.component.css']
})
export class SeanceFiltersComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<SeanceFilters>();

  filterForm!: FormGroup;
  enseignants: EnseignantResponse[] = [];
  modules: ModuleResponse[] = [];
  allModules: ModuleResponse[] = [];
  statusOptions = Object.values(StatusSeance);

  constructor(
    private fb: FormBuilder,
    private enseignantService: EnseignantService,
    private moduleService: ModuleService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEnseignants();
    this.loadModules();
    this.setupFormSubscriptions();
  }

  initForm(): void {
    // Calculer le début de la semaine courante (lundi)
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    const mondayStr = monday.toISOString().split('T')[0];

    this.filterForm = this.fb.group({
      semaine: [mondayStr],
      enseignantId: [''],
      moduleId: [''],
      statut: ['']
    });
  }

  setupFormSubscriptions(): void {
    // Émettre les changements de filtres
    this.filterForm.valueChanges.subscribe(() => {
      this.emitFilters();
    });

    // Filtrer les modules quand l'enseignant change
    this.filterForm.get('enseignantId')?.valueChanges.subscribe(enseignantId => {
      this.filterModulesByEnseignant(enseignantId);
    });
  }

  loadEnseignants(): void {
    this.enseignantService.getAllEnseignants().subscribe({
      next: (response) => {
        if (response.success) {
          this.enseignants = response.data;
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des enseignants:', error);
      }
    });
  }

  loadModules(): void {
    this.moduleService.getAllModules().subscribe({
      next: (response) => {
        if (response.success) {
          this.allModules = response.data;
          this.modules = [...this.allModules];
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des modules:', error);
      }
    });
  }

  filterModulesByEnseignant(enseignantId: number | null): void {
    if (!enseignantId) {
      this.modules = [...this.allModules];
    } else {
      this.modules = this.allModules.filter(module =>
        module.enseignantId === enseignantId
      );
    }

    // Réinitialiser le module sélectionné si nécessaire
    const currentModuleId = this.filterForm.get('moduleId')?.value;
    if (currentModuleId && !this.modules.find(m => m.id === currentModuleId)) {
      this.filterForm.patchValue({ moduleId: '' });
    }
  }

  emitFilters(): void {
    const filters: SeanceFilters = {};
    const formValue = this.filterForm.value;

    if (formValue.semaine) filters.semaine = formValue.semaine;
    if (formValue.enseignantId) filters.enseignantId = formValue.enseignantId;
    if (formValue.moduleId) filters.moduleId = formValue.moduleId;
    if (formValue.statut) filters.statut = formValue.statut;

    this.filtersChanged.emit(filters);
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.initForm();
    this.modules = [...this.allModules];
  }

  formatStatus(status: string): string {
    switch (status) {
      case StatusSeance.PLANIFIEE:
        return 'Planifiée';
      case StatusSeance.APPROUVEE:
        return 'Approuvée';
      case StatusSeance.REALISEE:
        return 'Réalisée';
      case StatusSeance.ANNULEE:
        return 'Annulée';
      default:
        return status;
    }
  }

  // Méthodes utilitaires pour les dates
  getCurrentWeek(): string {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday.toISOString().split('T')[0];
  }

  getNextWeek(): string {
    const monday = new Date(this.getCurrentWeek());
    monday.setDate(monday.getDate() + 7);
    return monday.toISOString().split('T')[0];
  }

  getPreviousWeek(): string {
    const monday = new Date(this.getCurrentWeek());
    monday.setDate(monday.getDate() - 7);
    return monday.toISOString().split('T')[0];
  }

  setWeek(weekOffset: number): void {
    const currentWeek = new Date(this.filterForm.get('semaine')?.value || this.getCurrentWeek());
    currentWeek.setDate(currentWeek.getDate() + (weekOffset * 7));
    this.filterForm.patchValue({
      semaine: currentWeek.toISOString().split('T')[0]
    });
  }
}
