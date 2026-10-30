/**
 * Devolve o usuário logado (ou null enquanto carrega, em modo convidado ou
 * se a sessão expirou). Sidebar e Home compartilham a mesma requisição,
 * porque authService.getMe() guarda o resultado em cache.
 */
import { useEffect, useState } from 'react';
import { authService, type CurrentUser } from '../api/auth';

export function useCurrentUser(): CurrentUser | null {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    if (!authService.isAuthenticated()) return;
    let active = true;
    authService
      .getMe()
      .then((me) => {
        if (active) setUser(me);
      })
      .catch(() => {
        /* sem usuário: a UI usa o valor padrão */
      });
    return () => {
      active = false;
    };
  }, []);

  return user;
}