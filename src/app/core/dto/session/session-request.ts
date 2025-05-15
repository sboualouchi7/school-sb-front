import { StatutSession } from '../../enums/StatutSession';

export interface SessionRequest {
  nom: string;
  dateDebut: string; // Format ISO string
  dateFin: string;
  responsableId: number;
  description?: string;
  anneeScolaire: string;
  statut: StatutSession;
  moduleIds?: number[];
}
