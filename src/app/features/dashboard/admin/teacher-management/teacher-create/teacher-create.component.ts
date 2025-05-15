import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EnseignantService } from "../../../../../core/services/enseignant.service";
import { EnseignantRequest } from "../../../../../core/dto/enseignant/enseignant-request";
import { Role } from "../../../../../core/enums/Role";
import { Sexe } from "../../../../../core/enums/Sexe";
import { EnseignantResponse } from "../../../../../core/dto/enseignant/enseignant-response";

@Component({
  selector: 'app-teacher-create',
  templateUrl: './teacher-create.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  styleUrls: ['./teacher-create.component.css']
})
export class TeacherCreateComponent implements OnInit, OnChanges {
  @Output() teacherCreated = new EventEmitter<void>();
  @Output() teacherUpdated = new EventEmitter<void>();
  @Input() enseignantToEdit: EnseignantResponse | null = null;

  formEnseignant!: FormGroup;
  isEditMode = false;

  constructor(
    private enseignantService: EnseignantService,
    private fb: FormBuilder
  ) {
    console.log('Constructor: initializing form');
    this.initForm();
  }

  ngOnInit(): void {
    console.log('ngOnInit: formEnseignant', this.formEnseignant);
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Réagir lorsqu'un enseignant est reçu pour édition
    if (changes['enseignantToEdit'] && changes['enseignantToEdit'].currentValue) {
      this.isEditMode = true;
      this.updateFormWithTeacherData();
    } else if (changes['enseignantToEdit'] && !changes['enseignantToEdit'].currentValue) {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  initForm(): void {
    this.formEnseignant = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(3)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      dateNaissance: ['', Validators.required],
      adresse: [''],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      sexe: ['', Validators.required],
      numeroCarte: ['', Validators.required],
      departementId: [''],
      dateEmbauche: ['', Validators.required],
      specialite: [''],
      photo: ['']
    });
  }

  updateFormWithTeacherData(): void {
    console.log('updateFormWithTeacherData called with:', this.enseignantToEdit);
    if (this.enseignantToEdit && this.formEnseignant) {
      let dateNaissance = this.enseignantToEdit.dateNaissance;
      let dateEmbauche = this.enseignantToEdit.dateEmbauche;

      if (dateNaissance && dateNaissance.includes('-')) {
        const parts = dateNaissance.split('-');
        if (parts.length === 3 && parts[0].length === 2) {
          dateNaissance = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      if (dateEmbauche && dateEmbauche.includes('-')) {
        const parts = dateEmbauche.split('-');
        if (parts.length === 3 && parts[0].length === 2) {
          dateEmbauche = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      const patchData = {
        nom: this.enseignantToEdit.nom,
        prenom: this.enseignantToEdit.prenom,
        email: this.enseignantToEdit.email,
        telephone: this.enseignantToEdit.telephone,
        dateNaissance: dateNaissance,
        adresse: this.enseignantToEdit.adresse,
        username: this.enseignantToEdit.username,
        sexe: this.enseignantToEdit.sexe,
        numeroCarte: this.enseignantToEdit.numeroCarte,
        departementId: this.enseignantToEdit.departementId,
        dateEmbauche: dateEmbauche,
        specialite: this.enseignantToEdit.specialite,
        photo: ''
      };
      console.log('Patching form with:', patchData);
      this.formEnseignant.patchValue(patchData);

      const passwordControl = this.formEnseignant.get('password');
      if (passwordControl) {
        passwordControl.setValidators(this.isEditMode ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)]);
        passwordControl.updateValueAndValidity();
      }
    } else {
      console.warn('Cannot patch form, missing data or form undefined');
    }
  }

  onSubmit(): void {
    if (this.formEnseignant.valid) {
      if (this.isEditMode) {
        this.updateTeacher();
      } else {
        this.addTeacher();
      }
    } else {
      // Afficher les champs invalides
      const invalidFields: string[] = [];
      Object.keys(this.formEnseignant.controls).forEach(key => {
        const control = this.formEnseignant.get(key);
        if (control?.invalid) {
          invalidFields.push(key);
        }
      });

      alert(`Veuillez remplir correctement tous les champs obligatoires. Champs invalides: ${invalidFields.join(', ')}`);
    }
  }

  addTeacher(): void {
    try {
      const dateNaissanceInput = this.formEnseignant.value.dateNaissance;
      const dateNaissance = this.formatDateForBackend(dateNaissanceInput);

      const dateEmbaucheInput = this.formEnseignant.value.dateEmbauche;
      const dateEmbauche = this.formatDateForBackend(dateEmbaucheInput);

      const newEnseignant: EnseignantRequest = {
        nom: this.formEnseignant.value.nom,
        prenom: this.formEnseignant.value.prenom,
        email: this.formEnseignant.value.email,
        telephone: this.formEnseignant.value.telephone || "",
        dateNaissance: dateNaissance,
        adresse: this.formEnseignant.value.adresse || "",
        username: this.formEnseignant.value.username,
        password: this.formEnseignant.value.password,
        role: Role.ENSEIGNANT,
        sexe: this.formEnseignant.value.sexe,
        numeroCarte: this.formEnseignant.value.numeroCarte,
        departementId: Number(this.formEnseignant.value.departementId),
        dateEmbauche: dateEmbauche,
        specialite: this.formEnseignant.value.specialite || "",
        photo: ""
      };

      this.enseignantService.create(newEnseignant).subscribe({
        next: (response) => {
          if (response.success) {
            alert("Enseignant créé avec succès!");
            this.resetForm();
            this.teacherCreated.emit();
          } else {
            alert("Erreur lors de la création de l'enseignant: " + response.message);
          }
        },
        error: (error) => {
          console.error("Erreur lors de la création de l'enseignant:", error);
          alert("Erreur lors de la création de l'enseignant: " + (error.message || "Erreur inconnue"));
        }
      });
    } catch (error: any) {
      console.error("Erreur lors de la préparation des données:", error);
      alert("Erreur lors de la préparation des données: " + (error.message || "Erreur inconnue"));
    }
  }

  updateTeacher(): void {
    if (!this.enseignantToEdit) return;

    try {
      const dateNaissanceInput = this.formEnseignant.value.dateNaissance;
      const dateNaissance = this.formatDateForBackend(dateNaissanceInput);

      const dateEmbaucheInput = this.formEnseignant.value.dateEmbauche;
      const dateEmbauche = this.formatDateForBackend(dateEmbaucheInput);

      // Création de l'objet EnseignantRequest pour la mise à jour
      const updatedEnseignant: EnseignantRequest = {
        nom: this.formEnseignant.value.nom,
        prenom: this.formEnseignant.value.prenom,
        email: this.formEnseignant.value.email,
        telephone: this.formEnseignant.value.telephone || "",
        dateNaissance: dateNaissance,
        adresse: this.formEnseignant.value.adresse || "",
        username: this.formEnseignant.value.username,
        // Inclure le mot de passe seulement s'il a été modifié
        password: this.formEnseignant.value.password || undefined,
        role: Role.ENSEIGNANT,
        sexe: this.formEnseignant.value.sexe,
        numeroCarte: this.formEnseignant.value.numeroCarte,
        departementId: Number(this.formEnseignant.value.departementId),
        dateEmbauche: dateEmbauche || this.enseignantToEdit.dateEmbauche,
        specialite: this.formEnseignant.value.specialite || "",
        photo: ""
      };

      this.enseignantService.update(this.enseignantToEdit.id, updatedEnseignant).subscribe({
        next: (response) => {
          if (response.success) {
            alert("Enseignant mis à jour avec succès!");
            this.resetForm();
            this.isEditMode = false;
            this.teacherUpdated.emit();
          } else {
            alert("Erreur lors de la mise à jour de l'enseignant: " + response.message);
          }
        },
        error: (error) => {
          console.error("Erreur lors de la mise à jour de l'enseignant:", error);
          alert("Erreur lors de la mise à jour de l'enseignant: " + (error.message || "Erreur inconnue"));
        }
      });
    } catch (error: any) {
      console.error("Erreur lors de la préparation des données:", error);
      alert("Erreur lors de la préparation des données: " + (error.message || "Erreur inconnue"));
    }
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

  resetForm() {
    this.formEnseignant.reset();
    this.initForm();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.resetForm();
  }

  protected readonly Sexe = Sexe;
}
