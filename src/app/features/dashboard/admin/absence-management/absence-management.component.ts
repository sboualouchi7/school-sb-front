import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AbsenceService } from '../../../../core/services/absence.service';
import { ClasseService } from '../../../../core/services/classe.service';
import { ModuleService } from '../../../../core/services/module.service';
import { EtudiantService } from '../../../../core/services/etudiant.service';
import { AbsenceResponse } from '../../../../core/dto/absence/absence-response';
import { ClasseResponse } from '../../../../core/dto/classe/classe-response';
import { ModuleResponse } from '../../../../core/dto/module/module-response';
import { EtudiantResponse } from '../../../../core/dto/etudiant/etudiant-response';
import { AbsenceRequest } from '../../../../core/dto/absence/absence-request';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-absence-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule
  ],
  templateUrl: './absence-management.component.html',
  styleUrls: ['./absence-management.component.css']
})
export class AbsenceManagementComponent implements OnInit {
  filterForm!: FormGroup;
  absenceForm!: FormGroup;
  absences: AbsenceResponse[] = [];
  filteredAbsences: AbsenceResponse[] = [];
  classes: ClasseResponse[] = [];
  modules: ModuleResponse[] = [];
  etudiants: EtudiantResponse[] = [];
  allEtudiants: EtudiantResponse[] = [];
  selectedModuleId: number | null = null;
  selectedClasseId: number | null = null;

  displayedColumns: string[] = ['id', 'nomEtudiant', 'moduleSeance', 'dateDebut', 'dateFin', 'motif', 'validee', 'actions'];
  showAddForm: boolean = false;
  isEditMode: boolean = false;
  currentAbsenceId: number | null = null;
  isLoading: boolean = false;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private absenceService: AbsenceService,
    private classeService: ClasseService,
    private moduleService: ModuleService,
    private etudiantService: EtudiantService
  ) {}

  ngOnInit(): void {
    this.initFilterForm();
    this.initAbsenceForm();
    this.loadInitialData();
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      classeId: [''],
      moduleId: [''],
      etudiantId: [''],
      dateDebut: [''],
      dateFin: [''],
      validee: [''],
    });

    // Réagir aux changements des filtres
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  initAbsenceForm(): void {
    this.absenceForm = this.fb.group({
      etudiantId: ['', Validators.required],
      seanceId: ['', Validators.required],
      moduleId: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      motif: [''],
      justification: [''],
      commentaire: ['']
    });
  }

  loadInitialData(): void {
    this.isLoading = true;
    this.errorMessage = null;

    // Charger toutes les données nécessaires en parallèle
    forkJoin({
      classes: this.classeService.getAllClasses(),
      modules: this.moduleService.getAllModules(),
      etudiants: this.etudiantService.getAllEtudiants(),
      absences: this.absenceService.getAll()
    }).subscribe({
      next: (results) => {
        if (results.classes.success) this.classes = results.classes.data;
        if (results.modules.success) this.modules = results.modules.data;
        if (results.etudiants.success) {
          this.allEtudiants = results.etudiants.data;
          this.etudiants = [...this.allEtudiants];
        }
        if (results.absences.success) {
          this.absences = results.absences.data;
          this.filteredAbsences = [...this.absences];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des données initiales:', error);
        this.errorMessage = 'Erreur lors du chargement des données. Veuillez réessayer.';
        this.isLoading = false;
      }
    });
  }

  // Méthode pour filtrer les étudiants par classe et module
  loadEtudiantsByModuleAndClasse(): void {
    if (!this.selectedModuleId || !this.selectedClasseId) {
      this.etudiants = [...this.allEtudiants];
      return;
    }

    this.isLoading = true;
    this.absenceService.getEtudiantsByModuleClasse(
      this.selectedModuleId,
      this.selectedClasseId
    ).subscribe({
      next: (response) => {
        if (response.success) {
          this.etudiants = response.data;
        } else {
          this.etudiants = [];
          this.errorMessage = response.message || 'Erreur lors du chargement des étudiants';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des étudiants:', error);
        this.etudiants = [];
        this.errorMessage = 'Erreur lors du chargement des étudiants';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;

    this.filteredAbsences = this.absences.filter(absence => {
      // Filtre par classe et module - si un étudiant a été sélectionné
      if (filters.etudiantId && absence.etudiantId !== +filters.etudiantId) {
        return false;
      }

      // Filtre par module
      if (filters.moduleId && absence.moduleId !== +filters.moduleId) {
        return false;
      }

      // Filtre par dates
      if (filters.dateDebut || filters.dateFin) {
        const absenceDebutDate = new Date(this.formatDateForComparison(absence.dateDebut));
        const absenceFinDate = new Date(this.formatDateForComparison(absence.dateFin));

        if (filters.dateDebut) {
          const dateDebutFilter = new Date(filters.dateDebut);
          if (absenceFinDate < dateDebutFilter) return false;
        }

        if (filters.dateFin) {
          const dateFinFilter = new Date(filters.dateFin);
          if (absenceDebutDate > dateFinFilter) return false;
        }
      }

      // Filtre par statut de validation
      if (filters.validee !== '') {
        const isValidee = filters.validee === 'true';
        if (absence.validee !== isValidee) return false;
      }

      return true;
    });
  }

  formatDateForComparison(dateString: string): string {
    if (!dateString) return '';

    // Si la date est au format dd-MM-yyyy, la convertir en yyyy-MM-dd
    if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
      const parts = dateString.split('-');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }

    return dateString;
  }

  onClasseChange(): void {
    this.selectedClasseId = this.filterForm.get('classeId')?.value;
    this.updateModuleAndEtudiantOptions();
  }

  onModuleChange(): void {
    this.selectedModuleId = this.filterForm.get('moduleId')?.value;
    this.updateModuleAndEtudiantOptions();
  }

  updateModuleAndEtudiantOptions(): void {
    // Si classe et module sont sélectionnés, charger les étudiants correspondants
    if (this.selectedClasseId && this.selectedModuleId) {
      this.loadEtudiantsByModuleAndClasse();
    } else if (this.selectedClasseId) {
      // Filtrer les modules par classe sélectionnée
      this.modules = this.modules.filter(m => m.classeId === +this.selectedClasseId!);
    }
  }

  resetFilters(): void {
    this.filterForm.reset();
    this.selectedClasseId = null;
    this.selectedModuleId = null;
    this.filteredAbsences = [...this.absences];
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.isEditMode = false;
    this.resetAbsenceForm();
  }

  resetAbsenceForm(): void {
    this.absenceForm.reset();
    this.currentAbsenceId = null;
    this.initAbsenceForm();
  }

  onSubmitAbsence(): void {
    if (this.absenceForm.valid) {
      this.isLoading = true;
      const absenceData: AbsenceRequest = {
        etudiantId: this.absenceForm.value.etudiantId,
        seanceId: this.absenceForm.value.seanceId,
        moduleId: this.absenceForm.value.moduleId,
        dateDebut: this.formatDate(this.absenceForm.value.dateDebut),
        dateFin: this.formatDate(this.absenceForm.value.dateFin),
        motif: this.absenceForm.value.motif,
        justification: this.absenceForm.value.justification,
        commentaire: this.absenceForm.value.commentaire
      };

      if (this.isEditMode && this.currentAbsenceId) {
        this.absenceService.update(this.currentAbsenceId, absenceData).subscribe({
          next: (response) => {
            if (response.success) {
              this.loadInitialData();
              this.toggleAddForm();
            } else {
              this.errorMessage = response.message || 'Erreur lors de la mise à jour de l\'absence';
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour de l\'absence:', error);
            this.errorMessage = 'Erreur serveur lors de la mise à jour de l\'absence';
            this.isLoading = false;
          }
        });
      } else {
        this.absenceService.create(absenceData).subscribe({
          next: (response) => {
            if (response.success) {
              this.loadInitialData();
              this.toggleAddForm();
            } else {
              this.errorMessage = response.message || 'Erreur lors de la création de l\'absence';
            }
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Erreur lors de la création de l\'absence:', error);
            this.errorMessage = 'Erreur serveur lors de la création de l\'absence';
            this.isLoading = false;
          }
        });
      }
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.absenceForm.controls).forEach(key => {
        this.absenceForm.get(key)?.markAsTouched();
      });
      this.errorMessage = 'Veuillez remplir correctement tous les champs obligatoires';
    }
  }

  editAbsence(absence: AbsenceResponse): void {
    this.isEditMode = true;
    this.currentAbsenceId = absence.id;
    this.showAddForm = true;

    // Convertir les dates au format yyyy-MM-dd pour les contrôles de formulaire
    const dateDebut = this.formatDateForForm(absence.dateDebut);
    const dateFin = this.formatDateForForm(absence.dateFin);

    this.absenceForm.patchValue({
      etudiantId: absence.etudiantId,
      seanceId: absence.seanceId,
      moduleId: absence.moduleId,
      dateDebut: dateDebut,
      dateFin: dateFin,
      motif: absence.motif,
      justification: absence.justification,
      commentaire: absence.commentaire
    });
  }

  deleteAbsence(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette absence ?')) {
      this.isLoading = true;
      this.absenceService.delete(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadInitialData();
          } else {
            this.errorMessage = response.message || 'Erreur lors de la suppression de l\'absence';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de l\'absence:', error);
          this.errorMessage = 'Erreur serveur lors de la suppression de l\'absence';
          this.isLoading = false;
        }
      });
    }
  }

  validateAbsence(id: number, validee: boolean): void {
    this.isLoading = true;
    this.absenceService.validate(id, !validee).subscribe({
      next: (response) => {
        if (response.success) {
          // Mettre à jour l'objet localement plutôt que de recharger toutes les données
          const index = this.absences.findIndex(a => a.id === id);
          if (index !== -1) {
            this.absences[index].validee = !validee;
          }
          this.applyFilters(); // Réappliquer les filtres pour mettre à jour la liste filtrée
        } else {
          this.errorMessage = response.message || 'Erreur lors de la validation de l\'absence';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de la validation de l\'absence:', error);
        this.errorMessage = 'Erreur serveur lors de la validation de l\'absence';
        this.isLoading = false;
      }
    });
  }

  // Fonction pour formater la date du formulaire vers le format attendu par le serveur (dd-MM-yyyy)
  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  // Fonction pour formater la date du serveur (dd-MM-yyyy) vers le format du formulaire (yyyy-MM-dd)
  formatDateForForm(dateString: string): string {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  }
}
