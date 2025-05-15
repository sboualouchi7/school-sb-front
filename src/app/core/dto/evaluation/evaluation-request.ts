export interface EvaluationRequest {
  etudiantId: number;
  moduleId: number;
  enseignantId: number;
  sessionId: number;
  note: number;
  dateEvaluation: string;
  commentaire?: string;
  type: string;
}
