import { Role } from '../../enums/Role';
import { Sexe } from '../../enums/Sexe';

export interface UtilisateurResponse {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  dateNaissance?: string;
  adresse?: string;
  username: string;
  photo?: Uint8Array;
  actifAccount: boolean;
  role: Role;
  sexe: Sexe;
  dateCreation: string;
  dateModification: string;
}
