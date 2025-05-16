// features/dashboard/enseignant/gestion-notes/tableau-notes/tableau-notes.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { EvaluationService } from '../../../../../core/services/evaluation.service';
import { AuthService } from '../../../../../core/services/auth-service';
import { EtudiantAvecNotes, ColonneEvaluation, EvaluationTableau } from '../../../../../core/models/evaluation-tableau-interface.interface';
import { EvaluationRequest } from '../../../../../core/dto/evaluation/evaluation-request';
import { TypeEvaluation } from '../../../../../core/enums/TypeEvaluation';
import {forkJoin} from "rxjs";

@Component({
  selector: 'app-tableau-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, MatTableModule, MatSortModule],
  templateUrl: './tableau-notes.component.html',
  styleUrls: ['./tableau-notes.component.css']
})
export class TableauNotesComponent implements OnInit {
  @Input() moduleId!: number;
  @Input() classeId!: number;
  @Output() retour = new EventEmitter<void>();

  etudiants: EtudiantAvecNotes[] = [];
  colonnes: ColonneEvaluation[] = [];
  isLoading = false;
  isSaving = false;
  error: string | null = null;
  successMessage: string | null = null;

  displayedColumns: string[] = [];
  enseignantId: number | null = null;

  // Pour la gestion de l'édition des notes
  editingCell: { etudiantId: number, colonneId: string } | null = null;
  nouvelleNote: number | null = null;

  // Types d'évaluation disponibles pour l'ajout d'une colonne
  typesEvaluation = Object.values(TypeEvaluation);
  nouveauType: string = '';
  nouvelleDate: string = new Date().toISOString().split('T')[0];
  nouveauCoefficient: number = 1;

  constructor(
    private evaluationService: EvaluationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.getCurrentEnseignantId();
    this.chargerTableauNotes();
  }

  getCurrentEnseignantId(): void {
    const currentUser = this.authService.currentUserSubject.value;
    if (currentUser && currentUser.id) {
      this.enseignantId = currentUser.id;
    }
  }

  chargerTableauNotes(): void {
    if (!this.enseignantId) {
      this.error = "Impossible d'identifier l'enseignant connecté";
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.successMessage = null;

    this.evaluationService.construireTableauNotes(
      this.moduleId,
      this.classeId,
      this.enseignantId
    ).subscribe({
      next: (result) => {
        this.etudiants = result.etudiants;
        this.colonnes = result.colonnes;

        // Définir les colonnes à afficher
        this.displayedColumns = ['etudiant', ...this.colonnes.map(col => col.id), 'moyenne', 'actions'];

        this.isLoading = false;
      },
      error: (err) => {
        this.error = "Erreur lors du chargement des notes";
        this.isLoading = false;
        console.error('Erreur lors du chargement des notes:', err);
      }
    });
  }

  // Modifiez cette ligne pour accepter undefined
  editCell(etudiantId: number, colonneId: string, noteActuelle: number | null | undefined): void {
    this.editingCell = { etudiantId, colonneId };
    this.nouvelleNote = noteActuelle ?? null;
  }

  annulerEdition(): void {
    this.editingCell = null;
    this.nouvelleNote = null;
  }

  sauvegarderNote(etudiant: EtudiantAvecNotes, colonneId: string): void {
    if (this.editingCell === null || this.nouvelleNote === null) return;

    // Valider que la note est entre 0 et 20
    if (this.nouvelleNote < 0 || this.nouvelleNote > 20) {
      this.error = "La note doit être comprise entre 0 et 20";
      return;
    }

    const colonne = this.colonnes.find(col => col.id === colonneId);
    if (!colonne || !this.enseignantId) return;

    this.isSaving = true;

    const noteData = etudiant.notes[colonneId];
    let request: EvaluationRequest = {
      etudiantId: etudiant.id,
      moduleId: this.moduleId,
      enseignantId: this.enseignantId,
      sessionId: 1, // Valeur par défaut, à adapter selon votre modèle
      note: this.nouvelleNote,
      dateEvaluation: this.formatDateForBackend(colonne.date),
      type: colonne.type
    };

    if (noteData.commentaire) {
      request.commentaire = noteData.commentaire;
    }

    // Si c'est une nouvelle note
    if (noteData.estNouvelle) {
      this.evaluationService.create(request).subscribe({
        next: (response) => {
          if (response.success) {
            // Mettre à jour l'ID dans le tableau pour les futures modifications
            etudiant.notes[colonneId].id = response.data.id;
            etudiant.notes[colonneId].note = this.nouvelleNote;
            etudiant.notes[colonneId].estNouvelle = false;
            etudiant.notes[colonneId].estModifiee = false;

            this.successMessage = "Note enregistrée avec succès";
            setTimeout(() => this.successMessage = null, 3000);
          } else {
            this.error = response.message || "Erreur lors de l'enregistrement de la note";
          }
          this.isSaving = false;
          this.editingCell = null;
        },
        error: (err) => {
          this.error = "Erreur lors de l'enregistrement de la note";
          this.isSaving = false;
          console.error("Erreur lors de l'enregistrement de la note:", err);
        }
      });
    }
    // Si c'est une modification de note existante
    else if (noteData.id) {
      this.evaluationService.update(noteData.id, request).subscribe({
        next: (response) => {
          if (response.success) {
            etudiant.notes[colonneId].note = this.nouvelleNote;
            etudiant.notes[colonneId].estModifiee = false;

            this.successMessage = "Note mise à jour avec succès";
            setTimeout(() => this.successMessage = null, 3000);
          } else {
            this.error = response.message || "Erreur lors de la mise à jour de la note";
          }
          this.isSaving = false;
          this.editingCell = null;
        },
        error: (err) => {
          this.error = "Erreur lors de la mise à jour de la note";
          this.isSaving = false;
          console.error("Erreur lors de la mise à jour de la note:", err);
        }
      });
    }
  }

  calculerMoyenne(etudiant: EtudiantAvecNotes): number | null {
    let sommeNotes = 0;
    let sommeCoefficients = 0;

    for (const colonne of this.colonnes) {
      const noteData = etudiant.notes[colonne.id];
      if (noteData && noteData.note !== null) {
        sommeNotes += noteData.note * colonne.coefficient;
        sommeCoefficients += colonne.coefficient;
      }
    }

    if (sommeCoefficients === 0) return null;

    return parseFloat((sommeNotes / sommeCoefficients).toFixed(2));
  }

  ajouterColonne(): void {
    if (!this.nouveauType || !this.nouvelleDate) {
      this.error = "Veuillez sélectionner un type d'évaluation et une date";
      return;
    }

    // Générer un ID unique pour la nouvelle colonne
    const nouveauId = `${this.nouveauType}-${new Date().getTime()}`;

    // Ajouter la nouvelle colonne
    const nouvelleColonne: ColonneEvaluation = {
      id: nouveauId,
      titre: this.formatTitreEvaluation(this.nouveauType),
      type: this.nouveauType,
      date: this.nouvelleDate,
      coefficient: this.nouveauCoefficient
    };

    this.colonnes.push(nouvelleColonne);

    // Ajouter cette colonne aux colonnes affichées
    this.displayedColumns = ['etudiant', ...this.colonnes.map(col => col.id), 'moyenne', 'actions'];

    // Initialiser des notes vides pour tous les étudiants
    for (const etudiant of this.etudiants) {
      etudiant.notes[nouveauId] = {
        etudiantId: etudiant.id,
        note: null,
        estModifiee: false,
        estNouvelle: true
      };
    }

    // Réinitialiser les champs
    this.nouveauType = '';
    this.nouvelleDate = new Date().toISOString().split('T')[0];
    this.nouveauCoefficient = 1;
  }

  supprimerColonne(colonneId: string): void {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette colonne d'évaluation ?")) {
      const index = this.colonnes.findIndex(col => col.id === colonneId);
      if (index !== -1) {
        // Vérifier s'il y a des notes à supprimer dans la base de données
        const evaluationsASupprimer = this.etudiants
          .filter(etudiant => etudiant.notes[colonneId] && !etudiant.notes[colonneId].estNouvelle && etudiant.notes[colonneId].id)
          .map(etudiant => etudiant.notes[colonneId].id);

        // Supprimer les évaluations de la base de données
        if (evaluationsASupprimer.length > 0 && evaluationsASupprimer[0]) {
          this.isLoading = true;

          // Utiliser forkJoin au lieu de Promise.all
          const deleteObservables = evaluationsASupprimer
            .filter(id => id !== undefined)
            .map(id => this.evaluationService.delete(id as number));

          if (deleteObservables.length > 0) {
            forkJoin(deleteObservables).subscribe({
              next: () => {
                this.finalizeColumnDeletion(index, colonneId);
              },
              error: (err) => {
                this.error = "Erreur lors de la suppression des évaluations";
                this.isLoading = false;
                console.error("Erreur lors de la suppression des évaluations:", err);
              }
            });
          } else {
            this.finalizeColumnDeletion(index, colonneId);
          }
        } else {
          // Aucune note à supprimer dans la base de données
          this.finalizeColumnDeletion(index, colonneId);
        }
      }
    }
  }
  private finalizeColumnDeletion(index: number, colonneId: string): void {
    // Supprimer la colonne du tableau
    this.colonnes.splice(index, 1);
    this.displayedColumns = ['etudiant', ...this.colonnes.map(col => col.id), 'moyenne', 'actions'];

    // Supprimer les notes correspondantes pour chaque étudiant
    for (const etudiant of this.etudiants) {
      delete etudiant.notes[colonneId];
    }

    this.successMessage = "Colonne supprimée avec succès";
    setTimeout(() => this.successMessage = null, 3000);
    this.isLoading = false;
  }
  retourSelectionClasse(): void {
    this.retour.emit();
  }

  formatTitreEvaluation(type: string): string {
    return type.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  private formatDateForBackend(dateString: string): string {
    if (!dateString) return '';

    const parts = dateString.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
      } else {
        return dateString;
      }
    }
    return dateString;
  }
}
