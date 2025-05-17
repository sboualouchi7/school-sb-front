import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { ModuleService } from '../../../../core/services/module.service';
import { ModuleResponse } from '../../../../core/dto/module/module-response';
import { ClasseResponse } from '../../../../core/dto/classe/classe-response';
import { EtudiantResponse } from '../../../../core/dto/etudiant/etudiant-response';
import { AbsenceRequest } from '../../../../core/dto/absence/absence-request';
import { AbsenceService } from '../../../../core/services/absence.service';
import { AuthService } from '../../../../core/services/auth-service';
import { SeanceService } from '../../../../core/services/seance.service';
import { SeanceResponse } from '../../../../core/dto/seance/seance-response';

@Component({
  selector: 'app-absence-management',
  templateUrl: './absence-management.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatSortModule
  ],
  styleUrls: ['./absence-management.component.css']
})
export class AbsenceManagementComponent implements OnInit {
  enseignantId: number | null = null;
  selectionForm!: FormGroup;

  modules: ModuleResponse[] = [];
  classes: ClasseResponse[] = [];
  etudiants: EtudiantResponse[] = [];
  seances: SeanceResponse[] = [];

  selectedModule: ModuleResponse | null = null;
  selectedClasse: ClasseResponse | null = null;
  selectedSeance: SeanceResponse | null = null;

  isLoading = false;
  feedback = '';
  showFeedback = false;
  feedbackType = 'success';

  // État de présence des étudiants
  etudiantPresence: { [etudiantId: number]: boolean } = {};

  constructor(
    private fb: FormBuilder,
    private moduleService: ModuleService,
    private absenceService: AbsenceService,
    private authService: AuthService,
    private seanceService: SeanceService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getCurrentEnseignantId();
    this.loadModulesForEnseignant();
  }

  initForm(): void {
    this.selectionForm = this.fb.group({
      moduleId: ['', Validators.required],
      classeId: ['', Validators.required],
      seanceId: ['', Validators.required],
      date: [new Date().toISOString().split('T')[0], Validators.required]
    });

    // Réagir aux changements de module
    this.selectionForm.get('moduleId')?.valueChanges.subscribe(moduleId => {
      if (moduleId) {
        this.selectedModule = this.modules.find(m => m.id === Number(moduleId)) || null;
        this.loadClassesForModule(Number(moduleId));
        this.selectionForm.get('classeId')?.setValue('');
        this.selectionForm.get('seanceId')?.setValue('');
      } else {
        this.classes = [];
        this.etudiants = [];
      }
    });

    // Réagir aux changements de classe
    this.selectionForm.get('classeId')?.valueChanges.subscribe(classeId => {
      if (classeId && this.selectedModule) {
        this.selectedClasse = this.classes.find(c => c.id === Number(classeId)) || null;
        this.loadEtudiantsForModuleAndClasse(this.selectedModule.id, Number(classeId));
        this.loadSeancesForModule(this.selectedModule.id);
      } else {
        this.etudiants = [];
      }
    });

    // Réagir aux changements de séance
    this.selectionForm.get('seanceId')?.valueChanges.subscribe(seanceId => {
      if (seanceId) {
        this.selectedSeance = this.seances.find(s => s.id === Number(seanceId)) || null;
      } else {
        this.selectedSeance = null;
      }
    });
  }

  getCurrentEnseignantId(): void {
    const currentUser = this.authService.currentUserSubject.value;
    if (currentUser && currentUser.id) {
      this.enseignantId = currentUser.id;
    }
  }

  loadModulesForEnseignant(): void {
    if (!this.enseignantId) return;

    this.isLoading = true;
    this.moduleService.getModulesByEnseignant(this.enseignantId).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.modules = response.data;
        } else {
          this.showNotification('Erreur lors du chargement des modules', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des modules:', error);
        this.showNotification('Erreur lors du chargement des modules', 'error');
        this.isLoading = false;
      }
    });
  }

  loadClassesForModule(moduleId: number): void {
    if (!this.enseignantId) return;

    this.isLoading = true;
    this.moduleService.getClassesByModuleAndEnseignant(moduleId, this.enseignantId).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.classes = response.data;
        } else {
          this.showNotification('Erreur lors du chargement des classes', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
        this.showNotification('Erreur lors du chargement des classes', 'error');
        this.isLoading = false;
      }
    });
  }

  loadSeancesForModule(moduleId: number): void {
    if (!this.enseignantId) return;

    this.isLoading = true;
    this.seanceService.getSeancesByModule(moduleId).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.seances = response.data;
        } else {
          this.showNotification('Erreur lors du chargement des séances', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des séances:', error);
        this.showNotification('Erreur lors du chargement des séances', 'error');
        this.isLoading = false;
      }
    });
  }
  togglePresence(etudiantId: number): void {
    this.etudiantPresence[etudiantId] = !this.etudiantPresence[etudiantId];
  }
  loadEtudiantsForModuleAndClasse(moduleId: number, classeId: number): void {
    if (!this.enseignantId) return;

    this.isLoading = true;
    this.absenceService.getEtudiantsByModuleClasse(moduleId, classeId, this.enseignantId).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.etudiants = response.data;

          // Initialiser tous les étudiants comme présents
          this.etudiants.forEach(etudiant => {
            this.etudiantPresence[etudiant.id] = true;
          });
        } else {
          this.showNotification('Erreur lors du chargement des étudiants', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des étudiants:', error);
        this.showNotification('Erreur lors du chargement des étudiants', 'error');
        this.isLoading = false;
      }
    });
  }

  saveAbsences(): void {
    if (!this.enseignantId || !this.selectedSeance || !this.selectedModule) {
      this.showNotification('Informations manquantes', 'error');
      return;
    }

    const date = this.selectionForm.get('date')?.value;
    if (!date) {
      this.showNotification('Veuillez sélectionner une date', 'error');
      return;
    }

    const absenceRequests: any[] = []; // Utiliser any[] au lieu de AbsenceRequest[]

    // Créer une demande d'absence pour chaque étudiant marqué comme absent
    for (const etudiant of this.etudiants) {
      if (!this.etudiantPresence[etudiant.id]) {
        // Créer un objet JavaScript normal (pas via l'interface TypeScript)
        const moduleId = this.selectedModule.id;

        const absenceRequest = this.etudiants
          .filter(etudiant => !this.etudiantPresence[etudiant.id])
          .map(etudiant => ({
            etudiantId: etudiant.id,
            seanceId: this.selectedSeance!.id,
            moduleId: moduleId, // Utiliser la variable locale
            dateDebut: this.formatDateForBackend(date),
            dateFin: this.formatDateForBackend(date),
            motif: 'Absence non justifiée',
            commentaire: ''
          }));

        // Vérification explicite
        console.log('Absence request created:', absenceRequest);
       // console.log('ModuleId present:', absenceRequest.moduleId !== undefined);

        absenceRequests.push(absenceRequest);
      }
    }

    if (absenceRequests.length === 0) {
      this.showNotification('Aucune absence à enregistrer', 'info');
      return;
    }

    // Log final avant envoi
    console.log('Final absenceRequests array:', absenceRequests);
    console.log('Stringified payload:', JSON.stringify(absenceRequests));

    this.isLoading = true;
    this.absenceService.createBulk(absenceRequests, this.enseignantId).subscribe({
      next: (response) => {
        if (response && response.success) {
          this.showNotification(`${absenceRequests.length} absence(s) enregistrée(s) avec succès`, 'success');
          // Réinitialiser le formulaire
          this.resetForm();
        } else {
          this.showNotification('Erreur lors de l\'enregistrement des absences', 'error');
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de l\'enregistrement des absences:', error);
        this.showNotification('Erreur lors de l\'enregistrement des absences', 'error');
        this.isLoading = false;
      }
    });
    console.log('Final payload:', JSON.stringify(absenceRequests));
  }
  resetForm(): void {
    this.selectionForm.reset({
      date: new Date().toISOString().split('T')[0]
    });
    this.etudiants = [];
    this.etudiantPresence = {};
  }

  private formatDateForBackend(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  private showNotification(message: string, type: 'success' | 'error' | 'info'): void {
    this.feedback = message;
    this.feedbackType = type;
    this.showFeedback = true;

    // Masquer la notification après 3 secondes
    setTimeout(() => {
      this.showFeedback = false;
    }, 3000);
  }
}
