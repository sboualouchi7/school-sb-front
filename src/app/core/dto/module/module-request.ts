export interface ModuleRequest {
  libelle: string;
  volumeHoraire: number;
  seuil: number;
  coefficient: number;
  classeId: number;
  niveauId: number;
  enseignantId: number;
  description?: string;
  typeModule: string;
}
