import { inject, PLATFORM_ID } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return false;
  }
  
  const usuarioSalvoStr = localStorage.getItem('usuario_cadastrado');
  
  if (!usuarioSalvoStr) {
    router.navigate(['/login']);
    return false;
  }

  const usuario = JSON.parse(usuarioSalvoStr);
  const rotaDesejada = state.url; 

  
  if (rotaDesejada.includes(usuario.perfil)) {
    return true;
  } else {
    router.navigate([`/${usuario.perfil}`]);
    return false;
  }
};