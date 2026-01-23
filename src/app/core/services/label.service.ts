import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Label } from '../models/label.model';

@Injectable({ providedIn: 'root' })
export class LabelService {
  private baseUrl = 'https://localhost:7011/api/labels';

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<Label[]>(this.baseUrl);
  }

  create(labelName: string) {
    return this.http.post<Label>(this.baseUrl, { labelName });
  }

  update(labelId: number, labelName: string) {
    return this.http.put(`${this.baseUrl}/${labelId}`, { labelName });
  }

  delete(labelId: number) {
    return this.http.delete(`${this.baseUrl}/${labelId}`);
  }

  addLabelToNote(labelId: number, noteId: number) {
    return this.http.post(
      `${this.baseUrl}/${labelId}/notes/${noteId}`,
      {}
    );
  }

  removeLabelFromNote(labelId: number, noteId: number) {
    return this.http.delete(
      `${this.baseUrl}/${labelId}/notes/${noteId}`
    );
  }
}
