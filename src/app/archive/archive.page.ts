import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NotesService, Note } from '../core/services/notes.service';
import { TokenService } from '../core/services/token.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './archive.page.html',
  styleUrls: ['./archive.page.css']
})
export class ArchivePage implements OnInit {

  archivedNotes: Note[] = [];

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

  loadArchivedNotes(): void {
    this.notesService.getNotes().subscribe({
      next: (res) => {
        this.archivedNotes = res.filter(
          n => n.isArchived && !n.isDeleted
        );
        this.cdr.detectChanges(); // force Angular to render updated array, without it the notes wone be displayed
      },
      error: (err) => console.error('Error loading archived notes', err)
    });
  }

  restore(note: Note): void {
    if (!note.id) return;

    this.notesService.toggleArchive(note.id).subscribe(() => {
      this.loadArchivedNotes();
    });
  }
}
