// core/models/evaluation-tableau-interface.ts
export interface EtudiantAvecNotes {
  id: number;
  nom: string;
  prenom: string;
  numeroEtudiant: string;
  notes: Record<string, EvaluationTableau>;
}

export interface EvaluationTableau {
  id?: number;        // ID de l'évaluation existante, si applicable
  etudiantId: number;
  note: number | null;
  estModifiee: boolean; // Pour suivre si une note a été modifiée
  estNouvelle: boolean; // Pour suivre si c'est une nouvelle note
}

export interface ColonneEvaluation {
  id: string;         // ID unique pour la colonne
  titre: string;      // Titre affiché (type d'évaluation)
  type: string;       // Type d'évaluation (EXAMEN, CONTROLE, etc.)
  date: string;       // Date de l'évaluation
  coefficient: number; // Coefficient de l'évaluation
}
