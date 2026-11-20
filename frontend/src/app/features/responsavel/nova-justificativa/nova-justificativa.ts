// foi implementado isso aqui (ChangeDetectorRef adicionado ao import)
import { Component, OnInit, inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
// foi implementado isso aqui (import do service compartilhado)
import { JustificativaService } from '../../../core/services/justificativa.service';

@Component({
  selector: 'app-nova-justificativa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nova-justificativa.html',
  styleUrl: './nova-justificativa.css'
})
export class NovaJustificativa implements OnInit {
  private platformId = inject(PLATFORM_ID);
  // foi implementado isso aqui (injeções novas)
  private cdr = inject(ChangeDetectorRef);
  private justificativaService = inject(JustificativaService);

  alunoSelecionado: string = '';
  motivo: string = '';
  dataFalta: string = '';
  arquivo: File | null = null;
  
  arrastando: boolean = false;
  enviando: boolean = false;
  progresso: number = 0;
  mensagemErro: string = '';
  filhos: any[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const filhosSalvos = localStorage.getItem('meus_filhos');
      if (filhosSalvos) {
        try {
          this.filhos = JSON.parse(filhosSalvos);
        } catch (e) {
          console.error('Erro ao carregar filhos salvos', e);
        }
      }
    }
  }

  selecionarArquivo(event: any) {
    const file = event.target.files[0];
    // foi implementado isso aqui (só valida se o usuário escolheu um arquivo)
    if (file) {
      this.validarEAtribuirArquivo(file);
    }
  }

  aoArrastar(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.arrastando = true;
  }

  aoSairDaArea(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.arrastando = false;
  }

  aoSoltar(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.arrastando = false;

    const file = event.dataTransfer?.files[0];
    if (file) {
      this.validarEAtribuirArquivo(file);
    }
  }

  validarEAtribuirArquivo(file: File) {
    this.mensagemErro = '';
    // foi implementado isso aqui (limite de 2 MB, por causa do localStorage)
    const tamanhoMaximo = 2 * 1024 * 1024; // 2 MB
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    if (!tiposPermitidos.includes(file.type)) {
      this.mensagemErro = 'Formato inválido. Apenas PDF, JPG e PNG são permitidos.';
      return;
    }

    if (file.size > tamanhoMaximo) {
      // foi implementado isso aqui (mensagem com o novo limite)
      this.mensagemErro = 'O arquivo é muito grande. O tamanho máximo permitido é 2 MB.';
      return;
    }

    this.arquivo = file;
  }

  removerArquivo() {
    this.arquivo = null;
    this.mensagemErro = '';
  }

  // foi implementado isso aqui (enviar agora é async e salva a justificativa no service)
  async enviar() {
    if (!this.alunoSelecionado || !this.motivo.trim() || !this.dataFalta) {
      this.mensagemErro = 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    this.mensagemErro = '';

    try {
      await this.justificativaService.criar(
        {
          enviadoPor: 'responsavel',
          nomeAluno: this.alunoSelecionado,
          nomeResponsavel: this.obterNomeResponsavel(),
          motivo: this.motivo.trim(),
          dataFalta: this.dataFalta
        },
        this.arquivo
      );
    } catch (e) {
      console.error('Erro ao salvar justificativa', e);
      this.mensagemErro = 'Não foi possível salvar. O arquivo pode ser grande demais, tente um menor.';
      this.cdr.detectChanges();
      return;
    }

    // animação de envio (a mesma de antes)
    this.enviando = true;
    this.progresso = 0;
    this.cdr.detectChanges();

    const intervalo = setInterval(() => {
      this.progresso += 10;
      if (this.progresso >= 100) {
        this.progresso = 100;
        clearInterval(intervalo);
        setTimeout(() => {
          this.router.navigate(['/responsavel/inicio']);
        }, 500);
      }
      this.cdr.detectChanges();
    }, 200);
  }

  // foi implementado isso aqui (nome do responsável logado, gravado pelo login)
  private obterNomeResponsavel(): string {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const usuario = JSON.parse(localStorage.getItem('usuario_cadastrado') || '{}');
        if (usuario.nome) return usuario.nome;
      } catch {}
    }
    return 'Responsável';
  }

  cancelar() {
    this.router.navigate(['/responsavel/inicio']);
  }
}