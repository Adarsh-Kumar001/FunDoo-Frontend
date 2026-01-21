import { Component, OnInit, ViewChildren, QueryList, ElementRef, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotesService, Note } from '../core/services/notes.service';
import { TokenService } from '../core/services/token.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './archive.page.html',
  styleUrls: ['./archive.page.css']
})
export class ArchivePage implements OnInit, AfterViewInit {

  archivedNotes: Note[] = [];

  colors: string[] = [
    '#ffffff','#f28b82','#fbbc04','#fff475','#ccff90',
    '#a7ffeb','#cbf0f8','#aecbfa','#d7aefb','#fdcfe8',
    '#e6c9a8','#e8eaed'
  ];

  activeColorPickerNoteId: number | null = null;

  @ViewChildren('noteTextarea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

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
    this.loadArchivedNotes();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.resizeAllTextareas(), 0);
  }

  loadArchivedNotes(): void {
    this.notesService.getNotes().subscribe({
      next: res => {
        this.archivedNotes = res.filter(n => n.isArchived && !n.isDeleted);
        setTimeout(() => this.resizeAllTextareas(), 0);
        this.cdr.detectChanges();
      },
      error: err => console.error('Error loading archived notes', err)
    });
  }

  // AUTO-GROW
  autoGrow(textarea: HTMLTextAreaElement) {
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  resizeAllTextareas() {
    this.textareas.forEach(ref => {
      const ta = ref.nativeElement;
      ta.style.height = 'auto';
      ta.style.height = ta.scrollHeight + 'px';
    });
  }

  toggleNoteColorPicker(noteId?: number) {
    if (noteId == null) return;
    this.activeColorPickerNoteId =
      this.activeColorPickerNoteId === noteId ? null : noteId;
  }

  selectNoteColor(note: Note, color: string) {
    note.color = color;
    this.activeColorPickerNoteId = null;
    this.updateNote(note);
  }

  updateNote(note: Note) {
    if (!note.id) return;
    this.notesService.updateNote(note.id, {
      title: note.title,
      description: note.description,
      color: note.color,
      isArchived: note.isArchived
    }).subscribe({
      error: err => console.error('Update note failed', err)
    });
  }

  restore(note: Note) {
    if (!note.id) return;
    this.notesService.toggleArchive(note.id).subscribe(() => this.loadArchivedNotes());
  }

  deleteNote(note: Note) {
    if (!note.id) return;
    this.notesService.deleteNote(note.id).subscribe(() => this.loadArchivedNotes());
  }

  trackById(index: number, note: Note) {
    return note.id;
  }
}
