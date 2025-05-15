import { UtilisateurRequest } from '../utilisateur/utilisateur-request';

export interface EtudiantRequest extends UtilisateurRequest {
  dateInscription: string;
  filiere?: string;
  classeId: number;
  niveauId: number;
  numeroEtudiant: string;
  anneeScolaire: string;
}
