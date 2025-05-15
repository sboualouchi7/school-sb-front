export interface DocumentResponse {
  id: number;
  etudiantId: number;
  demandeurId: number;
  dateCreation: string;
  dateDelivrance: string;
  fichierUrl?: string;
  commentaire?: string;
  actif: boolean;
  type: string;
  status: string;
  nomEtudiant: string;
  nomDemandeur: string;
}
