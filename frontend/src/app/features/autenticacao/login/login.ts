import { Component, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  private platformId = inject(PLATFORM_ID);
  erroLogin = signal<boolean>(false);

  formulario = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    senha: new FormControl('', [Validators.required, Validators.minLength(6)])
  });

  constructor(private router: Router) {}

  entrar() {
    if (this.formulario.valid) {
      console.log('Dados enviados:', this.formulario.value);
      
      const emailDigitado = this.formulario.get('email')?.value;
      const senhaDigitada = this.formulario.get('senha')?.value;

      this.erroLogin.set(false);

      // 1. Acesso fixo da Secretaria
      if (emailDigitado === 'secretaria@gmail.com' && senhaDigitada === '123456') {
        if (isPlatformBrowser(this.platformId)) {
          const dadosSecretaria = {
            nome: '',
            email: emailDigitado,
            perfil: 'secretaria',
            instituicao: 'Escola Central'
          };
          localStorage.setItem('usuario_cadastrado', JSON.stringify(dadosSecretaria));
        }
        this.router.navigate(['/secretaria']);
        return;
      }

      // Acesso fixo do Aluno
      if (emailDigitado === 'aluno@gmail.com' && senhaDigitada === '654321') {
        if (isPlatformBrowser(this.platformId)) {
          const dadosAluno = {
            nome: 'João',
            email: emailDigitado,
            perfil: 'aluno',
            instituicao: 'Escola Central'
          };
          localStorage.setItem('usuario_cadastrado', JSON.stringify(dadosAluno));
        }
        this.router.navigate(['/aluno']);
        return;
      }

      // Acesso de responsável
       if (emailDigitado === 'responsavel@gmail.com' && senhaDigitada === '123456') {
        if (isPlatformBrowser(this.platformId)) {
          const dadosResponsavel = {
            nome: 'Carla',
            email: emailDigitado,
            perfil: 'responsavel',
            instituicao: 'Escola Central'
          };
          localStorage.setItem('usuario_cadastrado', JSON.stringify(dadosResponsavel));
        }
        this.router.navigate(['/responsavel']);
        return;
      }

      if (isPlatformBrowser(this.platformId)) {
        const usuarioSalvoStr = localStorage.getItem('usuario_cadastrado');

        if (usuarioSalvoStr) {
          const usuario = JSON.parse(usuarioSalvoStr);

          switch (usuario.perfil) {
            case 'aluno':
              this.router.navigate(['/aluno']);
              break;
            case 'secretaria':
              this.router.navigate(['/secretaria']);
              break;
            case 'responsavel':
              this.router.navigate(['/responsavel']);
              break;
            default:
              this.router.navigate(['/']); 
              break;
          }
        } else {
          this.erroLogin.set(true);
          console.warn('Nenhum usuário cadastrado encontrado no localStorage.');
        }
      }

    } else {
      this.erroLogin.set(true);
      this.formulario.markAllAsTouched();
    }
  }
}