import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-perfil-responsavel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class PerfilResponsavel implements OnInit {
  private platformId = inject(PLATFORM_ID);

  editando: boolean = false;
  mostrarSenha: boolean = false;

  usuario = {
    nome: 'Carla Santos',
    emailCpf: 'carlasantos@gmail.com',
    telefone: '(11) 98645-8765',
    senha: 'Carla#2121#'
  };

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioSalvoStr = localStorage.getItem('usuario_cadastrado');
      if (usuarioSalvoStr) {
        try {
          const usuarioSalvo = JSON.parse(usuarioSalvoStr);
          if (usuarioSalvo.nome) this.usuario.nome = usuarioSalvo.nome;
          if (usuarioSalvo.email) this.usuario.emailCpf = usuarioSalvo.email;
        } catch (e) {
          console.error('Erro ao carregar dados do perfil', e);
        }
      }
    }
  }

  toggleSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  alternarEdicao() {
    if (this.editando) {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('usuario_cadastrado', JSON.stringify({ nome: this.usuario.nome, email: this.usuario.emailCpf }));
      }
      alert('Informações atualizadas com sucesso!');
    }
    this.editando = !this.editando;
  }

  alterarFoto() {
    alert('Funcionalidade de alterar foto em desenvolvimento.');
  }

  excluirConta() {
    if (confirm('Tem certeza de que deseja excluir sua conta? Esta ação é irreversível.')) {
      alert('Conta excluída com sucesso.');
    }
  }

  salvarInformacoes() {}
}