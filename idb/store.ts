import { ulid } from "ulid";
import idb from "./idb";

export interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export interface User {
  name: string;
}

export type PartialNote = Omit<Omit<Note, "id">, "created_at">;

export enum Stores {
  Note = "note",
  User = "user",
}
export async function getUser(db: IDBDatabase) {
  return await idb.getUser(db, Stores.User);
}
export async function createUser(db: IDBDatabase, user: User) {
  return await idb.createUser(db, Stores.User, user);
}

export async function getAllNotes(db: IDBDatabase) {
  return await idb.getAll(db, Stores.Note);
}
export async function updateNote(db: IDBDatabase, note: Note) {
  return await idb.updateByID(db, Stores.Note, note);
}

export async function insertNote(db: IDBDatabase, partial: PartialNote) {
  const now = new Date().toISOString();

  const newNote: Note = {
    id: ulid(),
    created_at: now,
    title: partial.title,
    content: partial.content,
  };

  return await idb.insert(db, Stores.Note, newNote);
}

export async function deleteNoteByID(db: IDBDatabase, id: string) {
  const success = await idb.deleteByID(db, Stores.Note, id);
  if (success) {
    return await getAllNotes(db);
  }
}

export async function getNoteByID(db: IDBDatabase, id: string) {
  return await idb.getByID(db, Stores.Note, id);
}

export async function purge(db: IDBDatabase) {
  return await idb.clear(db, Stores.Note);
}
