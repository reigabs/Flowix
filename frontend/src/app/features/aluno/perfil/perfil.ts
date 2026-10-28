import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-aluno-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {
  editando: boolean = false;

  aluno = {
    nome: 'Ana Beatriz da Silva',
    instituicao: 'Escola Maria Neusa Carmo de Souza',
    matricula: '123345678',
    telefone: '(11) 98645-8765',
    email: 'beatrizsilva10@gmail.com',
    turma: '7º ano A',
    fotoUrl: 'assets/download (3).jpg'
  };

  ngOnInit() {
    const fotoSalva = localStorage.getItem('fotoPerfilAluno');
    if (fotoSalva) {
      this.aluno.fotoUrl = fotoSalva;
    }
  }

  onFotoSelecionada(event: any) {
    const arquivo = event.target.files[0];
    if (arquivo) {
      const leitor = new FileReader();
      leitor.onload = (e: any) => {
        const base64Imagem = e.target.result;
        this.aluno.fotoUrl = base64Imagem;
        localStorage.setItem('fotoPerfilAluno', base64Imagem);
      };
      leitor.readAsDataURL(arquivo);
    }
  }

  alternarEdicao() {
    this.editando = !this.editando;
    if (!this.editando) {
      console.log('Informações salvas:', this.aluno);
    }
  }

  excluirConta() {
    if (confirm('Tem certeza de que deseja excluir sua conta?')) {
      localStorage.removeItem('fotoPerfilAluno'); 
      console.log('Conta excluída');
    }
  }
}