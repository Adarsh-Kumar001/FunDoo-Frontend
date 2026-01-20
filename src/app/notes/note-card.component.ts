import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotesService } from '../core/services/notes.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-note-card',
  template: `
    <div
      class="p-4 rounded shadow bg-white relative"
      [style.background]="note.color"
    >
      <h3 class="font-semibold">{{ note.title }}</h3>
      <p class="mt-2 text-sm">{{ note.description }}</p>

      <div class="flex gap-3 mt-4 text-sm text-gray-600">
        <button (click)="pin()">📌</button>
        <button (click)="archive()">🗄️</button>
        <button (click)="delete()">🗑️</button>
      </div>
    </div>
  `
})
export class NoteCardComponent {

  @Input() note: any;
  @Output() changed = new EventEmitter<void>();

  constructor(private notesService: NotesService) {}

  pin() {
    this.notesService.togglePin(this.note.id).subscribe(() => this.changed.emit());
  }

  archive() {
    this.notesService.toggleArchive(this.note.id).subscribe(() => this.changed.emit());
  }

  delete() {
    this.notesService.deleteNote(this.note.id).subscribe(() => this.changed.emit());
  }
}
