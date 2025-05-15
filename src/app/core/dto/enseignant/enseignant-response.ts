import { UtilisateurResponse } from '../utilisateur/utilisateur-response';

export interface EnseignantResponse extends UtilisateurResponse {
  numeroCarte: string;
  departementId: number;
  dateEmbauche: string;
  specialite?: string;
}
