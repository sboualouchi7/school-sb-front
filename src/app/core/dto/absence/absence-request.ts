export interface AbsenceRequest {
  etudiantId: number;
  seanceId: number;
  dateDebut: string;
  dateFin: string;
  motif?: string;
  justification?: string;
  commentaire?: string;
}
