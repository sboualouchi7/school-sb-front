// src/app/features/dashboard/parent/absences-enfant/absences-enfant.component.ts
import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentDashboardService } from '../../../../core/services/parent-dashboard.service';
import { EtudiantResponse } from '../../../../core/dto/etudiant/etudiant-response';
import { AbsenceResponse } from '../../../../core/dto/absence/absence-response';
import { ModuleResponse } from '../../../../core/dto/module/module-response';

@Component({
  selector: 'app-absences-enfant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './absences-enfant.component.html',
  styleUrls: ['./absences-enfant.component.css']
})
export class AbsencesEnfantComponent implements OnInit, OnChanges {
  @Input() enfant!: EtudiantResponse;

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

  constructor(private parentService: ParentDashboardService) {}

  ngOnInit(): void {
    if (this.enfant) {
      this.loadModules();
      this.loadAbsences();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['enfant'] && this.enfant) {
      this.resetFilters();
      this.loadModules();
      this.loadAbsences();
    }
  }

  loadModules(): void {
    if (!this.enfant) return;

    this.isLoading.modules = true;
    this.error.modules = null;

    this.parentService.getModulesEnfant(this.enfant.id).subscribe({
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
    if (!this.enfant) return;

    this.isLoading.absences = true;
    this.error.absences = null;

    // Déterminer quelle méthode utiliser selon les filtres
    if (this.selectedModuleId) {
      // Filtrer par module
      this.parentService.getAbsencesEnfantParModule(this.enfant.id, this.selectedModuleId)
        .subscribe(this.handleAbsencesResponse.bind(this));
    } else if (this.dateDebut && this.dateFin) {
      // Filtrer par période
      this.parentService.getAbsencesEnfantParPeriode(this.enfant.id, this.dateDebut, this.dateFin)
        .subscribe(this.handleAbsencesResponse.bind(this));
    } else {
      // Charger toutes les absences
      this.parentService.getAbsencesEnfant(this.enfant.id)
        .subscribe(this.handleAbsencesResponse.bind(this));
    }
  }

  handleAbsencesResponse(response: any): void {
    if (response.success) {
      this.absences = response.data;
      // Tri par date (de la plus récente à la plus ancienne)
      this.absences.sort((a, b) =>
        new Date(b.dateDebut).getTime() - new Date(a.dateDebut).getTime()
      );
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
      // Vérifier que la date de début est antérieure à la date de fin
      const debut = new Date(this.dateDebut);
      const fin = new Date(this.dateFin);

      if (debut > fin) {
        // Inverser les dates si nécessaire
        [this.dateDebut, this.dateFin] = [this.dateFin, this.dateDebut];
      }

      this.loadAbsences();
    } else if (!this.dateDebut && !this.dateFin) {
      // Si les deux dates sont vides, recharger toutes les absences
      this.loadAbsences();
    }
  }

  resetFilters(): void {
    this.selectedModuleId = null;
    this.dateDebut = '';
    this.dateFin = '';
    this.error = {
      absences: null,
      modules: null
    };
  }

  // Calculer les statistiques
  calculateTotalAbsences(): number {
    return this.absences.length;
  }

  calculateAbsencesJustifiees(): number {
    return this.absences.filter(absence => absence.validee).length;
  }

  calculateAbsencesNonJustifiees(): number {
    return this.absences.filter(absence => !absence.validee).length;
  }

  // Calculer le pourcentage d'absences justifiées
  getJustificationPercentage(): number {
    if (this.absences.length === 0) return 0;
    return Math.round((this.calculateAbsencesJustifiees() / this.absences.length) * 100);
  }

  // Obtenir les absences les plus récentes (pour l'aperçu)
  getRecentAbsences(limit: number = 5): AbsenceResponse[] {
    return this.absences.slice(0, limit);
  }

  // Grouper les absences par module
  getAbsencesByModule(): { [key: string]: AbsenceResponse[] } {
    const grouped: { [key: string]: AbsenceResponse[] } = {};

    this.absences.forEach(absence => {
      const moduleKey = absence.nomModule || absence.moduleSeance || 'Non défini';
      if (!grouped[moduleKey]) {
        grouped[moduleKey] = [];
      }
      grouped[moduleKey].push(absence);
    });

    return grouped;
  }

  // Obtenir les clés d'un objet (helper)
  getObjectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  // Formatter la date pour l'affichage
  formatDateForDisplay(dateString: string): string {
    if (!dateString) return '';

    try {
      let dateObject: Date;

      // Gestion des différents formats de date
      if (dateString.match(/^\d{2}-\d{2}-\d{4}$/)) {
        // Format dd-MM-yyyy
        const parts = dateString.split('-');
        dateObject = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        // Format yyyy-MM-dd
        dateObject = new Date(dateString);
      } else if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        // Format dd/MM/yyyy
        const parts = dateString.split('/');
        dateObject = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
        // Essayer de parser directement
        dateObject = new Date(dateString);
      }

      // Vérifier si la date est valide
      if (isNaN(dateObject.getTime())) {
        console.error('Date invalide:', dateString);
        return 'Date invalide';
      }

      return dateObject.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return 'Date invalide';
    }
  }

  // Obtenir l'icône selon le statut de l'absence
  getAbsenceStatusIcon(absence: AbsenceResponse): string {
    return absence.validee ? 'pi-check-circle' : 'pi-exclamation-triangle';
  }

  // Obtenir la classe CSS selon le statut de l'absence
  getAbsenceStatusClass(absence: AbsenceResponse): string {
    return absence.validee ? 'status-justified' : 'status-unjustified';
  }

  // Obtenir le libellé du statut
  getAbsenceStatusLabel(absence: AbsenceResponse): string {
    return absence.validee ? 'Justifiée' : 'Non justifiée';
  }

  // Calculer la durée en jours d'une absence
  calculateAbsenceDuration(absence: AbsenceResponse): number {
    try {
      const debut = new Date(absence.dateDebut);
      const fin = new Date(absence.dateFin);
      const diffTime = Math.abs(fin.getTime() - debut.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays + 1; // +1 pour inclure le jour de début
    } catch (error) {
      return 1; // Par défaut, considérer 1 jour
    }
  }

  // Vérifier si une absence est récente (dans les 7 derniers jours)
  isRecentAbsence(absence: AbsenceResponse): boolean {
    try {
      const absenceDate = new Date(absence.dateDebut);
      const now = new Date();
      const diffTime = now.getTime() - absenceDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    } catch (error) {
      return false;
    }
  }

  // TrackBy function pour optimiser les performances de la liste
  trackByAbsenceId(index: number, absence: AbsenceResponse): number {
    return absence.id;
  }
  getSelectedModuleLibelle(): string {
    if (!this.selectedModuleId) return '';
    const module = this.modules.find(m => m.id === this.selectedModuleId);
    return module ? module.libelle : 'Module sélectionné';
  }
}
