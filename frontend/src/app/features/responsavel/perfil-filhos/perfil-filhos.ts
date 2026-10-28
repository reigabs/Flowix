import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface FilhoPerfil {
  id: number;
  nome: string;
  instituicao: string;
  matricula: string;
  turma: string;
  editando?: boolean;
}

@Component({
  selector: 'app-perfil-filhos-responsavel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil-filhos.html',
  styleUrl: './perfil-filhos.css'
})
export class PerfilFilhosResponsavel implements OnInit {
  private platformId = inject(PLATFORM_ID);
  
  filhos: FilhoPerfil[] = [];
  modalExcluirAberto: boolean = false;
  filhoParaExcluir: FilhoPerfil | null = null;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const filhosSalvos = localStorage.getItem('meus_filhos');
      if (filhosSalvos) {
        try {
          this.filhos = JSON.parse(filhosSalvos).map((f: any) => ({ ...f, editando: false }));
        } catch (e) {
          console.error('Erro ao carregar perfil dos filhos', e);
        }
      }
    }
  }

  editarPerfil(filho: FilhoPerfil) {
    if (filho.editando) {
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('meus_filhos', JSON.stringify(this.filhos));
      }
      alert(`Alterações de ${filho.nome} salvas com sucesso!`);
    }
    filho.editando = !filho.editando;
  }

  confirmarExclusao(filho: FilhoPerfil) {
    this.filhoParaExcluir = filho;
    this.modalExcluirAberto = true;
  }

  cancelarExclusao() {
    this.modalExcluirAberto = false;
    this.filhoParaExcluir = null;
  }

  executarExclusao() {
    if (this.filhoParaExcluir) {
      const idAlvo = Number(this.filhoParaExcluir.id);
      this.filhos = this.filhos.filter(f => Number(f.id) !== idAlvo);
      
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('meus_filhos', JSON.stringify(this.filhos));
      }
    }
    this.cancelarExclusao();
  }
}