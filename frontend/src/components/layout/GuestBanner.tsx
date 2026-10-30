/**
 * Aviso no topo do modo convidado. O "x" fecha apenas nesta sessão
 * (sessionStorage): numa nova visita o aviso volta. Depois de fechado, o
 * rodapé da Sidebar continua indicando "Modo convidado" com o botão de login.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banner, Button } from '../ui';
import { authService } from '../../api/auth';

const DISMISS_KEY = 'guest_banner_dismissed';

export default function GuestBanner() {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem(DISMISS_KEY) === '1');

  if (dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem(DISMISS_KEY, '1');
    setDismissed(true);
  };

  const goToLogin = () => {
    authService.logout();
    navigate('/login', { replace: true });
  };

  return (
    <Banner
      tone="info"
      title="Modo convidado."
      onDismiss={dismiss}
      action={
        <Button size="sm" variant="outline" onClick={goToLogin}>
          Fazer login
        </Button>
      }
    >
      Você pode explorar os mundos de exemplo, mas não pode criar, editar nem excluir nada.
    </Banner>
  );
}
