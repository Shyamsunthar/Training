import { Injectable } from '@angular/core';
import { Note } from './note.model';

@Injectable({
  providedIn: 'root'
})
export class NotesService {

  notes: Note[] = new Array<Note>();

  constructor() { }

  getAllNotes() {
    return this.notes;
  }

  getNote(id: number){
    return this.notes[id];
  }

  getNoteId(note: Note){
    return this.notes.indexOf(note);

  }

  addNote(note:Note){

    // this method will add a note to the notes array and return the id of the note.
    // where the id = index

    let newLength = this.notes.push(note);
    let index = newLength - 1;    

  }

  updateNote(id: number, title: string, body: string) {
    let note = this.notes[id];
    note.title = title;
    note.body = body;
  }

  deleteNote(id: number) {
    this.notes.splice(id, 1);
  }
}
