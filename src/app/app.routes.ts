import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { NotesPage } from './notes/notes.page';
import { BinPage } from './bin/bin.page';
import { LayoutComponent } from './layout/layout.component';
import { authGuard } from './core/guards/auth.guard';
import { ArchivePage } from './archive/archive.page';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';

export const routes: Routes = [

  // ---------- AUTH ----------
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/verify-email', component: VerifyEmailComponent },

  // ---------- APP  ----------
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'notes', component: NotesPage },
      { path: 'bin', component: BinPage },
       { path: 'archive', component: ArchivePage },
      { path: '', redirectTo: 'notes', pathMatch: 'full' }
    ]
  },

  // ---------- FALLBACK ----------
  { path: '**', redirectTo: 'auth/login' }
];
