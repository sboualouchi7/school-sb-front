import { StatutSession } from '../../enums/StatutSession';

export interface SessionResponse {
  id: number;
  nom: string;
  dateDebut: string;
  dateFin: string;
  responsableId: number;
  description?: string;
  anneeScolaire: string;
  actif: boolean;
  statut: StatutSession;
  nomResponsable: string;
}
