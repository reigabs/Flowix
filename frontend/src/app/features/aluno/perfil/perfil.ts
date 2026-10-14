
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css'
})
export class Perfil {
  editando = false;

  fotoPerfil = 'imagens/perfil-aluna.png';

  dadosOriginais = {
    nome: 'Ana Beatriz da Silva',
    instituicao: 'Escola Maria Neusa Carmo de Souza',
    matricula: '123345678',
    telefone: '(11) 98645-8765',
    emailCpf: 'beatrizsilva10@gmail.com',
    turma: '7º ano A'
  };

  dados = { ...this.dadosOriginais };

  mensagem = '';

  alternarEdicao(): void {
    if (this.editando) {
      this.salvarInformacoes();
      return;
    }

    this.dadosOriginais = { ...this.dados };
    this.editando = true;
    this.mensagem = '';
  }

  salvarInformacoes(): void {
    if (
      !this.dados.nome.trim() ||
      !this.dados.instituicao.trim() ||
      !this.dados.matricula.trim() ||
      !this.dados.telefone.trim() ||
      !this.dados.emailCpf.trim() ||
      !this.dados.turma.trim()
    ) {
      this.mensagem = 'Preencha todos os campos antes de salvar.';
      return;
    }

    this.editando = false;
    this.mensagem = 'Informações atualizadas nesta sessão.';
  }

  cancelarEdicao(): void {
    this.dados = { ...this.dadosOriginais };
    this.editando = false;
    this.mensagem = '';
  }

  alterarFoto(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const arquivo = input.files?.[0];

    if (!arquivo) {
      return;
    }

    if (!arquivo.type.startsWith('image/')) {
      this.mensagem = 'Selecione um arquivo de imagem válido.';
      input.value = '';
      return;
    }

    if (arquivo.size > 5 * 1024 * 1024) {
      this.mensagem = 'A imagem deve ter no máximo 5 MB.';
      input.value = '';
      return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
      if (typeof leitor.result === 'string') {
        this.fotoPerfil = leitor.result;
        this.mensagem = 'Foto alterada nesta sessão.';
      }
    };

    leitor.readAsDataURL(arquivo);
  }

  excluirConta(): void {
    const confirmou = window.confirm(
      'Tem certeza de que deseja solicitar a exclusão da conta? Essa ação não poderá ser desfeita no sistema real.'
    );

    if (confirmou) {
      this.mensagem =
        'Esta demonstração não exclui contas. A exclusão real precisa ser implementada no backend.';
    }
  }

  sair(): void {
    window.alert('A função de sair será implementada posteriormente.');
  }
}
