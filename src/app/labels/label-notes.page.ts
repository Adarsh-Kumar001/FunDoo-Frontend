import { Component, OnInit, AfterViewInit, ViewChildren, QueryList, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NotesService, Note } from '../core/services/notes.service';
import { LabelService } from '../core/services/label.service';
import { Label } from '../core/models/label.model';

@Component({
  selector: 'app-label-notes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './label-notes.page.html',
  styleUrls: ['./label-notes.page.css']
})
export class LabelNotesPage implements OnInit, AfterViewInit {
  labelId: number = 0;
  labelName: string = '';
  notes: Note[] = [];
  allLabels: Label[] = [];
  
  colors: string[] = [
    '#ffffff', '#f28b82', '#fbbc04', '#fff475',
    '#ccff90', '#a7ffeb', '#cbf0f8', '#aecbfa',
    '#d7aefb', '#fdcfe8', '#e6c9a8', '#e8eaed'
  ];

  activeColorPickerNoteId: number | null = null;

  @ViewChildren('noteTextarea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  constructor(
    private route: ActivatedRoute,
    private notesService: NotesService,
    private labelService: LabelService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.labelId = +params['labelId'];
      this.loadLabelAndNotes();
    });
    this.loadAllLabels();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.resizeAllTextareas(), 0);
  }

  resizeAllTextareas(): void {
    this.textareas.forEach(ref => {
      const textarea = ref.nativeElement;
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  }

  loadLabelAndNotes(): void {
    this.labelService.getAll().subscribe({
      next: (labels) => {
        const label = labels.find(l => l.labelId === this.labelId);
        if (label) {
          this.labelName = label.labelName;
        }
      }
    });

    this.notesService.getNotes().subscribe({
      next: (allNotes) => {
        this.notes = allNotes.filter(note => 
          note.labels?.some(l => l.labelId === this.labelId) &&
          !note.isDeleted && 
          !note.isArchived
        );
        setTimeout(() => this.resizeAllTextareas(), 0);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Failed to load notes:', err)
    });
  }

  loadAllLabels(): void {
    this.labelService.getAll().subscribe({
      next: (labels) => {
        this.allLabels = labels;
      }
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
    this.notesService.deleteNote(note.id).subscribe(() => this.loadLabelAndNotes());
  }

  togglePin(note: Note): void {
    if (!note.id) return;
    this.notesService.togglePin(note.id).subscribe({
      next: () => this.loadLabelAndNotes(),
      error: err => console.error('Pin toggle failed', err)
    });
  }

  toggleArchive(note: Note): void {
    if (!note.id) return;
    this.notesService.toggleArchive(note.id).subscribe({
      next: () => this.loadLabelAndNotes(),
      error: err => console.error('Archive toggle failed', err)
    });
  }

  toggleNoteColorPicker(noteId?: number): void {
    if (noteId == null) return;
    this.activeColorPickerNoteId =
      this.activeColorPickerNoteId === noteId ? null : noteId;
  }

  selectNoteColor(note: Note, color: string): void {
    note.color = color;
    this.activeColorPickerNoteId = null;
    this.updateNote(note);
  }

  autoGrow(event: Event): void {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  trackById(index: number, note: Note): number | undefined {
    return note.id;
  }
}
