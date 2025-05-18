// src/app/features/dashboard/parent/tableau-bord/tableau-bord.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { SelectionEnfantComponent } from '../selection-enfant/selection-enfant.component';
import { NotesEnfantComponent } from '../notes-enfant/notes-enfant.component';
import { AbsencesEnfantComponent } from '../absences-enfant/absences-enfant.component';
import { EtudiantResponse } from '../../../../core/dto/etudiant/etudiant-response';
import { AuthService } from '../../../../core/services/auth-service';
import { ParentDashboardService } from '../../../../core/services/parent-dashboard.service';

@Component({
  selector: 'app-tableau-bord',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    SelectionEnfantComponent,
    NotesEnfantComponent,
    AbsencesEnfantComponent
  ],
  templateUrl: './tableau-bord.component.html',
  styleUrls: ['./tableau-bord.component.css']
})
export class TableauBordComponent implements OnInit {
  selectedEnfant: EtudiantResponse | null = null;
  currentView: 'selection' | 'notes' | 'absences' = 'selection';
  parentName: string = '';
  reloadKey: number = 0; // Ajout de cette variable pour forcer le rechargement

  constructor(
    private authService: AuthService,
    private router: Router,
    private parentService: ParentDashboardService
  ) {}

  ngOnInit(): void {
    this.loadParentInfo();
  }

  loadParentInfo(): void {
    const currentUser = this.authService.currentUserSubject.value;
    if (currentUser) {
      this.parentName = currentUser.sub || 'Parent';
    }
  }

  onEnfantSelectionne(enfant: EtudiantResponse | null): void {
    this.selectedEnfant = enfant;

    // Si un enfant est sélectionné, passer en mode sélection pour afficher les options
    if (enfant) {
      this.currentView = 'selection';
    } else {
      this.currentView = 'selection';
    }
  }

  showNotes(): void {
    if (this.selectedEnfant) {
      this.currentView = 'notes';
    }
  }

  showAbsences(): void {
    if (this.selectedEnfant) {
      this.currentView = 'absences';
    }
  }

  backToSelection(): void {
    this.currentView = 'selection';
  }

  resetSelection(): void {
    // Effacer l'enfant sélectionné dans le service
    this.parentService.clearSelectedEnfant();

    // Réinitialiser l'état local
    this.selectedEnfant = null;
    this.currentView = 'selection';

    // Incrémenter la clé pour forcer le rechargement
    this.reloadKey++;
  }

  getEnfantDisplayName(): string {
    if (this.selectedEnfant) {
      return `${this.selectedEnfant.prenom} ${this.selectedEnfant.nom}`;
    }
    return '';
  }

  // Méthode pour forcer le rechargement du composant de sélection
  forceReloadSelection(): void {
    // Cela force Angular à recréer le composant de sélection
    this.currentView = 'selection';
    setTimeout(() => {
      if (!this.selectedEnfant) {
        // Force la détection de changement
        this.ngOnInit();
      }
    }, 0);
  }
}
