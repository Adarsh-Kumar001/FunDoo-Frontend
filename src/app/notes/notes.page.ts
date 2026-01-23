import { Component, OnInit, ChangeDetectorRef, AfterViewInit, ViewChildren, QueryList, ElementRef, HostListener } from '@angular/core';
import { NotesService, Note } from '../core/services/notes.service';
import { TokenService } from '../core/services/token.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LabelService } from '../core/services/label.service';
import { Label } from '../core/models/label.model';

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
  allLabels: Label[] = [];

  isExpanded = false;
  showCreateColorPalette = false; // for new note

  newNote: Partial<Note> = {
    title: '',
    description: '',
    color: '#ffffff'
  };

  @ViewChildren('noteTextarea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  colors: string[] = [
    '#ffffff', '#f28b82', '#fbbc04', '#fff475',
    '#ccff90', '#a7ffeb', '#cbf0f8', '#aecbfa',
    '#d7aefb', '#fdcfe8', '#e6c9a8', '#e8eaed'
  ];

  activeColorPickerNoteId: number | null = null;
  activeLabelPickerNoteId: number | null = null;

  constructor(
    private notesService: NotesService,
    private tokenService: TokenService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private labelService: LabelService
  ) {}

  ngOnInit(): void {
    if (!this.tokenService.getToken()) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadNotes();
    this.loadLabels();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.resizeAllTextareas(), 0);
  }

  loadLabels(): void {
    this.labelService.getAll().subscribe({
      next: (labels) => {
        this.allLabels = labels;
      },
      error: (err) => console.error('Failed to load labels:', err)
    });
  }

  /** -------------------- NEW NOTE FUNCTIONS -------------------- */
  toggleCreateColorPalette() {
    this.showCreateColorPalette = !this.showCreateColorPalette;
  }

  toggleNoteColorPicker(noteId?: number) {
  if (noteId == null) return;
  this.activeColorPickerNoteId =
    this.activeColorPickerNoteId === noteId ? null : noteId;
}

expandNote(event: Event) {
  this.isExpanded = true;
  event.stopPropagation(); // prevent click from bubbling
}

  selectCreateColor(color: string) {
    this.newNote.color = color;
    this.showCreateColorPalette = false;
  }

  /** Save new note if clicked outside or Save button */
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (this.isExpanded) {
      const target = event.target as HTMLElement;
      if (!target.closest('.bg-white.mx-auto.max-w-xl')) {
        this.addNote();
      }
    }
  }

  /** -------------------- NOTE TEXTAREA AUTO-GROW -------------------- */
  autoGrow(event: Event | HTMLTextAreaElement) {
    let textarea: HTMLTextAreaElement;
    if (event instanceof Event) {
      textarea = event.target as HTMLTextAreaElement;
    } else {
      textarea = event;
    }
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  resizeAllTextareas() {
    this.textareas.forEach(ref => {
      const textarea = ref.nativeElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  }

  /** -------------------- CRUD -------------------- */
  loadNotes(): void {
    this.notesService.getNotes().subscribe({
      next: res => {
        const active = res.filter(n => !n.isDeleted && !n.isArchived);
        this.pinnedNotes = active.filter(n => n.isPinned);
        this.otherNotes = active.filter(n => !n.isPinned);
        setTimeout(() => this.resizeAllTextareas(), 0);
        this.cdr.detectChanges();
      },
      error: err => console.error('Load notes error:', err)
    });
  }

  addNote(): void {
    if (!this.newNote.title && !this.newNote.description) return;

    this.notesService.createNote(this.newNote).subscribe(() => {
      this.newNote = { title: '', description: '', color: '#ffffff' };
      this.isExpanded = false;
      this.showCreateColorPalette = false;
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
    }).subscribe({ error: err => console.error('Update note failed', err) });
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

  selectNoteColor(note: Note, color: string) {
    note.color = color;
    this.activeColorPickerNoteId = null;
    this.updateNote(note);
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

  /** -------------------- LABEL FUNCTIONS -------------------- */
  toggleLabelPicker(noteId?: number): void {
    if (noteId == null) return;
    this.activeLabelPickerNoteId =
      this.activeLabelPickerNoteId === noteId ? null : noteId;
  }

  hasLabel(note: Note, labelId: number): boolean {
    return note.labels?.some(l => l.labelId === labelId) || false;
  }

  toggleNoteLabel(note: Note, label: Label, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    if (!note.id) return;

    const hasLabel = this.hasLabel(note, label.labelId);

    if (hasLabel) {
      // Remove label
      this.labelService.removeLabelFromNote(label.labelId, note.id).subscribe({
        next: () => {
          if (note.labels) {
            note.labels = note.labels.filter(l => l.labelId !== label.labelId);
          }
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to remove label:', err)
      });
    } else {
      // Add label
      this.labelService.addLabelToNote(label.labelId, note.id).subscribe({
        next: () => {
          if (!note.labels) note.labels = [];
          note.labels.push({ labelId: label.labelId, labelName: label.labelName });
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Failed to add label:', err)
      });
    }
  }
}
