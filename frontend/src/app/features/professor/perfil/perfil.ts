
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil implements OnInit {
  private platformId = inject(PLATFORM_ID);

  perfil = {
    nomeCompleto: '',
    nomeInstituicao: '',
    
    telefone: '',
    emailCpf: ''
  };

  editando: boolean = false;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioSalvoStr = localStorage.getItem('usuario_cadastrado');

      if (usuarioSalvoStr) {
        try {
          const usuario = JSON.parse(usuarioSalvoStr);

          this.perfil.nomeCompleto = usuario.nome || '';
          this.perfil.emailCpf = usuario.email || '';
          this.perfil.nomeInstituicao = usuario.instituicao || '';
         
          this.perfil.telefone = usuario.telefone || '';

        } catch (e) {
          console.error('Erro ao carregar dados do perfil', e);
        }
      }
    }
  }

  alternarEdicao() {
    this.editando = !this.editando;

    if (!this.editando) {
      this.salvarNoUsuarioLogado();
    }
  }

  private salvarNoUsuarioLogado() {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const usuario = JSON.parse(localStorage.getItem('usuario_cadastrado') || '{}');

      usuario.nome = this.perfil.nomeCompleto.trim();
      usuario.email = this.perfil.emailCpf.trim();
      usuario.instituicao = this.perfil.nomeInstituicao.trim();
      
      usuario.telefone = this.perfil.telefone.trim();

      localStorage.setItem('usuario_cadastrado', JSON.stringify(usuario));

    } catch (e) {
      console.error('Erro ao salvar os dados do perfil', e);
    }
  }

  alterarFoto() {}

  excluirConta() {
    if (confirm('Tem certeza de que deseja excluir sua conta? Esta ação é irreversível.')) {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('usuario_cadastrado');
        localStorage.removeItem('token_jwt');
      }

      alert('Conta excluída com sucesso.');
    }
  }
}
