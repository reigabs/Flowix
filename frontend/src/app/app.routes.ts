import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { SecretariaLayoutComponent } from './features/secretaria/secretaria-layout';
import { ResponsavelLayoutComponent } from './features/responsavel/responsavel-layout';
import { AlunoLayoutComponent } from './features/aluno/aluno-layout';

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

  // Rotas da Secretaria
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

  // Rotas do Aluno 
  {
    path: 'aluno',
    canActivate: [authGuard],
    component: AlunoLayoutComponent, 
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },
      {
        path: 'inicio',
        loadComponent: () => 
          import('./features/aluno/inicio/inicio')
            .then(m => m.Inicio)
      },
      {
        path: 'nova-justificativa',
        loadComponent: () => 
          import('./features/aluno/nova-justificativa/nova-justificativa')
            .then(m => m.NovaJustificativa)
      },
      {
        path: 'notificacoes',
        loadComponent: () => 
          import('./features/aluno/notificacoes/notificacoes')
            .then(m => m.Notificacoes)
      },
      {
        path: 'historico',
        loadComponent: () => 
          import('./features/aluno/historico/historico')
            .then(m => m.Historico)
      },
      {
        path: 'perfil',
        loadComponent: () => 
          import('./features/aluno/perfil/perfil')
            .then(m => m.Perfil)
      }
    ]
  },

  // Rotas do Responsável
  {
    path: 'responsavel',
    canActivate: [authGuard],
    component: ResponsavelLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
      },
      {
        path: 'inicio',
        loadComponent: () =>
          import('./features/responsavel/inicio/inicio')
            .then(m => m.InicioResponsavel)
      },
      {
        path: 'nova-justificativa',
        loadComponent: () => 
          import('./features/responsavel/nova-justificativa/nova-justificativa')
            .then(m => m.NovaJustificativa)
      },
      {
        path: 'historico',
        loadComponent: () => 
          import('./features/responsavel/historico/historico')
            .then(m => m.HistoricoResponsavel)
      },
      {
        path: 'notificacoes',
        loadComponent: () => 
          import('./features/responsavel/notificacoes/notificacoes')
            .then(m => m.NotificacoesResponsavel)
      },
      {
        path: 'perfil',
        loadComponent: () => 
          import('./features/responsavel/perfil/perfil')
            .then(m => m.PerfilResponsavel)
      },
      {
        path: 'perfil-filhos',
        loadComponent: () => 
          import('./features/responsavel/perfil-filhos/perfil-filhos')
            .then(m => m.PerfilFilhosResponsavel)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];