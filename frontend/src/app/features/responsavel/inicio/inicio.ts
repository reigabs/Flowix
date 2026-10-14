import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

interface Filho {
  id: number;
  nome: string;
  turma: string;
  instituicao?: string;
  matricula?: string;
}

interface Solicitacao {
  id: string;
  aluno: string;
  data: string;
  motivo: string;
  status: 'Em andamento' | 'Aprovada' | 'Rejeitada';
}

@Component({
  selector: 'app-inicio-responsavel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css'
})
export class InicioResponsavel implements OnInit {
  private platformId = inject(PLATFORM_ID);
  
  nomeUsuario = 'Carla Santos'; 

  filhos: Filho[] = [
    { id: 1, nome: 'Flávia Santos', turma: '7º ano C', instituicao: 'Colégio InterGenius', matricula: '527478542' },
    { id: 2, nome: 'Henrique Santos', turma: '7º ano B', instituicao: 'Colégio InterGenius', matricula: '92736423' }
  ];

  solicitacoes: Solicitacao[] = [
    { id: '#3458', aluno: 'Flávia Santos', data: '17/05/2026', motivo: 'Consulta médica', status: 'Em andamento' },
    { id: '#3457', aluno: 'Henrique Santos', data: '10/05/2026', motivo: 'Atestado médico', status: 'Aprovada' },
    { id: '#3456', aluno: 'Henrique Santos', data: '16/04/2026', motivo: 'Consulta odontológica', status: 'Aprovada' },
    { id: '#3455', aluno: 'Flávia Santos', data: '02/04/2026', motivo: 'Declaração', status: 'Rejeitada' }
  ];

  modalAdicionarAberto: boolean = false;
  novoFilho = {
    nome: '',
    instituicao: '',
    matricula: '',
    turma: ''
  };

  constructor(private router: Router) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const usuarioSalvoStr = localStorage.getItem('usuario_cadastrado');
      if (usuarioSalvoStr) {
        try {
          const usuario = JSON.parse(usuarioSalvoStr);
          if (usuario.nome) {
            this.nomeUsuario = usuario.nome;
          }
        } catch (e) {
          console.error('Erro ao ler dados do usuário', e);
        }
      }
    }
  }

  verPerfil(filho: Filho) {
    this.router.navigate(['/responsavel/perfil-filhos']);
  }

  abrirModalAdicionar() {
    this.modalAdicionarAberto = true;
  }

  fecharModalAdicionar() {
    this.modalAdicionarAberto = false;
    this.novoFilho = { nome: '', instituicao: '', matricula: '', turma: '' };
  }

  salvarNovoFilho() {
    if (!this.novoFilho.nome || !this.novoFilho.turma) {
      alert('Preencha os campos obrigatórios!');
      return;
    }

    const novo: Filho = {
      id: this.filhos.length + 1,
      nome: this.novoFilho.nome,
      turma: this.novoFilho.turma,
      instituicao: this.novoFilho.instituicao,
      matricula: this.novoFilho.matricula
    };

    this.filhos.push(novo);
    alert(`Filho(a) ${novo.nome} vinculado(a) com sucesso!`);
    this.fecharModalAdicionar();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Em andamento':
        return 'badge-andamento';
      case 'Aprovada':
        return 'badge-aprovada';
      case 'Rejeitada':
        return 'badge-rejeitada';
      default:
        return '';
    }
  }
}