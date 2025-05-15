export interface SeanceRequest {
  moduleId: number;
  enseignantId: number;
  date: string;
  heureDebut: string;
  heureFin: string;
  description?: string;
  statut: string;
  numeroSeance: string;
}
