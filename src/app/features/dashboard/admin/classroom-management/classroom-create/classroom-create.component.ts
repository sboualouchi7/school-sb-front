// classroom-create.component.ts
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClasseRequest } from "../../../../../core/dto/classe/classe-request";
import { ClasseService } from "../../../../../core/services/classe.service";
import { NiveauResponse } from "../../../../../core/dto/niveau/niveau-response";
import { NiveauService } from "../../../../../core/services/niveau.service";
import { ClasseResponse } from "../../../../../core/dto/classe/classe-response";

@Component({
  selector: 'app-classroom-create',
  templateUrl: './classroom-create.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./classroom-create.component.css']
})
export class ClassroomCreateComponent implements OnInit, OnChanges {
  @Output() classCreated = new EventEmitter<void>();
  @Output() classUpdated = new EventEmitter<void>();
  @Input() classeToEdit: ClasseResponse | null = null;

  formClasse!: FormGroup;
  ListNiveaux!: NiveauResponse[];
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private classeService: ClasseService,
    private niveauxService: NiveauService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadNiveaux();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['classeToEdit'] && changes['classeToEdit'].currentValue) {
      this.isEditMode = true;
      this.updateFormWithClasseData();
    } else if (changes['classeToEdit'] && !changes['classeToEdit'].currentValue) {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  initForm(): void {
    this.formClasse = this.fb.group({
      nom: ['', Validators.required],
      niveauId: [null, Validators.required],
      anneeScolaire: ['', Validators.required],
      capacite: [null, [Validators.required, Validators.min(1)]]
    });
  }

  loadNiveaux(): void {
    this.niveauxService.getAllNiveaux().subscribe({
      next: (response) => {
        this.ListNiveaux = response.data;
        console.log("Niveaux chargés: " + response.data.length);

        if (this.isEditMode && this.classeToEdit) {
          this.updateFormWithClasseData();
        }
      },
      error: (error) => {
        console.error("Erreur lors du chargement des Niveaux:", error);
      }
    });
  }

  updateFormWithClasseData(): void {
    if (this.classeToEdit && this.formClasse) {
      this.formClasse.patchValue({
        nom: this.classeToEdit.nom,
        niveauId: this.classeToEdit.niveauId,
        anneeScolaire: this.classeToEdit.anneeScolaire,
        capacite: this.classeToEdit.capacite
      });
    }
  }

  onSubmit(): void {
    if (this.formClasse.valid) {
      if (this.isEditMode) {
        this.update();
      } else {
        this.insert();
      }
    }
  }

  insert(): void {
    if (this.formClasse.valid) {
      const newClasse: ClasseRequest = {
        nom: this.formClasse.value.nom,
        niveauId: this.formClasse.value.niveauId,
        anneeScolaire: this.formClasse.value.anneeScolaire,
        capacite: this.formClasse.value.capacite
      };

      this.classeService.createClasse(newClasse).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Classe créée avec succès:', response.data);
            this.resetForm();
            this.classCreated.emit();
          } else {
            console.error('Erreur lors de la création de la classe:', response.errors);
          }
        },
        error: (error) => {
          console.error('Erreur lors de la création de la classe:', error);
        }
      });
    }
  }

  update(): void {
    if (this.formClasse.valid && this.classeToEdit) {
      const updatedClasse: ClasseRequest = {
        nom: this.formClasse.value.nom,
        niveauId: this.formClasse.value.niveauId,
        anneeScolaire: this.formClasse.value.anneeScolaire,
        capacite: this.formClasse.value.capacite
      };

      this.classeService.updateClasse(this.classeToEdit.id, updatedClasse).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Classe mise à jour avec succès:', response.data);
            this.resetForm();
            this.isEditMode = false;
            this.classeToEdit = null;
            this.classUpdated.emit();
          } else {
            console.error('Erreur lors de la mise à jour de la classe:', response.errors);
          }
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de la classe:', error);
        }
      });
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.classeToEdit = null;
    this.resetForm();
  }

  resetForm(): void {
    this.formClasse.reset();
    this.initForm();
  }
}
