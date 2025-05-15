export interface ModuleResponse {
  id: number;
  libelle: string;
  volumeHoraire: number;
  seuil: number;
  coefficient: number;
  classeId: number;
  niveauId: number;
  enseignantId: number;
  actif: boolean;
  description?: string;
  typeModule: string;
  dateCreation: string;
  dateModification: string;
  nomEnseignant: string;
  nomClasse: string;
}
