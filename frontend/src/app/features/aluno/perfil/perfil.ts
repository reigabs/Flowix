// foi implementado isso aqui (inject e PLATFORM_ID adicionados ao import, para usar localStorage com segurança)
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
// foi implementado isso aqui (isPlatformBrowser adicionado ao import)
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  // foi implementado isso aqui (para só mexer no localStorage quando estiver no navegador)
  private platformId = inject(PLATFORM_ID);

  editando: boolean = false;

  aluno = {
    nome: 'Bia Santos',
    instituicao: 'Escola Maria Neusa Carmo de Souza',
    matricula: '123345678',
    telefone: '(11) 98645-8765',
    email: 'beatrizsilva10@gmail.com',
    turma: '7º ano A',
    fotoUrl: '/images/perfil.png'
  };

  ngOnInit() {
    // foi implementado isso aqui (protege contra execução fora do navegador)
    if (!isPlatformBrowser(this.platformId)) return;

    // foi implementado isso aqui (o nome passa a vir do usuário logado, o mesmo que o painel e as justificativas usam)
    const usuarioSalvoStr = localStorage.getItem('usuario_cadastrado');
    if (usuarioSalvoStr) {
      try {
        const usuario = JSON.parse(usuarioSalvoStr);
        if (usuario.nome) {
          this.aluno.nome = usuario.nome;
        }
      } catch (e) {
        console.error('Erro ao ler dados do usuário', e);
      }
    }

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
      // foi implementado isso aqui (ao salvar, o nome editado volta para o usuário logado)
      this.salvarNomeNoUsuarioLogado();
    }
  }

  // foi implementado isso aqui (atualiza só o campo nome do usuario_cadastrado, sem apagar o resto)
  private salvarNomeNoUsuarioLogado() {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const usuario = JSON.parse(localStorage.getItem('usuario_cadastrado') || '{}');
      usuario.nome = this.aluno.nome.trim();
      localStorage.setItem('usuario_cadastrado', JSON.stringify(usuario));
    } catch (e) {
      console.error('Erro ao salvar o nome do usuário', e);
    }
  }

  excluirConta() {
    if (confirm('Tem certeza de que deseja excluir sua conta?')) {
      localStorage.removeItem('fotoPerfilAluno'); 
      console.log('Conta excluída');
    }
  }
}