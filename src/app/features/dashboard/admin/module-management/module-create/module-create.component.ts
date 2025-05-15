import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ModuleRequest } from "../../../../../core/dto/module/module-request";
import { ModuleService } from "../../../../../core/services/module.service";
import { NiveauResponse } from "../../../../../core/dto/niveau/niveau-response";
import { NiveauService } from "../../../../../core/services/niveau.service";
import { ClasseResponse } from "../../../../../core/dto/classe/classe-response";
import { ClasseService } from "../../../../../core/services/classe.service";
import { EnseignantResponse } from "../../../../../core/dto/enseignant/enseignant-response";
import { EnseignantService } from "../../../../../core/services/enseignant.service";
import {ModuleResponse} from "../../../../../core/dto/module/module-response";
import {ClasseRequest} from "../../../../../core/dto/classe/classe-request";

@Component({
  selector: 'app-module-create',
  templateUrl: './module-create.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  styleUrls: ['./module-create.component.css']
})
export class ModuleCreateComponent implements OnInit, OnChanges {
  @Output() moduleCreated = new EventEmitter<void>();
  @Output() moduleUpdated = new EventEmitter<void>();
  @Input() moduleToEdit: ModuleResponse | null = null;

  formModule!: FormGroup;
  listNiveaux: NiveauResponse[] = [];
  listClasses: ClasseResponse[] = [];
  allClasses: ClasseResponse[] = [];
  listEnseignants: EnseignantResponse[] = [];
  typeModules: string[] = ['M', 'C', 'D'];
  // Module
  // Cours
  // Devoir
  isEditMode = false;


  constructor(
    private fb: FormBuilder,
    private moduleService: ModuleService,
    private niveauService: NiveauService,
    private classeService: ClasseService,
    private enseignantService: EnseignantService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.loadNiveaux();
    this.loadEnseignants();
    this.loadAllClasses();

    this.formModule.get('niveauId')?.valueChanges.subscribe(niveauId => {
      if (niveauId) {
        console.log("Niveau sélectionné: " + niveauId + ", type: " + typeof niveauId);
        this.filterClassesByNiveau(Number(niveauId));
      } else {
        this.listClasses = [];
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['moduleToEdit'] && changes['moduleToEdit'].currentValue) {
      this.isEditMode = true;
      this.updateFormWithModuleData();
    } else if (changes['moduleToEdit'] && !changes['moduleToEdit'].currentValue) {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  loadAllClasses(): void {
    this.classeService.getAllClasses().subscribe({
      next: (response) => {
        this.allClasses = response.data;
        console.log("Toutes les classes chargées: " + this.allClasses.length);

        if (this.isEditMode && this.moduleToEdit) {
          this.updateFormWithModuleData();
        }
      },
      error: (error) => {
        console.error("Erreur lors du chargement des classes:", error);
      }
    });
  }

  filterClassesByNiveau(niveauId: number): void {
    if (!this.allClasses) return;

    const niveauIdNumeric = Number(niveauId);

    this.listClasses = this.allClasses.filter(classe => Number(classe.niveauId) === niveauIdNumeric);

    console.log("Classes filtrées pour le niveau " + niveauId + ": " + this.listClasses.length);
    this.listClasses.forEach(classe => {
      console.log(`- ${classe.nom} (ID: ${classe.id}, NiveauID: ${classe.niveauId})`);
    });
  }

  initForm(): void {
    this.formModule = this.fb.group({
      libelle: ['', Validators.required],
      volumeHoraire: [null, [Validators.required, Validators.min(1)]],
      seuil: [null, [Validators.required, Validators.min(0)]],
      coefficient: [null, [Validators.required, Validators.min(1)]],
      description: [''],
      typeModule: ['', Validators.required],
      niveauId: [null, Validators.required],
      classeId: [null, Validators.required],
      enseignantId: [null, Validators.required]
    });
  }

  loadNiveaux(): void {
    this.niveauService.getAllNiveaux().subscribe({
      next: (response) => {
        this.listNiveaux = response.data;
        console.log("Niveaux chargés: " + response.data.length);

        if (this.isEditMode && this.moduleToEdit) {
          this.updateFormWithModuleData();
        }
      },
      error: (error) => {
        console.error("Erreur lors du chargement des niveaux:", error);
      }
    });
  }

  loadEnseignants(): void {
    this.enseignantService.getAllEnseignants().subscribe({
      next: (response) => {
        this.listEnseignants = response.data;
        console.log("Enseignants chargés: " + response.data.length);

        if (this.isEditMode && this.moduleToEdit) {
          this.updateFormWithModuleData();
        }
      },
      error: (error) => {
        console.error("Erreur lors du chargement des enseignants:", error);
      }
    });
  }

  updateFormWithModuleData(): void {
    if (this.moduleToEdit && this.formModule) {
      this.formModule.patchValue({
        libelle: this.moduleToEdit.libelle,
        volumeHoraire: this.moduleToEdit.volumeHoraire,
        seuil: this.moduleToEdit.seuil,
        coefficient: this.moduleToEdit.coefficient,
        description: this.moduleToEdit.description,
        typeModule: this.moduleToEdit.typeModule,
        niveauId: this.moduleToEdit.niveauId,
        classeId: this.moduleToEdit.classeId,
        enseignantId: this.moduleToEdit.enseignantId
      });
    }
  }

  onSubmit(): void {
    if (this.formModule.valid) {
      if (this.isEditMode) {
        this.update();
      } else {
        this.insert();
      }
    }
  }

  insert(): void {
    if (this.formModule.valid) {
      const newModule: ModuleRequest = {
        libelle: this.formModule.value.libelle,
        volumeHoraire: this.formModule.value.volumeHoraire,
        seuil: this.formModule.value.seuil,
        coefficient: this.formModule.value.coefficient,
        description: this.formModule.value.description,
        typeModule: this.formModule.value.typeModule,
        niveauId: this.formModule.value.niveauId,
        classeId: this.formModule.value.classeId,
        enseignantId: this.formModule.value.enseignantId
      };

      this.moduleService.createModule(newModule).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Module créé avec succès:', response.data);
            this.resetForm();
            this.moduleCreated.emit();
          } else {
            console.error('Erreur lors de la création du module:', response.errors);
          }
        },
        error: (error) => {
          console.error('Erreur lors de la création du module:', error);
        }
      });
    }
  }

  update(): void {
    if (this.formModule.valid && this.moduleToEdit) {
      const updatedModule: ModuleRequest = {
        libelle: this.formModule.value.libelle,
        volumeHoraire: this.formModule.value.volumeHoraire,
        seuil: this.formModule.value.seuil,
        coefficient: this.formModule.value.coefficient,
        description: this.formModule.value.description,
        typeModule: this.formModule.value.typeModule,
        niveauId: this.formModule.value.niveauId,
        classeId: this.formModule.value.classeId,
        enseignantId: this.formModule.value.enseignantId
      };

      this.moduleService.updateModule(this.moduleToEdit.id, updatedModule).subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Module mise à jour avec succès:', response.data);
            this.resetForm();
            this.isEditMode = false;
            this.moduleToEdit = null;
            this.moduleUpdated.emit();
          } else {
            console.error('Erreur lors de la mise à jour de la module:', response.errors);
          }
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour de la module:', error);
        }
      });
    }
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.moduleToEdit = null;
    this.resetForm();
  }

  resetForm(): void {
    this.formModule.reset();
    this.initForm();
  }
}
