import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Label } from '../models/label.model';

export interface Note {
  id?: number;
  title: string;
  description: string;
  color?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
  isDeleted?: boolean;
  labels?: Label[];
}

@Injectable({ providedIn: 'root' })
export class NotesService {

  constructor(private api: ApiService) {}

  getNotes(): Observable<Note[]> {
    return this.api.get<Note[]>('/notes');
  }

  getDeletedNotes(): Observable<Note[]> {
    return this.api.get<Note[]>('/notes?deleted=true');
  }

  createNote(note: Partial<Note>): Observable<Note> {
    return this.api.post<Note>('/notes', note);
  }

  updateNote(id: number, note: Partial<Note>): Observable<any> {
    return this.api.put(`/notes/${id}`, note);
  }

  deleteNote(id: number): Observable<any> {
    return this.api.delete(`/notes/${id}`);
  }

 restoreNote(id: number): Observable<any> {
  return this.api.patch(`/notes/${id}/restore`, {});
}


  deleteForever(id: number): Observable<any> {
    return this.api.delete(`/notes/${id}`);
  }

  togglePin(id: number): Observable<any> {
    return this.api.patch(`/notes/${id}/pin`, {});
  }

  toggleArchive(id: number): Observable<any> {
    return this.api.patch(`/notes/${id}/archive`, {});
  }

  changeColor(id: number, color: string): Observable<any> {
    return this.api.patch(`/notes/${id}/color`, { color });
  }
}

