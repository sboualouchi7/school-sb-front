import { UtilisateurResponse } from '../utilisateur/utilisateur-response';
import { EtudiantResponse } from '../etudiant/etudiant-response';

export interface ParentResponse extends UtilisateurResponse {
  professionParent: string;
  relationAvecEtudiant: string;
  enfants: EtudiantResponse[];
}
