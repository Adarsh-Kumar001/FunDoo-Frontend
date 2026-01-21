import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NotesService, Note } from '../core/services/notes.service';
import { TokenService } from '../core/services/token.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';


@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes.page.html',
  styleUrls: ['./notes.page.css']
})

export class NotesPage implements OnInit {

  notes: Note[] = [];
  isExpanded = false;

  newNote: Partial<Note> = {
    title: '',
    description: '',
    color: '#ffffff'
  };

  constructor(
    private notesService: NotesService,
    private tokenService: TokenService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.tokenService.getToken()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadNotes();
  }

  loadNotes(): void {
    this.notesService.getNotes().subscribe({
      next: res => {
        this.notes = res
          .filter(n => !n.isDeleted && !n.isArchived)
          .sort((a, b) => Number(b.isPinned) - Number(a.isPinned));

        this.cdr.detectChanges(); // force Angular to render updated array
      },
      error: err => console.error('Load notes error:', err)
    });
  }

  addNote(): void {
    if (!this.newNote.title && !this.newNote.description) return;

    this.notesService.createNote(this.newNote).subscribe(() => {
      this.newNote = { title: '', description: '', color: '#ffffff' };
      this.isExpanded = false;
      this.loadNotes();
    });
  }

  updateTitle(note: Note): void {
    if (!note.id) return;
    this.notesService.updateNote(note.id, { title: note.title }).subscribe();
  }

  updateDescription(note: Note): void {
    if (!note.id) return;
    this.notesService.updateNote(note.id, { description: note.description }).subscribe();
  }

  deleteNote(note: Note): void {
    if (!note.id) return;
    this.notesService.deleteNote(note.id).subscribe(() => this.loadNotes());
  }

  togglePin(note: Note): void {
    if (!note.id) return;
    this.notesService.togglePin(note.id).subscribe(() => this.loadNotes());
     this.cdr.detectChanges();
  }

  toggleArchive(note: Note): void {
    if (!note.id) return;
    this.notesService.toggleArchive(note.id).subscribe(() => this.loadNotes());
  }

  changeColor(note: Note, color: string): void {
    if (!note.id) return;
    this.notesService.changeColor(note.id, color).subscribe(() => {
      note.color = color;
    });
  }

  trackById(index: number, note: Note): number {
    return note.id ?? index;
  }

  logout(): void {
    this.tokenService.clearToken();
    this.router.navigate(['/auth/login']);
  }
}
