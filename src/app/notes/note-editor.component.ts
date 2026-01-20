import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotesService } from '../core/services/notes.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  selector: 'app-note-editor',
  template: `
    <div class="bg-white p-4 rounded shadow">
      <input
        class="w-full mb-2 text-lg outline-none"
        placeholder="Title"
        [(ngModel)]="title"
      />

      <textarea
        class="w-full outline-none"
        placeholder="Take a note..."
        [(ngModel)]="description"
      ></textarea>

      <div class="flex justify-end mt-2">
        <button
          class="px-4 py-1 bg-blue-600 text-white rounded"
          (click)="createNote()"
        >
          Add
        </button>
      </div>
    </div>
  `
})
export class NoteEditorComponent {

  title = '';
  description = '';

  @Output() noteCreated = new EventEmitter<void>();

  constructor(private notesService: NotesService) {}

  createNote() {
    if (!this.title && !this.description) return;

    this.notesService.createNote({
      title: this.title,
      description: this.description,
      color: '#ffffff'
    }).subscribe(() => {
      this.title = '';
      this.description = '';
      this.noteCreated.emit();
    });
  }
}
