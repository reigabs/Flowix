import { Routes } from '@angular/router';

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
    path: 'aluno',
    loadComponent: () =>
      import('./features/aluno/inicio/inicio')
        .then(m => m.Inicio)
  },

     {
        path: 'nova-justificativa',
        loadComponent: () => import('./features/aluno/nova-justificativa/nova-justificativa')
          .then(m => m.NovaJustificativa)
      },
      {
        path: 'historico',
        loadComponent: () => import('./features/aluno/historico/historico')
          .then(m => m.Historico)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/aluno/perfil/perfil')
          .then(m => m.Perfil)
      },
    
  

  {
    path: 'secretaria',
    loadComponent: () =>
      import('./features/secretaria/inicio/inicio')
        .then(m => m.Inicio)
  },
  {
    path: 'responsavel',
    loadComponent: () =>
      import('./features/responsavel/inicio/inicio')
        .then(m => m.Inicio)
  },

  // Redireciona rotas inexistentes
  {
    path: '**',
    redirectTo: ''
  }
];