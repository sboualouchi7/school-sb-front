import { UtilisateurRequest } from '../utilisateur/utilisateur-request';

export interface EnseignantRequest extends UtilisateurRequest {
  numeroCarte: string;
  departementId: number;
  dateEmbauche: string;
  specialite?: string;
}
