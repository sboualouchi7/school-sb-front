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
  isLoadingModules = false;

  constructor(
    private fb: FormBuilder,
    private seanceService: SeanceService,
    private enseignantService: EnseignantService,
    private moduleService: ModuleService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadEnseignants();
    this.loadAllModules();
    this.setupFormSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['seanceToEdit'] && changes['seanceToEdit'].currentValue) {
      this.isEditMode = true;
      setTimeout(() => this.updateFormWithSeanceData(), 100);
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
      console.log('Enseignant sélectionné:', enseignantId);
      if (enseignantId) {
        this.loadModulesByEnseignant(Number(enseignantId));
      } else {
        this.modules = [...this.allModules];
        this.seanceForm.patchValue({ moduleId: '' });
      }
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
          console.log('Enseignants chargés:', this.enseignants.length);

          // Si on est en mode édition, charger les modules après le chargement des enseignants
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

  loadAllModules(): void {
    this.moduleService.getAllModules().subscribe({
      next: (response) => {
        if (response.success) {
          this.allModules = response.data;
          this.modules = [...this.allModules];
          console.log('Tous les modules chargés:', this.allModules.length);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement de tous les modules:', error);
      }
    });
  }

  loadModulesByEnseignant(enseignantId: number): void {
    this.isLoadingModules = true;
    console.log('Chargement des modules pour l\'enseignant:', enseignantId);

    // Filtrer les modules par enseignant depuis la liste complète
    this.modules = this.allModules.filter(module => module.enseignantId === enseignantId);
    this.isLoadingModules = false;

    console.log('Modules filtrés pour l\'enseignant:', this.modules.length);

    // Réinitialiser la sélection du module si celui actuellement sélectionné n'est pas disponible
    const currentModuleId = this.seanceForm.get('moduleId')?.value;
    if (currentModuleId && !this.modules.find(m => m.id === parseInt(currentModuleId))) {
      this.seanceForm.patchValue({ moduleId: '' });
    }
  }

  updateFormWithSeanceData(): void {
    if (!this.seanceToEdit || !this.seanceForm) return;

    console.log('Mise à jour du formulaire avec:', this.seanceToEdit);

    // Convertir la date pour l'input HTML (format yyyy-MM-dd)
    let dateForInput = '';
    if (this.seanceToEdit.date) {
      const dateStr = this.seanceToEdit.date;

      if (dateStr.includes('-')) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          if (parts[0].length === 2) {
            // Format dd-MM-yyyy vers yyyy-MM-dd
            dateForInput = `${parts[2]}-${parts[1]}-${parts[0]}`;
          } else if (parts[0].length === 4) {
            // Déjà au format yyyy-MM-dd
            dateForInput = dateStr;
          }
        }
      }
    }

    // Charger les modules pour l'enseignant d'abord
    this.loadModulesByEnseignant(this.seanceToEdit.enseignantId);

    this.seanceForm.patchValue({
      enseignantId: this.seanceToEdit.enseignantId,
      moduleId: this.seanceToEdit.moduleId,
      date: dateForInput,
      heureDebut: this.formatTimeForDisplay(this.seanceToEdit.heureDebut),
      heureFin: this.formatTimeForDisplay(this.seanceToEdit.heureFin),
      numeroSeance: this.seanceToEdit.numeroSeance,
      statut: this.seanceToEdit.statut,
      description: this.seanceToEdit.description || '',
      effectuee: this.seanceToEdit.statut === StatusSeance.REALISEE
    });
  }

  onSubmit(): void {
    console.log('Tentative de soumission du formulaire');
    console.log('Formulaire valide ?', this.seanceForm.valid);
    console.log('Valeurs du formulaire:', this.seanceForm.value);
    console.log('Erreurs du formulaire:', this.getFormErrors());

    if (this.seanceForm.valid && this.validateTimeRange()) {
      if (this.isEditMode) {
        this.updateSeance();
      } else {
        this.createSeance();
      }
    } else {
      this.markFormGroupTouched();
      console.error('Formulaire invalide, erreurs:', this.getFormErrors());
    }
  }

  private getFormErrors(): any {
    const formErrors: any = {};
    Object.keys(this.seanceForm.controls).forEach(key => {
      const controlErrors = this.seanceForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });
    return formErrors;
  }

  createSeance(): void {
    const formValue = this.seanceForm.value;

    const newSeance: SeanceRequest = {
      enseignantId: parseInt(formValue.enseignantId),
      moduleId: parseInt(formValue.moduleId),
      date: this.formatDateForBackend(formValue.date),
      heureDebut: this.formatTimeForBackend(formValue.heureDebut),
      heureFin: this.formatTimeForBackend(formValue.heureFin),
      numeroSeance: formValue.numeroSeance,
      statut: formValue.statut,
      description: formValue.description || undefined
    };

    console.log('Création de la séance avec les données:', newSeance);

    this.seanceService.createSeance(newSeance).subscribe({
      next: (response) => {
        console.log('Réponse du serveur:', response);
        if (response.success) {
          console.log('Séance créée avec succès:', response.data);
          alert('Séance créée avec succès !');
          this.resetForm();
          this.seanceCreated.emit();
        } else {
          console.error('Erreur lors de la création de la séance:', response.message);
          alert('Erreur lors de la création: ' + (response.message || 'Erreur inconnue'));
        }
      },
      error: (error) => {
        console.error('Erreur lors de la création de la séance:', error);
        alert('Erreur lors de la création: ' + (error.error?.message || error.message || 'Erreur inconnue'));
      }
    });
  }

  updateSeance(): void {
    if (!this.seanceToEdit) return;

    const formValue = this.seanceForm.value;

    const updatedSeance: SeanceRequest = {
      enseignantId: parseInt(formValue.enseignantId),
      moduleId: parseInt(formValue.moduleId),
      date: this.formatDateForBackend(formValue.date),
      heureDebut: this.formatTimeForBackend(formValue.heureDebut),
      heureFin: this.formatTimeForBackend(formValue.heureFin),
      numeroSeance: formValue.numeroSeance,
      statut: formValue.statut,
      description: formValue.description || undefined
    };

    console.log('Mise à jour de la séance avec les données formatées:', updatedSeance);

    this.seanceService.updateSeance(this.seanceToEdit.id, updatedSeance).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Séance mise à jour avec succès:', response.data);
          alert('Séance mise à jour avec succès !');
          this.resetForm();
          this.isEditMode = false;
          this.seanceUpdated.emit();
        } else {
          console.error('Erreur lors de la mise à jour de la séance:', response.message);
          alert('Erreur lors de la mise à jour: ' + (response.message || 'Erreur inconnue'));
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour de la séance:', error);
        alert('Erreur lors de la mise à jour: ' + (error.error?.message || error.message || 'Erreur inconnue'));
      }
    });
  }

  private formatDateForBackend(dateInput: string | Date): string {
    if (!dateInput) return '';

    let date: Date;

    // Si c'est déjà une chaîne au format attendu, la retourner
    if (typeof dateInput === 'string') {
      // Vérifier si c'est déjà au format dd-MM-yyyy
      if (/^\d{2}-\d{2}-\d{4}$/.test(dateInput)) {
        return dateInput;
      }

      // Si c'est au format yyyy-MM-dd (input HTML date)
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
        const parts = dateInput.split('-');
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      // Sinon, essayer de parser la date
      date = new Date(dateInput);
    } else {
      date = dateInput;
    }

    // Vérifier si la date est valide
    if (isNaN(date.getTime())) {
      console.error('Date invalide:', dateInput);
      return '';
    }

    // Formater au format dd-MM-yyyy
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  }

  private formatTimeForBackend(timeString: string): string {
    if (!timeString) return '';

    // Si l'heure contient déjà les secondes, les enlever
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
    }
    return timeString;
  }

  private formatTimeForDisplay(timeString: string): string {
    if (!timeString) return '';

    // Si l'heure contient les secondes, les enlever pour l'affichage
    if (timeString.includes(':')) {
      const parts = timeString.split(':');
      if (parts.length >= 2) {
        return `${parts[0]}:${parts[1]}`;
      }
    }
    return timeString;
  }

  resetForm(): void {
    this.seanceForm.reset({
      enseignantId: '',
      moduleId: '',
      date: '',
      heureDebut: '',
      heureFin: '',
      numeroSeance: '',
      statut: StatusSeance.PLANIFIEE,
      description: '',
      effectuee: false
    });
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

  validateTimeRange(): boolean {
    const heureDebut = this.seanceForm.get('heureDebut')?.value;
    const heureFin = this.seanceForm.get('heureFin')?.value;

    if (heureDebut && heureFin) {
      return heureFin > heureDebut;
    }
    return true;
  }

  onHeureDebutChange(): void {
    const heureDebut = this.seanceForm.get('heureDebut')?.value;
    const heureFin = this.seanceForm.get('heureFin')?.value;

    if (heureDebut && !heureFin) {
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
