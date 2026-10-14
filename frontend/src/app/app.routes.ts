import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { SecretariaLayoutComponent } from './features/secretaria/secretaria-layout';
import { Inicio } from './features/aluno/inicio/inicio';
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

  // Grupo de rotas do Aluno
  {
    path: 'aluno',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/aluno/inicio/inicio')
        .then(m => m.Inicio)
  },


{
  path: 'aluno/inicio',
    canActivate: [authGuard],
  loadComponent: () => 
    import('./features/aluno/inicio/inicio')
    .then(m => m.Inicio)
},


{
  path: 'aluno/nova-justificativa',
    canActivate: [authGuard],
  loadComponent: () => 
    import('./features/aluno/nova-justificativa/nova-justificativa')
    .then(m => m.NovaJustificativa)
},

{
  path: 'aluno/notificacoes',
  canActivate: [authGuard],
 loadComponent: () => 
    import('./features/aluno/notificacoes/notificacoes')
    .then(m => m.Notificacoes)
},
{
  path: 'aluno/historico',
    canActivate: [authGuard],
  loadComponent: () => 
    import('./features/aluno/historico/historico')
    .then(m => m.Historico)
},


{
  path: 'aluno/perfil',
    canActivate: [authGuard],
  loadComponent: () => 
    import('./features/aluno/perfil/perfil')
    .then(m => m.Perfil)
},

  
   //Grupo de rotas do Responsavel

  {
    path: 'responsavel',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/responsavel/inicio/inicio')
        .then(m => m.Inicio)
  },

  {
  path: 'responsavel/inicio',
  canActivate: [authGuard],
  loadComponent: () => 
    import('./features/responsavel/inicio/inicio')
    .then(m => m.Inicio)
},

    {
  path: 'responsavel/nova-justificativa',
  canActivate: [authGuard],
  loadComponent: () => 
    import('./features/responsavel/nova-justificativa/nova-justificativa')
    .then(m => m.NovaJustificativa)
},
    {
  path: 'responsavel/historico',
  canActivate: [authGuard],
  loadComponent: () => 
    import('./features/responsavel/historico/historico')
    .then(m => m.Historico)
},

  {
  path: 'responsavel/perfil',
  canActivate: [authGuard],
  loadComponent: () => 
    import('./features/responsavel/perfil/perfil')
    .then(m => m.Perfil)
},

   {
  path: 'responsavel/perfil-filhos',
  canActivate: [authGuard],
  loadComponent: () => 
    import('./features/responsavel/perfil-filhos/perfil-filhos')
    .then(m => m.PerfilFilhos)
},


  {
    path: '**',
    redirectTo: ''
  }
];