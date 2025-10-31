import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule, MatIconModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(
    private msalService: MsalService,
    private router: Router
  ) {}

  login(): void {
    this.msalService.loginPopup().subscribe({
      next: (result) => {
        this.msalService.instance.setActiveAccount(result.account);
        this.router.navigate(['/gallery']);
      },
      error: (error) => {
        console.error('Login failed:', error);
      }
    });
  }
}
