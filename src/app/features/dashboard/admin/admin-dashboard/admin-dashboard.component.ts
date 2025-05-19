import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatsCardsComponent } from './stats-cards/stats-cards.component';
import { SummaryTableComponent } from './summary-table/summary-table.component';
import { DashboardFiltersComponent } from './dashboard-filters/dashboard-filters.component';

interface DashboardFilters {
  periode?: string;
  statut?: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StatsCardsComponent,
    SummaryTableComponent,
    DashboardFiltersComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  currentFilters: DashboardFilters = {};

  ngOnInit(): void {
    // Initialisation du dashboard
    this.loadDashboardData();
  }

  onFiltersChanged(filters: DashboardFilters): void {
    this.currentFilters = filters;
    this.refreshDashboard();
  }

  private loadDashboardData(): void {
    // Logique initiale si nécessaire
  }

  private refreshDashboard(): void {
    // Rafraîchir les données basées sur les filtres
  }
}
