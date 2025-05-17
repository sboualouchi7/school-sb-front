export interface AbsenceResponse {
  id: number;
  etudiantId: number;
  seanceId: number;
  moduleId?: number; // Nouveau champ

  dateDebut: string;
  dateFin: string;
  motif?: string;
  justification?: string;
  validee: boolean;
  commentaire?: string;
  nomEtudiant: string;
  moduleSeance: string;
}
