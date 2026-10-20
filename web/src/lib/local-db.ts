import Dexie from 'dexie';

export const localDb = new Dexie('cybersetor');

localDb.version(1).stores({});
