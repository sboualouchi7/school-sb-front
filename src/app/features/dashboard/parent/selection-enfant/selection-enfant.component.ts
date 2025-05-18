// src/app/features/dashboard/parent/selection-enfant/selection-enfant.component.ts
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ParentDashboardService } from '../../../../core/services/parent-dashboard.service';
import { EtudiantResponse } from '../../../../core/dto/etudiant/etudiant-response';

@Component({
  selector: 'app-selection-enfant',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './selection-enfant.component.html',
  styleUrls: ['./selection-enfant.component.css']
})
export class SelectionEnfantComponent implements OnInit {
  @Output() enfantSelectionne = new EventEmitter<EtudiantResponse | null>();

  enfants: EtudiantResponse[] = [];
  selectedEnfantId: number | null = null;
  selectedEnfant: EtudiantResponse | null = null;

  isLoading = false;
  error: string | null = null;

  constructor(private parentService: ParentDashboardService) {}

  ngOnInit(): void {
    this.chargerEnfants();

    // Récupérer l'enfant déjà sélectionné s'il existe
    const enfantSelectionneId = this.parentService.getSelectedEnfant();
    if (enfantSelectionneId) {
      this.selectedEnfantId = enfantSelectionneId;
    }
  }

  chargerEnfants(): void {
    this.isLoading = true;
    this.error = null;

    this.parentService.getMesEnfants().subscribe({
      next: (response) => {
        if (response.success) {
          this.enfants = response.data;

          // Si un enfant était déjà sélectionné, le retrouver dans la liste
          if (this.selectedEnfantId) {
            this.selectedEnfant = this.enfants.find(e => e.id === this.selectedEnfantId) || null;
            if (this.selectedEnfant) {
              this.enfantSelectionne.emit(this.selectedEnfant);
            }
          }
        } else {
          this.error = response.message || 'Erreur lors du chargement des enfants';
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Erreur de connexion au serveur';
        this.isLoading = false;
        console.error('Erreur lors du chargement des enfants:', err);
      }
    });
  }

  onSelectionChange(): void {
    if (this.selectedEnfantId) {
      this.selectedEnfant = this.enfants.find(e => e.id === this.selectedEnfantId) || null;

      if (this.selectedEnfant) {
        // Stocker la sélection dans le service
        this.parentService.setSelectedEnfant(this.selectedEnfantId);

        // Émettre l'événement vers le composant parent
        this.enfantSelectionne.emit(this.selectedEnfant);
      }
    } else {
      this.selectedEnfant = null;
      this.parentService.clearSelectedEnfant();
      this.enfantSelectionne.emit(null);
    }
  }

  getEnfantCompleteName(enfant: EtudiantResponse): string {
    return `${enfant.prenom} ${enfant.nom} - ${enfant.nomClasse}`;
  }
}
