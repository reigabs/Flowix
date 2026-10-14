import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface FilhoPerfil {
  id: number;
  nome: string;
  instituicao: string;
  matricula: string;
  turma: string;
  editando: boolean;
}

@Component({
  selector: 'app-perfil-filhos-responsavel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './perfil-filhos.html',
  styleUrl: './perfil-filhos.css'
})
export class PerfilFilhosResponsavel {
  
  filhos: FilhoPerfil[] = [
    {
      id: 1,
      nome: 'Flávia Santos',
      instituicao: 'Colégio InterGenius',
      matricula: '527478542',
      turma: '7º ano C',
      editando: false
    },
    {
      id: 2,
      nome: 'Henrique Santos',
      instituicao: 'Colégio InterGenius',
      matricula: '92736423',
      turma: '7º ano B',
      editando: false
    }
  ];

  editarPerfil(filho: FilhoPerfil) {
    if (filho.editando) {
      alert(`Alterações de ${filho.nome} salvas com sucesso!`);
    }
    filho.editando = !filho.editando;
  }

  excluirFilho(filho: FilhoPerfil) {
    if (confirm(`Tem certeza de que deseja excluir o perfil de ${filho.nome}?`)) {
      this.filhos = this.filhos.filter(f => f.id !== filho.id);
    }
  }
}