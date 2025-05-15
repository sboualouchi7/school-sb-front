export interface DocumentRequest {
  etudiantId: number;
  demandeurId: number;
  commentaire?: string;
  dateCreation?: string;

  type: string;
}
