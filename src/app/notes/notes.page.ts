import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NotesService, Note } from '../core/services/notes.service';
import { TokenService } from '../core/services/token.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';



@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notes.page.html',
  styleUrls: ['./notes.page.css']
})

export class NotesPage implements OnInit, AfterViewInit {

  notes: Note[] = [];

  pinnedNotes: Note[] = [];
  otherNotes: Note[] = [];

  isExpanded = false;

  newNote: Partial<Note> = {
    title: '',
    description: '',
    color: '#ffffff'
  };

  @ViewChildren('noteTextarea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  colors: string[] = [
  '#ffffff', // default
  '#f28b82', // red
  '#fbbc04', // orange
  '#fff475', // yellow
  '#ccff90', // green
  '#a7ffeb', // teal
  '#cbf0f8', // blue
  '#aecbfa', // dark blue
  '#d7aefb', // purple
  '#fdcfe8', // pink
  '#e6c9a8', // brown
  '#e8eaed'  // gray
];

showCreateColorPalette = false;
activeColorPickerNoteId: number | null = null;

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

  selectCreateColor(color: string) {
  this.newNote.color = color;
  this.showCreateColorPalette = false;
}

selectNoteColor(note: Note, color: string) {
  note.color = color;
  this.activeColorPickerNoteId = null;
  this.updateNote(note); // ✅
}

autoGrow(event: Event) {
  const textarea = event.target as HTMLTextAreaElement;
  textarea.style.height = 'auto';
  textarea.style.height = textarea.scrollHeight + 'px';
}


toggleNoteColorPicker(noteId?: number) {
  if (noteId == null) return;

  this.activeColorPickerNoteId =
    this.activeColorPickerNoteId === noteId ? null : noteId;
}


  loadNotes(): void {
    this.notesService.getNotes().subscribe({
      next: res => {
        const active = res.filter(n => !n.isDeleted && !n.isArchived);

        this.pinnedNotes = active.filter(n => n.isPinned);
        this.otherNotes  = active.filter(n => !n.isPinned);

        setTimeout(() => this.resizeAllTextareas(), 0);  // Resize after view update

        this.cdr.detectChanges(); // force Angular to render updated array
      },
      error: err => console.error('Load notes error:', err)
    });
  }

  resizeAllTextareas() {
  this.textareas.forEach(ref => {
    const textarea = ref.nativeElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
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

  updateNote(note: Note): void {
  if (!note.id) return;

  this.notesService.updateNote(note.id, {
    title: note.title,
    description: note.description,
    color: note.color,
    isPinned: note.isPinned,
    isArchived: note.isArchived
  }).subscribe({
    error: err => console.error('Update note failed', err)
  });
}

ngAfterViewInit(): void {
  // Resize all textareas once the view is fully initialized
  setTimeout(() => this.resizeAllTextareas(), 0);
}


  deleteNote(note: Note): void {
    if (!note.id) return;
    this.notesService.deleteNote(note.id).subscribe(() => this.loadNotes());
  }

  togglePin(note: Note): void {
  if (!note.id) return;

  this.notesService.togglePin(note.id).subscribe({
    next: () => this.loadNotes(),
    error: err => console.error('Pin toggle failed', err)
    
  });
}


 toggleArchive(note: Note): void {
  if (!note.id) return;

  this.notesService.toggleArchive(note.id).subscribe({
    next: () => this.loadNotes(),
    error: err => console.error('Archive toggle failed', err)
  });
}



  changeColor(note: Note, color: string): void {
    if (!note.id) return;
    this.notesService.changeColor(note.id, color).subscribe(() => {
      note.color = color;
      this.activeColorPickerNoteId = null;
    });
  }

   trackById(index: number, note: Note) {
     return note.id;
  }

  logout(): void {
    this.tokenService.clearToken();
    this.router.navigate(['/auth/login']);
  }
}
