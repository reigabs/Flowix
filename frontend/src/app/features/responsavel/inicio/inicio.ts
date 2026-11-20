
import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// foi implementado isso aqui (import do service compartilhado de justificativas)
import { JustificativaService } from '../../../core/services/justificativa.service';

// foi implementado isso aqui (import do modelo de justificativas)
import { Justificativa } from '../../../core/models/justificativa.model';

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

  // foi implementado isso aqui (injeção do serviço compartilhado de justificativas)
  private justificativaService = inject(JustificativaService);

  nomeUsuario = 'Carla Santos';

  filhos: Filho[] = [];

  // foi implementado isso aqui (lista de solicitações reais, carregadas pelo JustificativaService)
  solicitacoes: Solicitacao[] = [];

  modalAdicionarAberto: boolean = false;

  novoFilho = {
    nome: '',
    instituicao: '',
    matricula: '',
    turma: ''
  };

  errosFormulario = {
    nome: false,
    instituicao: false,
    matricula: false,
    turma: false
  };

  modalMensagemAberto: boolean = false;
  tituloMensagem: string = '';
  textoMensagem: string = '';

  instituicoesMacapa = [
    'Escola Estadual Barão do Rio Branco',
    'Escola Estadual Alexandre Vaz Tavares',
    'Escola Estadual GM Stélio Maroja',
    'Escola Estadual Lucila Freitas',
    'Colégio Amapaense',
    'Colégio Cristão de Macapá',
    'Escola Dom Pedro I',
    'Escola Estadual Tiradentes'
  ];

  turmasEscolares = [
    '1º Ano do Ensino Fundamental - A', '1º Ano do Ensino Fundamental - B',
    '2º Ano do Ensino Fundamental - A', '2º Ano do Ensino Fundamental - B',
    '3º Ano do Ensino Fundamental - A', '3º Ano do Ensino Fundamental - B',
    '4º Ano do Ensino Fundamental - A', '4º Ano do Ensino Fundamental - B',
    '5º Ano do Ensino Fundamental - A', '5º Ano do Ensino Fundamental - B',
    '6º Ano do Ensino Fundamental - A', '6º Ano do Ensino Fundamental - B',
    '7º Ano do Ensino Fundamental - A', '7º Ano do Ensino Fundamental - B', '7º Ano do Ensino Fundamental - C',
    '8º Ano do Ensino Fundamental - A', '8º Ano do Ensino Fundamental - B',
    '9º Ano do Ensino Fundamental - A', '9º Ano do Ensino Fundamental - B',
    '1º Ano do Ensino Médio - A', '1º Ano do Ensino Médio - B', '1º Ano do Ensino Médio - C',
    '2º Ano do Ensino Médio - A', '2º Ano do Ensino Médio - B', '2º Ano do Ensino Médio - C',
    '3º Ano do Ensino Médio - A', '3º Ano do Ensino Médio - B', '3º Ano do Ensino Médio - C'
  ];

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

      const filhosSalvos = localStorage.getItem('meus_filhos');

      if (filhosSalvos) {
        try {
          this.filhos = JSON.parse(filhosSalvos);
        } catch (e) {
          console.error('Erro ao carregar filhos', e);
        }
      } else {
        localStorage.setItem('meus_filhos', JSON.stringify(this.filhos));
      }

      // foi implementado isso aqui (carrega as justificativas reais dos filhos do responsável)
      this.carregarSolicitacoes();
    }
  }

  // foi implementado isso aqui (busca as justificativas e filtra somente as pertencentes aos filhos cadastrados)
  carregarSolicitacoes() {
    const nomesDosFilhos = this.filhos.map(filho => filho.nome);

    const justificativas: Justificativa[] = this.justificativaService.listar();

    this.solicitacoes = justificativas
      .filter(j => nomesDosFilhos.includes(j.nomeAluno))
      .sort((a, b) => new Date(b.dataEnvio).getTime() - new Date(a.dataEnvio).getTime())
      .slice(0, 4)
      .map(j => ({
        id: this.justificativaService.formatarNumero(j.numero),

        // foi implementado isso aqui (identifica se a justificativa foi enviada pelo aluno ou pela responsável)
        aluno: j.enviadoPor === 'responsavel'
          ? `${j.nomeAluno} (por ${j.nomeResponsavel || this.nomeUsuario})`
          : j.nomeAluno,

        data: this.justificativaService.formatarDataFalta(j.dataFalta),
        motivo: j.motivo,
        status: this.converterStatus(j.status)
      }));
  }

  // foi implementado isso aqui (converte os status do modelo para os nomes utilizados no HTML original)
  private converterStatus(status: Justificativa['status']): Solicitacao['status'] {
    switch (status) {
      case 'pendente':
        return 'Em andamento';

      case 'aceita':
        return 'Aprovada';

      case 'rejeitada':
        return 'Rejeitada';

      default:
        return 'Em andamento';
    }
  }

  verPerfil(filho: Filho) {
    this.router.navigate(['/responsavel/perfil-filhos']);
  }

  abrirModalAdicionar() {
    this.novoFilho = { nome: '', instituicao: '', matricula: '', turma: '' };
    this.errosFormulario = { nome: false, instituicao: false, matricula: false, turma: false };
    this.modalAdicionarAberto = true;
  }

  fecharModalAdicionar() {
    this.modalAdicionarAberto = false;
  }

  exibirAlertaCustomizado(titulo: string, texto: string) {
    this.tituloMensagem = titulo;
    this.textoMensagem = texto;
    this.modalMensagemAberto = true;
  }

  fecharAlertaCustomizado() {
    this.modalMensagemAberto = false;
  }

  salvarNovoFilho() {
    this.errosFormulario.nome = !this.novoFilho.nome;
    this.errosFormulario.instituicao = !this.novoFilho.instituicao;
    this.errosFormulario.matricula = !this.novoFilho.matricula;
    this.errosFormulario.turma = !this.novoFilho.turma;

    if (
      this.errosFormulario.nome ||
      this.errosFormulario.instituicao ||
      this.errosFormulario.matricula ||
      this.errosFormulario.turma
    ) {
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

    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('meus_filhos', JSON.stringify(this.filhos));
    }

    // foi implementado isso aqui (atualiza as solicitações após vincular um novo filho)
    this.carregarSolicitacoes();

    this.fecharModalAdicionar();
    this.exibirAlertaCustomizado('Sucesso', `Filho(a) ${novo.nome} vinculado(a) com sucesso!`);
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
