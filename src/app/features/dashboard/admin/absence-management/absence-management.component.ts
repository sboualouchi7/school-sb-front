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
  classes: ClasseResponse[] = [];
  modules: ModuleResponse[] = [];
  etudiants: EtudiantResponse[] = [];
  selectedModuleId: number | null = null;
  selectedClasseId: number | null = null;

  displayedColumns: string[] = ['id', 'nomEtudiant', 'moduleSeance', 'dateDebut', 'dateFin', 'motif', 'validee', 'actions'];
  showAddForm: boolean = false;
  isEditMode: boolean = false;
  currentAbsenceId: number | null = null;

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
    this.loadClasses();
    this.loadModules();
    this.loadAllAbsences();

    // Réagir aux changements de sélection de classe et module
    this.filterForm.get('classeId')?.valueChanges.subscribe(value => {
      this.selectedClasseId = value;
      if (this.selectedClasseId && this.selectedModuleId) {
        this.loadEtudiantsByModuleAndClasse();
      }
    });

    this.filterForm.get('moduleId')?.valueChanges.subscribe(value => {
      this.selectedModuleId = value;
      if (this.selectedClasseId && this.selectedModuleId) {
        this.loadEtudiantsByModuleAndClasse();
      }
    });
  }

  initFilterForm(): void {
    this.filterForm = this.fb.group({
      classeId: ['', Validators.required],
      moduleId: ['', Validators.required]
    });
  }

  initAbsenceForm(): void {
    this.absenceForm = this.fb.group({
      etudiantId: ['', Validators.required],
      seanceId: ['', Validators.required],

      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      motif: [''],
      justification: [''],
      commentaire: ['']
    });
  }

  loadClasses(): void {
    this.classeService.getAllClasses().subscribe({
      next: (response) => {
        if (response.success) {
          this.classes = response.data;
        } else {
          console.error('Erreur lors du chargement des classes:', response.message);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
      }
    });
  }

  loadModules(): void {
    this.moduleService.getAllModules().subscribe({
      next: (response) => {
        if (response.success) {
          this.modules = response.data;
        } else {
          console.error('Erreur lors du chargement des modules:', response.message);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des modules:', error);
      }
    });
  }

  loadAllAbsences(): void {
    this.absenceService.getAll().subscribe({
      next: (response) => {
        if (response.success) {
          this.absences = response.data;
          console.log(this.absences, 'absences loaded');
        } else {
          console.error('Erreur lors du chargement des absences:', response.message);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des absences:', error);
      }
    });
  }

  // Then, fix the loadEtudiantsByModuleAndClasse method in the AbsenceManagementComponent
  loadEtudiantsByModuleAndClasse(): void {
    if (!this.selectedModuleId || !this.selectedClasseId) {
      console.warn('ModuleId or ClasseId not defined');
      return;
    }

    // Use a sensible default for enseignantId if not available
    const enseignantId = 1; // or retrieve from the current user if applicable

    this.absenceService.getEtudiantsByModuleClasse(
      this.selectedModuleId,
      this.selectedClasseId,

    ).subscribe({
      next: (response) => {
        console.log('Response from getEtudiantsByModuleClasse:', response);

        if (response.success) {
          this.etudiants = response.data;
          console.log(`${this.etudiants.length} students loaded`);
        } else {
          console.error('Error loading students:', response.message);
          this.etudiants = [];
        }
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.etudiants = [];
      }
    });
  }
  filterAbsences(): void {
    if (this.selectedModuleId && this.selectedClasseId) {
      // Filtrer les absences par module et classe
      // Dans ce cas, les absences sont déjà filtrées par l'API en utilisant getEtudiantsByModuleClasse
      // Nous pouvons également obtenir les absences spécifiques à ces étudiants
      const etudiantIds = this.etudiants.map(e => e.id);
      this.absenceService.getAll().subscribe({
        next: (response) => {
          if (response.success) {
            this.absences = response.data.filter(absence =>
              etudiantIds.includes(absence.etudiantId)
            );
          }
        }
      });
    }
  }

  applyFilter(): void {
    if (this.filterForm.valid) {
      this.filterAbsences();
    }
  }

  resetFilter(): void {
    this.filterForm.reset();
    this.selectedClasseId = null;
    this.selectedModuleId = null;
    this.etudiants = [];
    this.loadAllAbsences();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    this.isEditMode = false;
    this.resetAbsenceForm();
  }

  resetAbsenceForm(): void {
    this.absenceForm.reset();
    this.currentAbsenceId = null;
  }

  onSubmitAbsence(): void {
    if (this.absenceForm.valid) {
      const absenceData: AbsenceRequest = {
        etudiantId: this.absenceForm.value.etudiantId,
        seanceId: this.absenceForm.value.seanceId,

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
              this.loadAllAbsences();
              this.toggleAddForm();
            } else {
              console.error('Erreur lors de la mise à jour de l\'absence:', response.message);
            }
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour de l\'absence:', error);
          }
        });
      } else {
        this.absenceService.create(absenceData).subscribe({
          next: (response) => {
            if (response.success) {
              this.loadAllAbsences();
              this.toggleAddForm();
            } else {
              console.error('Erreur lors de la création de l\'absence:', response.message);
            }
          },
          error: (error) => {
            console.error('Erreur lors de la création de l\'absence:', error);
          }
        });
      }
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
      dateDebut: dateDebut,
      dateFin: dateFin,
      motif: absence.motif,
      justification: absence.justification,
      commentaire: absence.commentaire
    });
  }

  deleteAbsence(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette absence ?')) {
      this.absenceService.delete(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadAllAbsences();
          } else {
            console.error('Erreur lors de la suppression de l\'absence:', response.message);
          }
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de l\'absence:', error);
        }
      });
    }
  }

  validateAbsence(id: number, validee: boolean): void {
    this.absenceService.validate(id, !validee).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadAllAbsences();
        } else {
          console.error('Erreur lors de la validation de l\'absence:', response.message);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la validation de l\'absence:', error);
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
