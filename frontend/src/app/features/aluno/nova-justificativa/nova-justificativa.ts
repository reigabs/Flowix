import {
  Component,
  OnInit,
  inject,
  PLATFORM_ID,
  ChangeDetectorRef
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nova-justificativa',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nova-justificativa.html',
  styleUrl: './nova-justificativa.css'
})
export class NovaJustificativa implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);

  alunoSelecionado: string = '';
  motivo: string = '';
  dataFalta: string = '';
  arquivo: File | null = null;
  
  arrastando: boolean = false;
  enviando: boolean = false;
progresso: number = 0;
finalizando: boolean = false;
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
    this.validarEAtribuirArquivo(file);
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
    const tamanhoMaximo = 5 * 1024 * 1024; // 5 MB
    const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

    if (!tiposPermitidos.includes(file.type)) {
      this.mensagemErro = 'Formato inválido. Apenas PDF, JPG e PNG são permitidos.';
      return;
    }

    if (file.size > tamanhoMaximo) {
      this.mensagemErro = 'O arquivo é muito grande. O tamanho máximo permitido é 5 MB.';
      return;
    }

    this.arquivo = file;
  }

  removerArquivo() {
    this.arquivo = null;
    this.mensagemErro = '';
  }

  enviar() {
  console.log('Método enviar executado!');

  if (!this.motivo.trim() || !this.dataFalta) {
    this.mensagemErro = 'Por favor, preencha todos os campos obrigatórios.';
    return;
  }

  this.mensagemErro = '';
  this.enviando = true;
  this.progresso = 0;
  this.finalizando = false;

  this.cdr.detectChanges();

  const intervalo = setInterval(() => {
    this.progresso += 10;

    if (this.progresso >= 100) {
      this.progresso = 100;
      clearInterval(intervalo);
      this.finalizando = true;
    }

    this.cdr.detectChanges();

    if (this.progresso >= 100) {
      setTimeout(() => {
        this.router.navigate(['/aluno/inicio']);
      }, 500);
    }
  }, 200);
}

cancelar() {
  this.router.navigate(['/aluno/inicio']);
}}