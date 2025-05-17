// src/app/features/dashboard/etudiant/demandes/demandes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EtudiantDashboardService } from '../../../../core/services/etudiant-dashboard.service';
import { DocumentResponse } from '../../../../core/dto/document/document-response';
import { AuthService } from '../../../../core/services/auth-service';
import { StatusDocument } from '../../../../core/enums/StatusDocument';

@Component({
  selector: 'app-demandes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './demandes.component.html',
  styleUrls: ['./demandes.component.css']
})
export class DemandesComponent implements OnInit {
  demandes: DocumentResponse[] = [];
  etudiantId: number | null = null;

  isLoading = false;
  error: string | null = null;

  constructor(
    private etudiantService: EtudiantDashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getCurrentEtudiantId();
    this.loadDemandes();
  }

  getCurrentEtudiantId(): void {
    const currentUser = this.authService.currentUserSubject.value;
    if (currentUser && currentUser.id) {
      this.etudiantId = currentUser.id;
    }
  }

  loadDemandes(): void {
    if (!this.etudiantId) {
      this.error = "Impossible d'identifier l'étudiant connecté";
      return;
    }

    this.isLoading = true;
    this.error = null;

    this.etudiantService.getMesDemandes().subscribe({
      next: (response) => {
        if (response.success) {
          this.demandes = response.data;
          // Tri par date (de la plus récente à la plus ancienne)
          this.demandes.sort((a, b) =>
            new Date(b.dateCreation).getTime() - new Date(a.dateCreation).getTime()
          );
        } else {
          this.error = response.message || 'Erreur lors du chargement des demandes';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur de connexion au serveur';
        this.isLoading = false;
        console.error('Erreur lors du chargement des demandes:', err);
      }
    });
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

  formatDocumentType(type: string): string {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  formatDocumentStatus(status: string): string {
    switch (status) {
      case StatusDocument.DEMANDE:
        return 'Demandé';
      case StatusDocument.EN_TRAITEMENT:
        return 'En traitement';
      case StatusDocument.PRET:
        return 'Prêt';
      case StatusDocument.ARCHIVE:
        return 'Archivé';
      default:
        return status;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case StatusDocument.DEMANDE:
        return 'status-pending';
      case StatusDocument.EN_TRAITEMENT:
        return 'status-processing';
      case StatusDocument.PRET:
        return 'status-ready';
      case StatusDocument.ARCHIVE:
        return 'status-archived';
      default:
        return '';
    }
  }

  getDocumentTypeIcon(type: string): string {
    switch (type) {
      case 'ATTESTATION':
        return 'pi-file-pdf';
      case 'SCOLARITE':
        return 'pi-file-edit';
      case 'CERTIFICAT':
        return 'pi-file-excel';
      case 'PRESENCE':
        return 'pi-calendar-check';
      case 'RELEVE_NOTES':
        return 'pi-chart-bar';
      default:
        return 'pi-file-o';
    }
  }
}
