// features/dashboard/enseignant/gestion-absences/liste-etudiants/liste-etudiants.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AbsenceService } from '../../../../../core/services/absence.service';
import { EtudiantResponse } from '../../../../../core/dto/etudiant/etudiant-response';
import { AbsenceRequest } from '../../../../../core/dto/absence/absence-request';

@Component({
  selector: 'app-liste-etudiants',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './liste-etudiants.component.html',
  styleUrls: ['./liste-etudiants.component.css']
})
export class ListeEtudiantsComponent implements OnInit {
  @Input() moduleId!: number;
  @Input() classeId!: number;
  @Output() retour = new EventEmitter<void>();

  etudiants: EtudiantResponse[] = [];
  etudiantsSelectionnes: number[] = []; // IDs des étudiants sélectionnés pour l'absence
  isLoading = false;
  isSaving = false;
  error: string | null = null;
  successMessage: string | null = null;

  absenceForm: FormGroup;

  constructor(
    private absenceService: AbsenceService,
    private fb: FormBuilder
  ) {
    this.absenceForm = this.fb.group({
      date: [new Date().toISOString().split('T')[0], Validators.required],
      motif: ['', Validators.required],
      commentaire: ['']
    });
  }

  ngOnInit(): void {
    this.chargerEtudiants();
  }

  chargerEtudiants(): void {
    this.isLoading = true;
    this.error = null;

    this.absenceService.getEtudiantsByModuleClasse(this.moduleId, this.classeId).subscribe({
      next: (response) => {
        if (response.success) {
          this.etudiants = response.data;
        } else {
          this.error = response.message || 'Erreur lors du chargement des étudiants';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur de connexion au serveur';
        this.isLoading = false;
        console.error('Erreur lors du chargement des étudiants:', err);
      }
    });
  }

  toggleEtudiantSelection(etudiantId: number): void {
    const index = this.etudiantsSelectionnes.indexOf(etudiantId);
    if (index === -1) {
      this.etudiantsSelectionnes.push(etudiantId);
    } else {
      this.etudiantsSelectionnes.splice(index, 1);
    }
  }

  isEtudiantSelectionne(etudiantId: number): boolean {
    return this.etudiantsSelectionnes.includes(etudiantId);
  }

  selectAll(): void {
    if (this.etudiantsSelectionnes.length === this.etudiants.length) {
      // Si tous sont déjà sélectionnés, on désélectionne tout
      this.etudiantsSelectionnes = [];
    } else {
      // Sinon, on sélectionne tout
      this.etudiantsSelectionnes = this.etudiants.map(e => e.id);
    }
  }

  enregistrerAbsences(): void {
    if (this.etudiantsSelectionnes.length === 0) {
      this.error = 'Veuillez sélectionner au moins un étudiant';
      return;
    }

    if (this.absenceForm.invalid) {
      this.markFormGroupTouched(this.absenceForm);
      return;
    }

    this.isSaving = true;
    this.error = null;
    this.successMessage = null;

    const formValues = this.absenceForm.value;

    // Créer une requête d'absence pour chaque étudiant sélectionné
    const absenceRequests: AbsenceRequest[] = this.etudiantsSelectionnes.map(etudiantId => ({
      etudiantId: etudiantId,
      seanceId: 1,
      moduleId:formValues.moduleId,// Placeholder - à adapter selon votre modèle de données
      dateDebut: this.formatDateForBackend(formValues.date),
      dateFin: this.formatDateForBackend(formValues.date), // Même date pour simplifier
      motif: formValues.motif,
      commentaire: formValues.commentaire
    }));

    // Envoyer les absences au backend
    this.absenceService.createBulk(absenceRequests).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = `${absenceRequests.length} absence(s) enregistrée(s) avec succès`;
          this.etudiantsSelectionnes = []; // Réinitialiser la sélection
          this.absenceForm.patchValue({
            motif: '',
            commentaire: ''
          });
        } else {
          this.error = response.message || 'Erreur lors de l\'enregistrement des absences';
        }
        this.isSaving = false;
      },
      error: (err) => {
        this.error = 'Erreur de connexion au serveur';
        this.isSaving = false;
        console.error('Erreur lors de l\'enregistrement des absences:', err);
      }
    });
  }

  retourSelectionClasse(): void {
    this.retour.emit();
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

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
