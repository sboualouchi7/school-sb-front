import { UtilisateurResponse } from '../utilisateur/utilisateur-response';

export interface EtudiantResponse extends UtilisateurResponse {
  dateInscription: string;
  filiere?: string;
  classeId: number;
  niveauId: number;
  numeroEtudiant: string;
  actif: boolean;
  anneeScolaire: string;
  nomClasse: string;
}
