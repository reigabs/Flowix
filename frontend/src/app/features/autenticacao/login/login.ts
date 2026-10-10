import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  erroLogin = signal<boolean>(false);

  formulario = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    senha: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  constructor(private router: Router) {}

  entrar() {
    if (this.formulario.valid) {
      console.log('Dados enviados:', this.formulario.value);
      this.erroLogin.set(false);
      // Lógica de navegação ou autenticação aqui
    } else {
      this.erroLogin.set(true);
    }
  }
}