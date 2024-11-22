// src/app/auth/auth.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import Swal from 'sweetalert2'; // Import SweetAlert2

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  token: string = '';
  private authUrl = 'http://localhost:3000/register_devices/device_info';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  authenticate() {
    this.http.get(this.authUrl, {
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
    }).subscribe(
      () => {
        // Show success alert
        Swal.fire({
          icon: 'success',
          title: 'Login Successful',
          text: 'You are now authenticated!',
          timer: 2000,
          showConfirmButton: false,
        });

        // Save the token and navigate to dashboard
        this.authService.saveToken(this.token);
        this.router.navigate(['/dashboard']);
      },
      (error) => {
        // Show error alert
        Swal.fire({
          icon: 'error',
          title: 'Login Failed',
          text: error.error?.message || 'Invalid token or server error.',
          confirmButtonText: 'Retry',
        });
      }
    );
  }
}
