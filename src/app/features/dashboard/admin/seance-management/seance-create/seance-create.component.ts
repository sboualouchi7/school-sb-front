import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SeanceService } from '../../../../../core/services/seance.service';
import { EnseignantService } from '../../../../../core/services/enseignant.service';
import { ModuleService } from '../../../../../core/services/module.service';
import { SeanceRequest } from '../../../../../core/dto/seance/seance-request';
import { SeanceResponse } from '../../../../../core/dto/seance/seance-response';
import { EnseignantResponse } from '../../../../../core/dto/enseignant/enseignant-response';
import { ModuleResponse } from '../../../../../core/dto/module/module-response';
import { StatusSeance } from '../../../../../core/enums/StatusSeance';
import { NumeroSeance } from '../../../../../core/enums/NumeroSeance';

@Component({
  selector: 'app-seance-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './seance-create.component.html',
  styleUrls: ['./seance-create.component.css']
})
export class SeanceCreateComponent implements OnInit, OnChanges {
  @Output() seanceCreated = new EventEmitter<void>();
  @Output() seanceUpdated = new EventEmitter<void>();
  @Input() seanceToEdit: SeanceResponse | null = null;

  seanceForm!: FormGroup;
  enseignants: EnseignantResponse[] = [];
  modules: ModuleResponse[] = [];
  allModules: ModuleResponse[] = [];

  statusOptions = Object.values(StatusSeance);
  numeroSeanceOptions = Object.values(NumeroSeance);

  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private seanceService: SeanceService,
    private enseignantService: EnseignantService,
    private moduleService: ModuleService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEnseignants();
    this.loadModules();
    this.setupFormSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seanceToEdit'] && changes['seanceToEdit'].currentValue) {
      this.isEditMode = true;
      this.updateFormWithSeanceData();
    } else if (changes['seanceToEdit'] && !changes['seanceToEdit'].currentValue) {
      this.isEditMode = false;
      this.resetForm();
    }
  }

  initForm(): void {
    this.seanceForm = this.fb.group({
      enseignantId: ['', Validators.required],
      moduleId: ['', Validators.required],
      date: ['', Validators.required],
      heureDebut: ['', Validators.required],
      heureFin: ['', Validators.required],
      numeroSeance: ['', Validators.required],
      statut: [StatusSeance.PLANIFIEE, Validators.required],
      description: [''],
      effectuee: [false]
    });
  }

  setupFormSubscriptions(): void {
    // Filtrer les modules quand l'enseignant change
    this.seanceForm.get('enseignantId')?.valueChanges.subscribe(enseignantId => {
      this.filterModulesByEnseignant(enseignantId);
    });

    // Mettre à jour le statut quand la case "effectuée" change
    this.seanceForm.get('effectuee')?.valueChanges.subscribe(effectuee => {
      if (effectuee) {
        this.seanceForm.patchValue({ statut: StatusSeance.REALISEE });
      } else if (this.seanceForm.get('statut')?.value === StatusSeance.REALISEE) {
        this.seanceForm.patchValue({ statut: StatusSeance.PLANIFIEE });
      }
    });

    // Mettre à jour la case "effectuée" quand le statut change
    this.seanceForm.get('statut')?.valueChanges.subscribe(statut => {
      const effectueeControl = this.seanceForm.get('effectuee');
      if (statut === StatusSeance.REALISEE) {
        effectueeControl?.setValue(true);
      } else {
        effectueeControl?.setValue(false);
      }
    });
  }

  loadEnseignants(): void {
    this.enseignantService.getAllEnseignants().subscribe({
      next: (response) => {
        if (response.success) {
          this.enseignants = response.data;
          if (this.isEditMode && this.seanceToEdit) {
            this.updateFormWithSeanceData();
          }
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des enseignants:', error);
      }
    });
  }

  loadModules(): void {
    this.moduleService.getAllModules().subscribe({
      next: (response) => {
        if (response.success) {
          this.allModules = response.data;
          this.modules = [...this.allModules];
          if (this.isEditMode && this.seanceToEdit) {
            this.updateFormWithSeanceData();
          }
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des modules:', error);
      }
    });
  }

  filterModulesByEnseignant(enseignantId: number | null): void {
    if (!enseignantId) {
      this.modules = [...this.allModules];
    } else {
      this.modules = this.allModules.filter(module =>
        module.enseignantId === enseignantId
      );
    }

    // Réinitialiser le module sélectionné si nécessaire
    const currentModuleId = this.seanceForm.get('moduleId')?.value;
    if (currentModuleId && !this.modules.find(m => m.id === currentModuleId)) {
      this.seanceForm.patchValue({ moduleId: '' });
    }
  }

  updateFormWithSeanceData(): void {
    if (!this.seanceToEdit || !this.seanceForm) return;

    // Convertir la date au format yyyy-MM-dd pour l'input date
    let date = this.seanceToEdit.date;
    if (date && date.includes('-')) {
      const parts = date.split('-');
      if (parts.length === 3 && parts[0].length === 2) {
        date = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
    }

    // Filtrer les modules pour l'enseignant sélectionné
    this.filterModulesByEnseignant(this.seanceToEdit.enseignantId);

    this.seanceForm.patchValue({
      enseignantId: this.seanceToEdit.enseignantId,
      moduleId: this.seanceToEdit.moduleId,
      date: date,
      heureDebut: this.seanceToEdit.heureDebut,
      heureFin: this.seanceToEdit.heureFin,
      numeroSeance: this.seanceToEdit.numeroSeance,
      statut: this.seanceToEdit.statut,
      description: this.seanceToEdit.description || '',
      effectuee: this.seanceToEdit.statut === StatusSeance.REALISEE
    });
  }

  onSubmit(): void {
    if (this.seanceForm.valid) {
      if (this.isEditMode) {
        this.updateSeance();
      } else {
        this.createSeance();
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  createSeance(): void {
    const dateInput = this.seanceForm.value.date;
    const date = this.formatDateForBackend(dateInput);

    const newSeance: SeanceRequest = {
      enseignantId: this.seanceForm.value.enseignantId,
      moduleId: this.seanceForm.value.moduleId,
      date: date,
      heureDebut: this.seanceForm.value.heureDebut,
      heureFin: this.seanceForm.value.heureFin,
      numeroSeance: this.seanceForm.value.numeroSeance,
      statut: this.seanceForm.value.statut,
      description: this.seanceForm.value.description || undefined
    };

    this.seanceService.createSeance(newSeance).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Séance créée avec succès:', response.data);
          this.resetForm();
          this.seanceCreated.emit();
        } else {
          console.error('Erreur lors de la création de la séance:', response.message);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la création de la séance:', error);
      }
    });
  }

  updateSeance(): void {
    if (!this.seanceToEdit) return;

    const dateInput = this.seanceForm.value.date;
    const date = this.formatDateForBackend(dateInput);

    const updatedSeance: SeanceRequest = {
      enseignantId: this.seanceForm.value.enseignantId,
      moduleId: this.seanceForm.value.moduleId,
      date: date,
      heureDebut: this.seanceForm.value.heureDebut,
      heureFin: this.seanceForm.value.heureFin,
      numeroSeance: this.seanceForm.value.numeroSeance,
      statut: this.seanceForm.value.statut,
      description: this.seanceForm.value.description || undefined
    };

    this.seanceService.updateSeance(this.seanceToEdit.id, updatedSeance).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Séance mise à jour avec succès:', response.data);
          this.resetForm();
          this.isEditMode = false;
          this.seanceUpdated.emit();
        } else {
          console.error('Erreur lors de la mise à jour de la séance:', response.message);
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de la séance:', error);
      }
    });
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
    this.seanceForm.reset();
    this.initForm();
    this.modules = [...this.allModules];
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.resetForm();
  }

  markFormGroupTouched(): void {
    Object.keys(this.seanceForm.controls).forEach(key => {
      const control = this.seanceForm.get(key);
      control?.markAsTouched();
    });
  }

  formatStatus(status: string): string {
    switch (status) {
      case StatusSeance.PLANIFIEE:
        return 'Planifiée';
      case StatusSeance.APPROUVEE:
        return 'Approuvée';
      case StatusSeance.REALISEE:
        return 'Réalisée';
      case StatusSeance.ANNULEE:
        return 'Annulée';
      default:
        return status;
    }
  }

  // Validation personnalisée pour vérifier que l'heure de fin est après l'heure de début
  validateTimeRange(): boolean {
    const heureDebut = this.seanceForm.get('heureDebut')?.value;
    const heureFin = this.seanceForm.get('heureFin')?.value;

    if (heureDebut && heureFin) {
      return heureFin > heureDebut;
    }
    return true;
  }

  // Suggérer l'heure de fin automatiquement (1h30 après le début)
  onHeureDebutChange(): void {
    const heureDebut = this.seanceForm.get('heureDebut')?.value;
    if (heureDebut && !this.seanceForm.get('heureFin')?.value) {
      const [hours, minutes] = heureDebut.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(hours, minutes + 90); // Ajouter 1h30

      const endHours = endTime.getHours().toString().padStart(2, '0');
      const endMinutes = endTime.getMinutes().toString().padStart(2, '0');

      this.seanceForm.patchValue({
        heureFin: `${endHours}:${endMinutes}`
      });
    }
  }
}
