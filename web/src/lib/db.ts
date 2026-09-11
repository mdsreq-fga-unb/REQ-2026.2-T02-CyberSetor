import Dexie, { type EntityTable } from 'dexie';

export interface ItemOutboxDojo {
  id?: number;
  clientMutationId: string;
  payload: string;
  estado: 'pendente' | 'enviado';
  criadoEm: number;
}

export const db = new Dexie('cybersetor_dojo') as Dexie & {
  outbox: EntityTable<ItemOutboxDojo, 'id'>;
};

db.version(1).stores({
  outbox: '++id,&clientMutationId,estado,criadoEm',
});
