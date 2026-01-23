import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TokenService } from '../core/services/token.service';
import { LabelService } from '../core/services/label.service';
import { Label } from '../core/models/label.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit {

  showProfileMenu = false;
  userEmail = '';
  userName = '';
  labels: Label[] = [];

  constructor(
    private tokenService: TokenService,
    private router: Router,
    private labelService: LabelService
  ) {}

  ngOnInit(): void {
    const decoded = this.tokenService.getDecodedToken();

    if (decoded) {
      this.userEmail =
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];


      // derive name from email (before @)
      this.userName = this.userEmail
        ? this.userEmail.split('@')[0]
        : 'User';
    }

    this.loadLabels();

    // Reload labels when navigating away from edit-labels page
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        if (event.url.includes('edit-labels') || event.url.includes('notes')) {
          this.loadLabels();
        }
      });
  }

  loadLabels(): void {
    this.labelService.getAll().subscribe({
      next: (labels) => {
        this.labels = labels;
      },
      error: (err) => console.error('Failed to load labels:', err)
    });
  }

  get initials(): string {
    return this.userName
      .split(/[\s._-]+/)
      .map(w => w[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  toggleProfileMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
  }

  logout() {
    this.tokenService.clearToken();
    this.router.navigate(['/auth/login']);
  }

  @HostListener('document:click')
  closeOnOutsideClick() {
    this.showProfileMenu = false;
  }
}
