import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeanceListComponent } from './seance-list/seance-list.component';
import { SeanceCreateComponent } from './seance-create/seance-create.component';
import { SeanceFiltersComponent } from './seance-filters/seance-filters.component';
import { SeanceResponse } from '../../../../core/dto/seance/seance-response';

export interface SeanceFilters {
  semaine?: string;
  enseignantId?: number;
  moduleId?: number;
  statut?: string;
}

@Component({
  selector: 'app-seance-management',
  standalone: true,
  imports: [
    CommonModule,
    SeanceListComponent,
    SeanceCreateComponent,
    SeanceFiltersComponent
  ],
  templateUrl: './seance-management.component.html',
  styleUrls: ['./seance-management.component.css']
})
export class SeanceManagementComponent {
  @ViewChild(SeanceListComponent) listComponent!: SeanceListComponent;

  showModal = false;
  seanceToEdit: SeanceResponse | null = null;
  currentFilters: SeanceFilters = {};

  openModal() {
    this.showModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.showModal = false;
    this.seanceToEdit = null;
    document.body.style.overflow = 'auto';
  }

  onSeanceCreated() {
    this.closeModal();
    this.refreshSeanceList();
  }

  onSeanceUpdated() {
    this.closeModal();
    this.refreshSeanceList();
  }

  onEditSeance(seance: SeanceResponse) {
    this.seanceToEdit = seance;
    this.openModal();
  }

  onFiltersChanged(filters: SeanceFilters) {
    this.currentFilters = filters;
    this.refreshSeanceList();
  }

  refreshSeanceList() {
    if (this.listComponent) {
      this.listComponent.applyFilters(this.currentFilters);
    }
  }
}
