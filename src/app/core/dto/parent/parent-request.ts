import { UtilisateurRequest } from '../utilisateur/utilisateur-request';

export interface ParentRequest extends UtilisateurRequest {
  relationAvecEtudiant: string;
  enfantsIds?: number[];
}
