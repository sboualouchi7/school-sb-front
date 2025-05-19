import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { SeanceService } from '../../../../../core/services/seance.service';
import { SeanceResponse } from '../../../../../core/dto/seance/seance-response';
import { StatusSeance } from '../../../../../core/enums/StatusSeance';
import { SeanceFilters } from '../seance-management.component';
import { FilterPipe } from '../../../../../shared/pipes/filter.pipe';

@Component({
  selector: 'app-seance-list',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, FilterPipe],
  templateUrl: './seance-list.component.html',
  styleUrls: ['./seance-list.component.css']
})
export class SeanceListComponent implements OnInit {
  @Output() editSeanceEvent = new EventEmitter<SeanceResponse>();

  displayedColumns: string[] = [
    'date',
    'enseignant',
    'module',
    'numeroSeance',
    'statut',
    'effectuee',
    'actions'
  ];

  seances: SeanceResponse[] = [];
  filteredSeances: SeanceResponse[] = [];
  currentFilters: SeanceFilters = {};

  showDeleteConfirmation = false;
  seanceIdToDelete: number | null = null;

  // Exposition de StatusSeance pour le template
  StatusSeance = StatusSeance;

  constructor(private seanceService: SeanceService) {}

  ngOnInit(): void {
    this.loadAllSeances();
  }

  loadAllSeances(): void {
    this.seanceService.getAllSeances().subscribe({
      next: (response) => {
        if (response.success) {
          this.seances = response.data;
          this.applyFilters(this.currentFilters);
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement des séances:', error);
      }
    });
  }

  applyFilters(filters: SeanceFilters): void {
    this.currentFilters = filters;
    this.filteredSeances = this.seances.filter(seance => {
      // Filtre par semaine
      if (filters.semaine) {
        const seanceDate = new Date(seance.date);
        const filterDate = new Date(filters.semaine);
        const seanceWeek = this.getWeekStart(seanceDate);
        const filterWeek = this.getWeekStart(filterDate);

        if (seanceWeek.getTime() !== filterWeek.getTime()) {
          return false;
        }
      }

      // Filtre par enseignant
      if (filters.enseignantId && seance.enseignantId !== filters.enseignantId) {
        return false;
      }

      // Filtre par module
      if (filters.moduleId && seance.moduleId !== filters.moduleId) {
        return false;
      }

      // Filtre par statut
      if (filters.statut && seance.statut !== filters.statut) {
        return false;
      }

      return true;
    });
  }

  private getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  }

  editSeance(seance: SeanceResponse): void {
    this.editSeanceEvent.emit(seance);
  }

  deleteSeance(id: number): void {
    this.seanceIdToDelete = id;
    this.showDeleteConfirmation = true;
  }

  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.seanceIdToDelete = null;
  }

  confirmDelete(): void {
    if (this.seanceIdToDelete) {
      this.seanceService.deleteSeance(this.seanceIdToDelete).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadAllSeances();
          }
          this.showDeleteConfirmation = false;
          this.seanceIdToDelete = null;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.showDeleteConfirmation = false;
          this.seanceIdToDelete = null;
        }
      });
    }
  }

  toggleSeanceEffectuee(seance: SeanceResponse): void {
    const newStatut = seance.statut === StatusSeance.REALISEE ?
      StatusSeance.PLANIFIEE : StatusSeance.REALISEE;

    this.seanceService.updateStatut(seance.id, newStatut).subscribe({
      next: (response) => {
        if (response.success) {
          seance.statut = newStatut;
        }
      },
      error: (error) => {
        console.error('Erreur lors de la mise à jour du statut:', error);
      }
    });
  }

  formatStatut(statut: string): string {
    switch (statut) {
      case StatusSeance.PLANIFIEE:
        return 'Planifiée';
      case StatusSeance.APPROUVEE:
        return 'Approuvée';
      case StatusSeance.REALISEE:
        return 'Réalisée';
      case StatusSeance.ANNULEE:
        return 'Annulée';
      default:
        return statut;
    }
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case StatusSeance.PLANIFIEE:
        return 'status-planned';
      case StatusSeance.APPROUVEE:
        return 'status-approved';
      case StatusSeance.REALISEE:
        return 'status-completed';
      case StatusSeance.ANNULEE:
        return 'status-cancelled';
      default:
        return '';
    }
  }

  isSeanceEffectuee(seance: SeanceResponse): boolean {
    return seance.statut === StatusSeance.REALISEE;
  }

  formatTime(timeString: string): string {
    if (!timeString) return '';
    const parts = timeString.split(':');
    return `${parts[0]}:${parts[1]}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Méthodes statistiques
  getTotalSeances(): number {
    return this.filteredSeances.length;
  }

  getSeancesByStatut(statut: StatusSeance): number {
    return this.filteredSeances.filter(seance => seance.statut === statut).length;
  }

  getSeancesRealisees(): number {
    return this.getSeancesByStatut(StatusSeance.REALISEE);
  }

  getSeancesPlanifiees(): number {
    return this.getSeancesByStatut(StatusSeance.PLANIFIEE);
  }

  getSeancesAnnulees(): number {
    return this.getSeancesByStatut(StatusSeance.ANNULEE);
  }

  getSeancesApprouvees(): number {
    return this.getSeancesByStatut(StatusSeance.APPROUVEE);
  }

  // Calcul du pourcentage de réalisation
  getTauxRealisation(): number {
    const total = this.getTotalSeances();
    if (total === 0) return 0;
    return Math.round((this.getSeancesRealisees() / total) * 100);
  }

  // Export des données (pour future implémentation)
  exportToCSV(): void {
    const headers = ['Date', 'Enseignant', 'Module', 'Séance', 'Statut', 'Effectuée'];
    const data = this.filteredSeances.map(seance => [
      this.formatDate(seance.date),
      seance.enseignantId || '',
      seance.moduleId || '',
      seance.numeroSeance,
      this.formatStatut(seance.statut),
      this.isSeanceEffectuee(seance) ? 'Oui' : 'Non'
    ]);

    // Ici vous pouvez implementer l'export CSV
    console.log('Export CSV:', { headers, data });
    // Exemple : utiliser une librairie comme Papa Parse ou créer un blob
  }

  // Méthode pour rafraîchir les données
  refreshData(): void {
    this.loadAllSeances();
  }

  // Tri personnalisé (si nécessaire)
  sortData(sortState: any): void {
    // Implémentation du tri personnalisé si nécessaire
    console.log('Sort state:', sortState);
  }
}
