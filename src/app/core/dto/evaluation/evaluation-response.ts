export interface EvaluationResponse {
  id: number;
  etudiantId: number;
  moduleId: number;
  enseignantId: number;
  sessionId: number;
  note: number;
  dateEvaluation: string;
  commentaire?: string;
  estValidee: boolean;
  type: string;
  nomEtudiant: string;
  libelleModule: string;
  nomEnseignant: string;
  nomSession: string;
}
