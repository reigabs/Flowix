import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-cadastro',
  imports: [RouterLink],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.css'
})
export class Cadastro {
  constructor(private router: Router) {}

  voltar(): void {
    this.router.navigate(['/home-publica']);
  }

  cadastrar(event: SubmitEvent): void {
    event.preventDefault();

    const formulario = event.target as HTMLFormElement;

    if (!formulario.reportValidity()) {
      return;
    }

    const dados = new FormData(formulario);
    const perfil = dados.get('perfil');

    // Por enquanto, apenas confirma o envio do formulário.
    // A integração com o backend será feita depois.
    console.log('Perfil selecionado:', perfil);
    console.log('Dados preenchidos:', Object.fromEntries(dados.entries()));

    alert('Formulário preenchido! O cadastro ainda precisa ser conectado ao backend.');
  }
}