// src/app/features/dashboard/enseignant/seances-enseignant/filtres-seances/filtres-seances.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ModuleService } from '../../../../../core/services/module.service';
import { ModuleResponse } from '../../../../../core/dto/module/module-response';
import { StatusSeance } from '../../../../../core/enums/StatusSeance';
import { FiltresSeances } from '../seances-enseignant.component';

@Component({
  selector: 'app-filtres-seances',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './filtres-seances.component.html',
  styleUrls: ['./filtres-seances.component.css']
})
export class FiltresSeancesComponent implements OnInit {
  @Input() filtresInitiaux: FiltresSeances = {};
  @Output() filtresChanged = new EventEmitter<FiltresSeances>();

  filtresForm!: FormGroup;
  modules: ModuleResponse[] = [];
  statusOptions = Object.values(StatusSeance);
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private moduleService: ModuleService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.chargerModules();
    this.setupFormSubscriptions();
  }

  initForm(): void {
    this.filtresForm = this.fb.group({
      typeFiltre: ['periode'], // 'periode' ou 'date'
      dateDebut: [this.filtresInitiaux.dateDebut || ''],
      dateFin: [this.filtresInitiaux.dateFin || ''],
      date: [this.filtresInitiaux.date || ''],
      statut: [this.filtresInitiaux.statut || ''],
      moduleId: [this.filtresInitiaux.moduleId || '']
    });
  }

  setupFormSubscriptions(): void {
    this.filtresForm.valueChanges.subscribe(() => {
      this.emittreFiltres();
    });
  }

  chargerModules(): void {
    this.isLoading = true;
    this.moduleService.getMesModules().subscribe({
      next: (response) => {
        if (response.success) {
          this.modules = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des modules:', error);
        this.isLoading = false;
      }
    });
  }

  emittreFiltres(): void {
    const formValue = this.filtresForm.value;
    const filtres: FiltresSeances = {};

    if (formValue.typeFiltre === 'periode') {
      if (formValue.dateDebut) filtres.dateDebut = formValue.dateDebut;
      if (formValue.dateFin) filtres.dateFin = formValue.dateFin;
    } else if (formValue.typeFiltre === 'date') {
      if (formValue.date) filtres.date = formValue.date;
    }

    if (formValue.statut) filtres.statut = formValue.statut;
    if (formValue.moduleId) filtres.moduleId = formValue.moduleId;

    this.filtresChanged.emit(filtres);
  }

  onTypeChangement(): void {
    const typeFiltre = this.filtresForm.get('typeFiltre')?.value;

    if (typeFiltre === 'date') {
      this.filtresForm.patchValue({
        dateDebut: '',
        dateFin: ''
      });
    } else {
      this.filtresForm.patchValue({
        date: ''
      });
    }
  }

  resetFiltres(): void {
    this.filtresForm.reset({
      typeFiltre: 'periode',
      dateDebut: '',
      dateFin: '',
      date: '',
      statut: '',
      moduleId: ''
    });
  }

  setSemaineActuelle(): void {
    const aujourdhui = new Date();
    const lundi = new Date(aujourdhui);
    lundi.setDate(aujourdhui.getDate() - aujourdhui.getDay() + 1);

    const dimanche = new Date(lundi);
    dimanche.setDate(lundi.getDate() + 6);

    this.filtresForm.patchValue({
      typeFiltre: 'periode',
      dateDebut: lundi.toISOString().split('T')[0],
      dateFin: dimanche.toISOString().split('T')[0]
    });
  }

  setDateAujourdhui(): void {
    const aujourdhui = new Date().toISOString().split('T')[0];
    this.filtresForm.patchValue({
      typeFiltre: 'date',
      date: aujourdhui
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
}
