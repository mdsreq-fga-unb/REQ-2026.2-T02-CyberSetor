export interface ProjectCoordinator {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface Project {
  id: string;
  versao: number;
  instrumentoId: string;
  codigo: string;
  titulo: string;
  coordenador: ProjectCoordinator;
  inicio: string;
  fim: string;
}

export interface ProjectInput {
  codigo: string;
  titulo: string;
  coordenadorId: string;
  inicio: string;
  fim: string;
}

export type EligibleCoordinator = Omit<ProjectCoordinator, 'ativo'>;
