import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { SecretariaLayoutComponent } from './features/secretaria/secretaria-layout';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/autenticacao/home-publica/home-publica')
        .then(m => m.HomePublica)
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/autenticacao/login/login')
        .then(m => m.Login)
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./features/autenticacao/cadastro/cadastro')
        .then(m => m.Cadastro)
  },
  {
    path: 'cadastro-concluido',
    loadComponent: () =>
      import('./features/autenticacao/cadastro-concluido/cadastro-concluido')
        .then(m => m.CadastroConcluido)
  },

  // Grupo de Rotas da Secretaria protegidas pelo Layout e Guard
  {
    path: 'secretaria',
    canActivate: [authGuard],
    component: SecretariaLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/secretaria/inicio/inicio')
            .then(m => m.InicioComponent)
      },
      {
        path: 'solicitacoes',
        loadComponent: () =>
          import('./features/secretaria/solicitacoes/solicitacoes')
            .then(m => m.SolicitacoesComponent)
      },
      {
        path: 'historico',
        loadComponent: () =>
          import('./features/secretaria/historico/detalhes-solicitacao')
            .then(m => m.HistoricoComponent)
      },
      {
        path: 'perfil',
        loadComponent: () =>
          import('./features/secretaria/perfil/perfil')
            .then(m => m.PerfilComponent)
      }
    ]
  },

  // Aluno e Responsável...
  {
    path: 'aluno',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/aluno/inicio/inicio')
        .then(m => m.Inicio)
  },
  {
    path: 'responsavel',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/responsavel/inicio/inicio')
        .then(m => m.Inicio)
  },

  {
    path: '**',
    redirectTo: ''
  }
];