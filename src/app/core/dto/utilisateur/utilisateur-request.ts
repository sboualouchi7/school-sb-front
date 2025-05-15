import { Role } from '../../enums/Role';
import { Sexe } from '../../enums/Sexe';

export interface UtilisateurRequest {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  dateNaissance?: string;
  adresse?: string;
  username: string;
  password: string;
  photo?: string;
  role?: Role;
  sexe: Sexe;
}
