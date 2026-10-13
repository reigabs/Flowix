import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class Cadastro {

  constructor(private router: Router) { } 

  formulario = new FormGroup({
    nome: new FormControl('', [Validators.required]),
    instituicao: new FormControl('', [Validators.required]),
    matricula: new FormControl('', [Validators.required]),
    telefone: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    senha: new FormControl('', [Validators.required, Validators.minLength(6)]),
    perfil: new FormControl('', [Validators.required])
  });
  

  cadastrar(): void {
    if (this.formulario.valid) {
      console.log('Dados preenchidos:', this.formulario.value);

      if (typeof window !== 'undefined' && window.localStorage) {
        // Salva os dados do usuário, incluindo o perfil selecionado 
        const dadosUsuario = {
          email: this.formulario.get('email')?.value || '',
          perfil: this.formulario.get('perfil')?.value || ''
        };

        window.localStorage.setItem('usuario_cadastrado', JSON.stringify(dadosUsuario));
        window.localStorage.setItem('emailTemp', dadosUsuario.email);
      }

      this.router.navigate(['/cadastro-concluido']);
    } else {
      this.formulario.markAllAsTouched();
    }
  }
}