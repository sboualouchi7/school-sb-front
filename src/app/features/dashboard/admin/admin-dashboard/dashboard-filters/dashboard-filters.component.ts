// dashboard-filters.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

export interface DashboardFilters {
  periode?: string;
  statut?: string;
  anneeScolaire?: string;
}

@Component({
  selector: 'app-dashboard-filters',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard-filters.component.html',
  styleUrls: ['./dashboard-filters.component.css']
})
export class DashboardFiltersComponent implements OnInit {
  @Output() filtersChanged = new EventEmitter<DashboardFilters>();

  filterForm!: FormGroup;

  periodeOptions = [
    { value: '', label: 'Toutes les périodes' },
    { value: 'week', label: 'Cette semaine' },
    { value: 'month', label: 'Ce mois' },
    { value: 'semester', label: 'Ce semestre' },
    { value: 'year', label: 'Cette année' }
  ];

  statutOptions = [
    { value: '', label: 'Tous les statuts' },
    { value: 'ACTIF', label: 'Actif' },
    { value: 'INACTIF', label: 'Inactif' },
    { value: 'EN_COURS', label: 'En cours' },
    { value: 'TERMINE', label: 'Terminé' }
  ];

  anneeScolaireOptions = [
    { value: '', label: 'Toutes les années' },
    { value: '2024-2025', label: '2024-2025' },
    { value: '2023-2024', label: '2023-2024' },
    { value: '2022-2023', label: '2022-2023' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    this.setupFormSubscription();
  }

  private initForm(): void {
    this.filterForm = this.fb.group({
      periode: [''],
      statut: [''],
      anneeScolaire: ['']
    });
  }

  private setupFormSubscription(): void {
    this.filterForm.valueChanges.subscribe(filters => {
      // Émettre les filtres uniquement s'ils ont des valeurs
      const activeFilters: DashboardFilters = {};

      if (filters.periode) activeFilters.periode = filters.periode;
      if (filters.statut) activeFilters.statut = filters.statut;
      if (filters.anneeScolaire) activeFilters.anneeScolaire = filters.anneeScolaire;

      this.filtersChanged.emit(activeFilters);
    });
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.filtersChanged.emit({});
  }

  hasActiveFilters(): boolean {
    const formValue = this.filterForm.value;
    return Object.values(formValue).some(value => value && value !== '');
  }
}
