import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, NgForOf } from "@angular/common";
import { ClasseResponse } from "../../../../../core/dto/classe/classe-response";
import { EtudiantService } from "../../../../../core/services/etudiant.service";
import { ClasseService } from "../../../../../core/services/classe.service";
import { EtudiantRequest } from "../../../../../core/dto/etudiant/etudiant-request";
import { Role } from "../../../../../core/enums/Role";
import { EtudiantResponse } from "../../../../../core/dto/etudiant/etudiant-response";

@Component({
  selector: 'app-student-create',
  templateUrl: './student-create.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    NgForOf
  ],
  styleUrls: ['./student-create.component.css']
})
export class StudentCreateComponent implements OnInit, OnChanges {
  @Output() studentCreated = new EventEmitter<void>();
  @Output() studentUpdated = new EventEmitter<void>();
  @Input() etudiantToEdit: EtudiantResponse | null = null;

  FormEleve!: FormGroup;
  ListClasses: ClasseResponse[] = [];
  isEditMode = false;

  anneeScolaireCourante: string = new Date().getFullYear() + "-" + (new Date().getFullYear() + 1);

  constructor(
    private etudiantService: EtudiantService,
    private fb: FormBuilder,
    private classeService: ClasseService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadClasses();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Réagir lorsqu'un étudiant est reçu pour édition
    if (changes['etudiantToEdit'] && changes['etudiantToEdit'].currentValue) {
      this.isEditMode = true;
      this.updateFormWithStudentData();
    } else if (changes['etudiantToEdit'] && !changes['etudiantToEdit'].currentValue) {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  initForm(): void {
    this.FormEleve = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      telephone: [''],
      dateNaissance: ['', Validators.required],
      adresse: [''],
      sexe: ['', Validators.required],
      numeroEtudiant: ['', Validators.required],
      filiere: [''],
      classeId: ['', Validators.required],
      niveauId: ['']
    });
  }

  loadClasses(): void {
    this.classeService.getAllClasses().subscribe({
      next: (response) => {
        if (response && response.success) {
          this.ListClasses = response.data;
          console.log("Classes chargées: " + response.data.length);

          // Si en mode édition, mettre à jour le formulaire après chargement des classes
          if (this.isEditMode && this.etudiantToEdit) {
            this.updateFormWithStudentData();
          }
        } else {
          console.error("Erreur lors du chargement des classes: réponse non valide", response);
          this.ListClasses = [];
        }
      },
      error: (error) => {
        console.error("Erreur lors du chargement des classes:", error);
        this.ListClasses = [];
      }
    });
  }

  updateFormWithStudentData(): void {
    if (this.etudiantToEdit && this.FormEleve) {
      // Convertir la date au format yyyy-MM-dd pour l'input date
      let dateNaissance = this.etudiantToEdit.dateNaissance;

      // Si la date est au format dd-MM-yyyy, convertir en yyyy-MM-dd
      if (dateNaissance && dateNaissance.includes('-')) {
        const parts = dateNaissance.split('-');
        if (parts.length === 3 && parts[0].length === 2) {
          dateNaissance = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      // Mettre à jour le formulaire avec les données de l'étudiant
      this.FormEleve.patchValue({
        nom: this.etudiantToEdit.nom,
        prenom: this.etudiantToEdit.prenom,
        email: this.etudiantToEdit.email,
        username: this.etudiantToEdit.username,
        // Ne pas remplir le mot de passe pour des raisons de sécurité
        telephone: this.etudiantToEdit.telephone,
        dateNaissance: dateNaissance,
        adresse: this.etudiantToEdit.adresse,
        sexe: this.etudiantToEdit.sexe,
        numeroEtudiant: this.etudiantToEdit.numeroEtudiant,
        filiere: this.etudiantToEdit.filiere,
        classeId: this.etudiantToEdit.classeId,
        niveauId: this.etudiantToEdit.niveauId
      });

      // En mode édition, le mot de passe est optionnel
      const passwordControl = this.FormEleve.get('password');
      if (passwordControl) {
        passwordControl.setValidators(this.isEditMode ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)]);
        passwordControl.updateValueAndValidity();
      }
    }
  }

  onSubmit(): void {
    if (this.FormEleve.valid) {
      if (this.isEditMode) {
        this.updateStudent();
      } else {
        this.addStudent();
      }
    } else {
      // Afficher les champs invalides
      const invalidFields: string[] = [];
      Object.keys(this.FormEleve.controls).forEach(key => {
        const control = this.FormEleve.get(key);
        if (control?.invalid) {
          invalidFields.push(key);
        }
      });

      alert(`Veuillez remplir correctement tous les champs obligatoires. Champs invalides: ${invalidFields.join(', ')}`);
    }
  }

  addStudent(): void {
    try {
      const dateNaissanceInput = this.FormEleve.value.dateNaissance;
      const dateNaissance = this.formatDateForBackend(dateNaissanceInput);
      const dateInscription = this.formatDateForBackend(new Date().toISOString().split('T')[0]);

      // Création de l'objet EtudiantRequest
      const newEtudiant: EtudiantRequest = {
        nom: this.FormEleve.value.nom,
        prenom: this.FormEleve.value.prenom,
        email: this.FormEleve.value.email,
        username: this.FormEleve.value.username,
        password: this.FormEleve.value.password,
        telephone: this.FormEleve.value.telephone || "",
        dateNaissance: dateNaissance,
        adresse: this.FormEleve.value.adresse || "",
        sexe: this.FormEleve.value.sexe,
        role: Role.ETUDIANT,
        numeroEtudiant: this.FormEleve.value.numeroEtudiant,
        filiere: this.FormEleve.value.filiere || "",
        classeId: Number(this.FormEleve.value.classeId),
        niveauId: Number(this.FormEleve.value.niveauId),
        dateInscription: dateInscription,
        anneeScolaire: this.anneeScolaireCourante,
        photo: ""
      };

      this.etudiantService.createEtudiant(newEtudiant).subscribe({
        next: (response) => {
          if (response.success) {
            alert("Étudiant créé avec succès!");
            this.resetForm();
            this.studentCreated.emit();
          } else {
            alert("Erreur lors de la création de l'étudiant: " + response.message);
          }
        },
        error: (error) => {
          console.error("Erreur lors de la création de l'étudiant:", error);
          alert("Erreur lors de la création de l'étudiant: " + (error.message || "Erreur inconnue"));
        }
      });
    } catch (error: any) {
      console.error("Erreur lors de la préparation des données:", error);
      alert("Erreur lors de la préparation des données: " + (error.message || "Erreur inconnue"));
    }
  }

  updateStudent(): void {
    if (!this.etudiantToEdit) return;

    try {
      const dateNaissanceInput = this.FormEleve.value.dateNaissance;
      const dateNaissance = this.formatDateForBackend(dateNaissanceInput);

      // Création de l'objet EtudiantRequest pour la mise à jour
      const updatedEtudiant: EtudiantRequest = {
        nom: this.FormEleve.value.nom,
        prenom: this.FormEleve.value.prenom,
        email: this.FormEleve.value.email,
        username: this.FormEleve.value.username,
        // Inclure le mot de passe seulement s'il a été modifié
        password: this.FormEleve.value.password || undefined,
        telephone: this.FormEleve.value.telephone || "",
        dateNaissance: dateNaissance,
        adresse: this.FormEleve.value.adresse || "",
        sexe: this.FormEleve.value.sexe,
        role: Role.ETUDIANT,
        numeroEtudiant: this.FormEleve.value.numeroEtudiant,
        filiere: this.FormEleve.value.filiere || "",
        classeId: Number(this.FormEleve.value.classeId),
        niveauId: Number(this.FormEleve.value.niveauId),
        // Conserver les valeurs existantes pour ces champs
        dateInscription: this.etudiantToEdit.dateInscription,
        anneeScolaire: this.etudiantToEdit.anneeScolaire || this.anneeScolaireCourante,
        photo: ""
      };

      this.etudiantService.updateEtudiant(this.etudiantToEdit.id, updatedEtudiant).subscribe({
        next: (response) => {
          if (response.success) {
            alert("Étudiant mis à jour avec succès!");
            this.resetForm();
            this.isEditMode = false;
            this.studentUpdated.emit();
          } else {
            alert("Erreur lors de la mise à jour de l'étudiant: " + response.message);
          }
        },
        error: (error) => {
          console.error("Erreur lors de la mise à jour de l'étudiant:", error);
          alert("Erreur lors de la mise à jour de l'étudiant: " + (error.message || "Erreur inconnue"));
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
    this.FormEleve.reset();
    this.initForm();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.etudiantToEdit = null;
    this.resetForm();
  }

  onClasseChange(event: any) {
    const classeId = Number(event.target.value);
    const classe = this.ListClasses.find(c => c.id === classeId);
    if (classe) {
      this.FormEleve.patchValue({
        niveauId: classe.niveauId
      });
      console.log(`Classe sélectionnée: ${classe.nom}, niveau ID: ${classe.niveauId}`);
    }
  }
}
