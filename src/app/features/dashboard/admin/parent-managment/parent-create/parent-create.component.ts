// parent-create.component.ts - Code complet
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ParentRequest } from '../../../../../core/dto/parent/parent-request';
import { ParentService } from '../../../../../core/services/parent.service';
import { EtudiantService } from '../../../../../core/services/etudiant.service';
import { Sexe } from '../../../../../core/enums/Sexe';
import { Role } from '../../../../../core/enums/Role';
import { ParentResponse } from '../../../../../core/dto/parent/parent-response';
import { EtudiantResponse } from '../../../../../core/dto/etudiant/etudiant-response';

@Component({
  selector: 'app-parent-create',
  templateUrl: './parent-create.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  styleUrls: ['./parent-create.component.css']
})
export class ParentCreateComponent implements OnInit, OnChanges {
  @Output() parentCreated = new EventEmitter<void>();
  @Output() parentUpdated = new EventEmitter<void>();
  @Input() parentToEdit: ParentResponse | null = null;

  formParent!: FormGroup;
  sexeOptions = Object.values(Sexe);
  isEditMode = false;

  allEtudiants: EtudiantResponse[] = [];
  filteredEtudiants: EtudiantResponse[] = [];
  selectedEtudiants: EtudiantResponse[] = [];
  searchTerm: string = '';
  searchPerformed: boolean = false;

  constructor(
    private fb: FormBuilder,
    private parentService: ParentService,
    private etudiantService: EtudiantService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    console.log('ngOnInit — formParent.controls:', this.formParent);
    this.loadAllEtudiants();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Réagir lorsqu'un parent est reçu pour édition
    if (changes['parentToEdit'] && changes['parentToEdit'].currentValue) {
      this.isEditMode = true;
      this.updateFormWithParentData();
    } else if (changes['parentToEdit'] && !changes['parentToEdit'].currentValue) {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  initForm(): void {
    this.formParent = this.fb.group({
      nom: ['', Validators.required],
      prenom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      dateNaissance: ['', Validators.required],
      adresse: [''],
      username: ['', Validators.required],
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      sexe: [Sexe.MASCULIN, Validators.required],
      relationAvecEtudiant: ['', Validators.required],
      enfantsIds: [[]],
      photo: ['']
    });
  }

  // Charger tous les étudiants
  loadAllEtudiants(): void {
    this.etudiantService.getAllEtudiants().subscribe({
      next: (response) => {
        if (response.success) {
          this.allEtudiants = response.data;
          this.filteredEtudiants = [...this.allEtudiants];

          // Si en mode édition, charger les étudiants sélectionnés
          if (this.isEditMode && this.parentToEdit && this.parentToEdit.enfants) {
            this.selectedEtudiants = this.parentToEdit.enfants;

            // Mettre à jour le champ enfantsIds dans le formulaire
            const enfantsIds = this.selectedEtudiants.map(etudiant => etudiant.id);
            this.formParent.get('enfantsIds')?.setValue(enfantsIds);
          }
        } else {
          console.error('Erreur lors du chargement des étudiants:', response.message);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des étudiants:', error);
      }
    });
  }

  // Rechercher des étudiants
  searchEtudiants(): void {
    this.searchPerformed = true;
    if (!this.searchTerm.trim()) {
      // Si le terme de recherche est vide, afficher tous les étudiants
      this.filteredEtudiants = [...this.allEtudiants];
      return;
    }

    // Filtrer les étudiants selon le terme de recherche
    const searchTermLower = this.searchTerm.toLowerCase();
    this.filteredEtudiants = this.allEtudiants.filter(etudiant =>
      etudiant.nom.toLowerCase().includes(searchTermLower) ||
      etudiant.prenom.toLowerCase().includes(searchTermLower) ||
      (etudiant.numeroEtudiant && etudiant.numeroEtudiant.toLowerCase().includes(searchTermLower))
    );
  }

  // Vérifier si un étudiant est déjà sélectionné
  isEtudiantSelected(etudiantId: number): boolean {
    return this.selectedEtudiants.some(etudiant => etudiant.id === etudiantId);
  }

  // Ajouter ou supprimer un étudiant de la sélection
  toggleEtudiantSelection(etudiant: EtudiantResponse): void {
    if (this.isEtudiantSelected(etudiant.id)) {
      // Si l'étudiant est déjà sélectionné, le retirer
      this.removeEtudiant(etudiant);
    } else {
      // Sinon, l'ajouter à la sélection
      this.selectedEtudiants.push(etudiant);

      // Mettre à jour le champ enfantsIds dans le formulaire
      const enfantsIds = this.selectedEtudiants.map(e => e.id);
      this.formParent.get('enfantsIds')?.setValue(enfantsIds);
    }
  }

  // Supprimer un étudiant de la sélection
  removeEtudiant(etudiant: EtudiantResponse): void {
    this.selectedEtudiants = this.selectedEtudiants.filter(e => e.id !== etudiant.id);

    // Mettre à jour le champ enfantsIds dans le formulaire
    const enfantsIds = this.selectedEtudiants.map(e => e.id);
    this.formParent.get('enfantsIds')?.setValue(enfantsIds);
  }

  updateFormWithParentData(): void {
    if (this.parentToEdit && this.formParent) {
      // Mettre à jour le formulaire avec les données du parent
      let dateNaissance = this.parentToEdit.dateNaissance;

      if (dateNaissance && dateNaissance.includes('-')) {
        const parts = dateNaissance.split('-');
        if (parts.length === 3 && parts[0].length === 2) {
          dateNaissance = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      this.formParent.patchValue({
        nom: this.parentToEdit.nom,
        prenom: this.parentToEdit.prenom,
        email: this.parentToEdit.email,
        telephone: this.parentToEdit.telephone,
        dateNaissance: dateNaissance,
        adresse: this.parentToEdit.adresse,
        username: this.parentToEdit.username,
        sexe: this.parentToEdit.sexe,
        relationAvecEtudiant: this.parentToEdit.relationAvecEtudiant,
        photo: ''
      });

      // Si le parent a des enfants, les ajouter à la liste des étudiants sélectionnés
      if (this.parentToEdit.enfants && this.parentToEdit.enfants.length > 0) {
        this.selectedEtudiants = [...this.parentToEdit.enfants];

        // Mettre à jour le champ enfantsIds dans le formulaire
        const enfantsIds = this.selectedEtudiants.map(etudiant => etudiant.id);
        this.formParent.get('enfantsIds')?.setValue(enfantsIds);
      }

      const passwordControl = this.formParent.get('password');
      if (passwordControl) {
        passwordControl.setValidators(this.isEditMode ? [Validators.minLength(6)] : [Validators.required, Validators.minLength(6)]);
        passwordControl.updateValueAndValidity();
      }
    }
  }

  onSubmit(): void {
    if (this.formParent.valid) {
      if (this.isEditMode) {
        this.updateParent();
      } else {
        this.insert();
      }
    } else {
      // Afficher les champs invalides
      const invalidFields: string[] = [];
      Object.keys(this.formParent.controls).forEach(key => {
        const control = this.formParent.get(key);
        if (control?.invalid) {
          invalidFields.push(key);
        }
      });

      alert(`Veuillez remplir correctement tous les champs obligatoires. Champs invalides: ${invalidFields.join(', ')}`);
    }
  }

  insert(): void {
    if (this.formParent.valid) {
      const dateNaissanceInput = this.formParent.value.dateNaissance;
      const dateNaissance = this.formatDateForBackend(dateNaissanceInput);

      const newParent: ParentRequest = {
        nom: this.formParent.value.nom,
        prenom: this.formParent.value.prenom,
        email: this.formParent.value.email,
        telephone: this.formParent.value.telephone || "",
        dateNaissance: dateNaissance,
        adresse: this.formParent.value.adresse || "",
        username: this.formParent.value.username,
        password: this.formParent.value.password,
        sexe: this.formParent.value.sexe,
        role: Role.PARENT,
        relationAvecEtudiant: this.formParent.value.relationAvecEtudiant,
        enfantsIds: this.formParent.value.enfantsIds || [],
        photo: ""
      };

      this.parentService.createParent(newParent).subscribe({
        next: (response) => {
          if (response.success) {
            alert("Parent créé avec succès!");
            console.log(newParent)
            this.resetForm();
            this.parentCreated.emit();
          } else {
            alert("Erreur lors de la création du parent: " + (response.message || ""));
          }
        },
        error: (error) => {
          console.error('Erreur lors de la création du parent:', error);
          alert("Erreur lors de la création du parent: " + (error.message || "Erreur inconnue"));
        }
      });
    }
  }

  updateParent(): void {
    if (!this.parentToEdit) return;

    if (this.formParent.valid) {
      const dateNaissanceInput = this.formParent.value.dateNaissance;
      const dateNaissance = this.formatDateForBackend(dateNaissanceInput);

      const updatedParent: ParentRequest = {
        nom: this.formParent.value.nom,
        prenom: this.formParent.value.prenom,
        email: this.formParent.value.email,
        telephone: this.formParent.value.telephone || "",
        dateNaissance: dateNaissance,
        adresse: this.formParent.value.adresse || "",
        username: this.formParent.value.username,
        password: this.formParent.value.password,
        sexe: this.formParent.value.sexe,
        role: Role.PARENT,
        relationAvecEtudiant: this.formParent.value.relationAvecEtudiant,
        enfantsIds: this.formParent.value.enfantsIds || [],
        photo: ""
      };

      this.parentService.updateParent(this.parentToEdit.id, updatedParent).subscribe({
        next: (response) => {
          if (response.success) {
            alert("Parent mis à jour avec succès!");
            console.log(updatedParent)
            this.resetForm();
            this.isEditMode = false;
            this.parentUpdated.emit();
          } else {
            console.log(updatedParent)
            alert("Erreur lors de la mise à jour du parent: " + (response.message || ""));
          }
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du parent:', error);
          alert("Erreur lors de la mise à jour du parent: " + (error.message || "Erreur inconnue"));
        }
      });
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

  resetForm(): void {
    this.formParent.reset();
    this.initForm();
    this.selectedEtudiants = [];
    this.searchTerm = '';
    this.searchPerformed = false;
    this.filteredEtudiants = [...this.allEtudiants];
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.resetForm();
  }
}
