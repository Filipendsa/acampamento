export class OfflineNotificationAdapter {
  public static suporteDisponivel(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public static permissaoAtual(): NotificationPermission | 'unsupported' {
    if (!this.suporteDisponivel()) return 'unsupported';
    return Notification.permission;
  }

  public static async solicitarPermissao(): Promise<NotificationPermission | 'unsupported'> {
    if (!this.suporteDisponivel()) return 'unsupported';
    if (Notification.permission === 'granted') return 'granted';
    return Notification.requestPermission();
  }

  public static tocarSomAlerta(): void {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notas = [523.25, 659.25, 783.99]; // Dó - Mi - Sol
      notas.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const start = ctx.currentTime + idx * 0.14;
        gain.gain.setValueAtTime(0.001, start);
        gain.gain.exponentialRampToValueAtTime(0.18, start + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.3);
      });
    } catch {
      // Silencioso se o navegador bloquear áudio antes de interação
    }
  }

  public static async notificar(titulo: string, corpo: string, tag: string): Promise<void> {
    this.tocarSomAlerta();

    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch {
        // ignore
      }
    }

    if (!this.suporteDisponivel() || Notification.permission !== 'granted') {
      return;
    }

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          await reg.showNotification(titulo, {
            body: corpo,
            icon: '/icons/icon.svg',
            badge: '/icons/icon.svg',
            tag,
          });
          return;
        }
      }
      new Notification(titulo, {
        body: corpo,
        icon: '/icons/icon.svg',
        tag,
      });
    } catch {
      // Fallback já coberto pelo toast/banner interno da Central de Avisos
    }
  }
}
