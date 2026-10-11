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
    // Marca todos os campos como tocados para exibir os erros caso o usuário tente enviar vazio
    if (this.formulario.valid) {
      console.log('Dados preenchidos:', this.formulario.value);
      // integração com o backend aqui
    } else {
      this.formulario.markAllAsTouched();
    }
  }
}