export interface AbsenceRequest {
  etudiantId: number;
  seanceId: number;
  dateDebut: string;
  moduleId?: number;
  dateFin: string;
  motif?: string;
  justification?: string;
  commentaire?: string;
}
