import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { ParentResponse } from '../../../../../core/dto/parent/parent-response';
import { ParentService } from '../../../../../core/services/parent.service';

@Component({
  selector: 'app-parent-list',
  templateUrl: './parent-list.component.html',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule],
  styleUrls: ['./parent-list.component.css']
})
export class ParentListComponent implements OnInit {
  // Ajout de la colonne "actions" dans les colonnes affichées
  displayedColumns: string[] = ['id', 'nom', 'prenom', 'telephone', 'email', 'enfants', 'actions'];
  listParents: ParentResponse[] = [];

  // Variables pour la confirmation de suppression
  showDeleteConfirmation = false;
  parentIdToDelete: number | null = null;

  // Événement pour communiquer avec le composant parent
  @Output() editParentEvent = new EventEmitter<ParentResponse>();

  constructor(private parentService: ParentService) {}

  ngOnInit(): void {
    this.loadParents();
  }

  loadParents(): void {
    this.parentService.getAllParents().subscribe(response => {
      this.listParents = response.data;
      console.log('Parents chargés:', response.data);
    });
  }

  // Méthode utilitaire pour formater la liste des enfants
  getEnfantsList(parent: ParentResponse): string {
    if (!parent.enfants || parent.enfants.length === 0) {
      return 'Aucun';
    }
    return parent.enfants.map(enfant => enfant.nom + ' ' + enfant.prenom).join(', ');
  }

  // Méthode pour éditer un parent
  editParent(parent: ParentResponse): void {
    this.editParentEvent.emit(parent);
  }

  // Méthode pour demander confirmation avant suppression
  deleteParent(id: number): void {
    this.parentIdToDelete = id;
    this.showDeleteConfirmation = true;
  }

  // Méthode pour annuler la suppression
  cancelDelete(): void {
    this.showDeleteConfirmation = false;
    this.parentIdToDelete = null;
  }

  // Méthode pour confirmer la suppression
  confirmDelete(): void {
    if (this.parentIdToDelete) {
      this.parentService.deleteParent(this.parentIdToDelete).subscribe({
        next: (response) => {
          console.log('Parent supprimé avec succès');
          this.loadParents(); // Recharger la liste après suppression
          this.showDeleteConfirmation = false;
          this.parentIdToDelete = null;
        },
        error: (error) => {
          console.error('Erreur lors de la suppression du parent:', error);
          this.showDeleteConfirmation = false;
          this.parentIdToDelete = null;
        }
      });
    }
  }
}
