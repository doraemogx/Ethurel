import Phaser from 'phaser';
import { saveStore } from '@/save/SaveStore';
import { createEmptySave, type SaveDataV1 } from '@/save/schema';

const DEV_CHECK_SAVE_KEY = 'dev_boot_check';

/**
 * Cena mínima da Fase 1 — prova que o pipeline Phaser+Vite renderiza no
 * navegador e que o SaveStore persiste um objeto versionado em localStorage.
 * O teste automatizado (Playwright) recarrega a página (reload) e confirma que
 * "Sessão nº" incrementa — isso já valida a escrita/leitura em localStorage,
 * mas reload NÃO é o mesmo teste que fechar e reabrir a aba/app fisicamente
 * num aparelho Android; esse teste real fica pendente até existir uma build
 * acessível no celular (ver critério de saída da Fase 2 em
 * docs/design/04-VERTICAL-SLICE-E-ROADMAP.md §3). Não é a cena de jogo real —
 * mapa/personagem/câmera/colisão são escopo da Fase 2.
 */
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create(): void {
    const existing = saveStore.load<SaveDataV1>(DEV_CHECK_SAVE_KEY);
    const data: SaveDataV1 = existing ?? createEmptySave();
    data.sessionCount += 1;
    data.updatedAt = Date.now();
    const saved = saveStore.save(DEV_CHECK_SAVE_KEY, data);

    const centerX = this.scale.width / 2;

    this.add
      .text(centerX, 45, 'ETHUREL', {
        fontFamily: 'Georgia, serif',
        fontSize: '20px',
        color: '#e8dcc4',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 68, 'Fase 1 — infraestrutura (sem gameplay ainda)', {
        fontFamily: 'sans-serif',
        fontSize: '7px',
        color: '#9aa08c',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, 95, `Sessão nº ${data.sessionCount}  ·  save schema v${data.schemaVersion}`, {
        fontFamily: 'sans-serif',
        fontSize: '8px',
        color: '#c9b98a',
      })
      .setOrigin(0.5);

    this.add
      .text(
        centerX,
        113,
        saved ? 'save: OK (localStorage)' : 'save: indisponível neste navegador',
        {
          fontFamily: 'sans-serif',
          fontSize: '7px',
          color: saved ? '#8bbf8b' : '#c96a4b',
        }
      )
      .setOrigin(0.5);

    this.add
      .text(centerX, 150, 'Feche e reabra para ver o número da sessão subir.', {
        fontFamily: 'sans-serif',
        fontSize: '6px',
        color: '#6f7568',
      })
      .setOrigin(0.5);
  }
}
