import { Component, OnInit, ViewChildren, QueryList, ElementRef, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { NotesService, Note } from '../core/services/notes.service';
import { TokenService } from '../core/services/token.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-bin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bin.page.html',
  styleUrls: ['./bin.page.css']
})
export class BinPage implements OnInit, AfterViewInit {

  deletedNotes: Note[] = [];

  @ViewChildren('noteTextarea') textareas!: QueryList<ElementRef<HTMLTextAreaElement>>;

  constructor(
    private notesService: NotesService,
    private tokenService: TokenService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const token = this.tokenService.getToken();
    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.loadDeletedNotes();
  }

  ngAfterViewInit(): void {
    // Resize textareas after view renders
    setTimeout(() => this.resizeAllTextareas(), 0);
  }

  trackById(index: number, note: Note) {
    return note.id;
  }

  loadDeletedNotes(): void {
    this.notesService.getDeletedNotes().subscribe({
      next: res => {
        this.deletedNotes = res;
        setTimeout(() => this.resizeAllTextareas(), 0);
        this.cdr.detectChanges();
      },
      error: err => console.error('Error loading deleted notes:', err)
    });
  }

  restoreNote(note: Note): void {
    if (!note.id) return;
    this.notesService.restoreNote(note.id).subscribe(() => this.loadDeletedNotes());
  }

  deleteForever(note: Note): void {
    if (!note.id) return;
    this.notesService.deleteForever(note.id).subscribe(() => this.loadDeletedNotes());
  }

  // Auto-grow single textarea without affecting others
  autoGrow(textarea: HTMLTextAreaElement) {
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
}
