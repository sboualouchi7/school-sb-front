// src/app/features/dashboard/etudiant/absences/absences.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EtudiantDashboardService } from '../../../../core/services/etudiant-dashboard.service';
import { AbsenceResponse } from '../../../../core/dto/absence/absence-response';
import { ModuleResponse } from '../../../../core/dto/module/module-response';

@Component({
  selector: 'app-absences',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './absences.component.html',
  styleUrls: ['./absences.component.css']
})
export class AbsencesComponent implements OnInit {
  absences: AbsenceResponse[] = [];
  modules: ModuleResponse[] = [];

  selectedModuleId: number | null = null;
  dateDebut: string = '';
  dateFin: string = '';

  isLoading = {
    absences: false,
    modules: false
  };

  error: {
    absences: string | null,
    modules: string | null
  } = {
    absences: null,
    modules: null
  };

  constructor(private etudiantService: EtudiantDashboardService) {}

  ngOnInit(): void {
    this.loadModules();
    this.loadAbsences();
  }

  loadModules(): void {
    this.isLoading.modules = true;
    this.error.modules = null;

    this.etudiantService.getMesModules().subscribe({
      next: (response) => {
        if (response.success) {
          this.modules = response.data;
        } else {
          this.error.modules = response.message || 'Erreur lors du chargement des modules';
        }
        this.isLoading.modules = false;
      },
      error: (err) => {
        this.error.modules = 'Erreur de connexion au serveur';
        this.isLoading.modules = false;
        console.error('Erreur lors du chargement des modules:', err);
      }
    });
  }

  loadAbsences(): void {
    this.isLoading.absences = true;
    this.error.absences = null;

    if (this.selectedModuleId) {
      // Filtrer par module
      this.etudiantService.getMesAbsencesParModule(this.selectedModuleId).subscribe(this.handleAbsencesResponse.bind(this));
    } else if (this.dateDebut && this.dateFin) {
      // Filtrer par période
      this.etudiantService.getMesAbsencesParPeriode(
        this.formatDateForBackend(this.dateDebut),
        this.formatDateForBackend(this.dateFin)
      ).subscribe(this.handleAbsencesResponse.bind(this));
    } else {
      // Charger toutes les absences
      this.etudiantService.getMesAbsences().subscribe(this.handleAbsencesResponse.bind(this));
    }
  }

  handleAbsencesResponse(response: any): void {
    if (response.success) {
      this.absences = response.data;
      // Tri par date (de la plus récente à la plus ancienne)
      this.absences.sort((a, b) => new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime());
    } else {
      this.error.absences = response.message || 'Erreur lors du chargement des absences';
    }
    this.isLoading.absences = false;
  }

  onModuleChange(): void {
    this.loadAbsences();
  }

  onDateFilterChange(): void {
    if (this.dateDebut && this.dateFin) {
      this.loadAbsences();
    }
  }

  resetFilters(): void {
    this.selectedModuleId = null;
    this.dateDebut = '';
    this.dateFin = '';
    this.loadAbsences();
  }

  calculateTotalAbsences(): number {
    return this.absences.length;
  }

  calculateNonJustifiedAbsences(): number {
    return this.absences.filter(absence => !absence.validee).length;
  }

  formatDateForDisplay(dateString: string): string {
    if (!dateString) return '';

    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  formatDateForBackend(dateString: string): string {
    if (!dateString) return '';

    const parts = dateString.split('-');
    if (parts.length === 3) {
      // Format YYYY-MM-DD to DD-MM-YYYY for backend
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateString;
  }
}
