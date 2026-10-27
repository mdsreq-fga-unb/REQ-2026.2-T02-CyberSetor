export type InstrumentType = 'EDITAL' | 'EMENDA' | 'PARCERIA';

export interface Instrument {
  id: string;
  versao: number;
  tipo: InstrumentType;
  orgaoConcedente: string;
  numeroProcesso: string;
  valorGlobal: string;
  dataCelebracao: string;
  vigenciaInicio: string;
  vigenciaFim: string;
  ativo: boolean;
  documentoFormalEm: string | null;
}

export type InstrumentInput = Omit<Instrument, 'id' | 'versao' | 'ativo' | 'documentoFormalEm'>;

export interface SavedInstrument {
  instrumento: Instrument;
  numeroProcessoRepetido: boolean;
}

export interface InstrumentDocument {
  nomeArquivo: string;
  tipoConteudo: string;
  tamanho: number;
  sha256: string;
  enviadoEm: string;
  enviadoPor: { id: string; nome: string };
  url?: string;
  expiraEm?: string;
}
