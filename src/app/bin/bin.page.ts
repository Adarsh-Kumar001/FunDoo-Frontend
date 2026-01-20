import { Component, OnInit } from '@angular/core';
import { NotesService, Note } from '../core/services/notes.service';
import { TokenService } from '../core/services/token.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-bin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bin.page.html',
  styleUrls: ['./bin.page.css'], 
})
export class BinPage implements OnInit {

  deletedNotes: Note[] = [];

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

  loadDeletedNotes(): void {
  this.notesService.getDeletedNotes().subscribe({
    next: (res) => {
      console.log('Deleted notes fetched:', res);
      this.deletedNotes = res;
      this.cdr.detectChanges(); // force Angular to render updated array
    },
    error: (err) => console.error('Error loading deleted notes:', err)
  });
}


  restoreNote(note: Note): void {
    if (!note.id) return;
    this.notesService.restoreNote(note.id).subscribe({
      next: () => this.loadDeletedNotes(),
      error: (err) => console.error('Error restoring note:', err)
    });
  }

  deleteForever(note: Note): void {
    if (!note.id) return;
    this.notesService.deleteForever(note.id).subscribe({
      next: () => this.loadDeletedNotes(),
      error: (err) => console.error('Error permanently deleting note:', err)
    });
  }

}


