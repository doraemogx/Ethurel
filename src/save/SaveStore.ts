/**
 * Adaptador único de persistência. Hoje só implementa localStorage (web); quando
 * o jogo for empacotado via Capacitor, uma segunda implementação (Preferences/
 * Filesystem) entra atrás desta mesma interface, sem o resto do código saber
 * qual back-end está ativo (docs/design/02-STACK-E-ARQUITETURA.md §4).
 *
 * Nunca lança para código que chama get/set/delete — falhas de storage (modo
 * privado, quota, storage bloqueado) são tratadas aqui e reportadas via console,
 * nunca silenciosamente ignoradas nem propagadas como exceção não tratada.
 */
const STORAGE_PREFIX = 'ethurel::';

export interface StorageAdapter {
  get(key: string): string | null;
  set(key: string, value: string): boolean;
  delete(key: string): void;
}

class LocalStorageAdapter implements StorageAdapter {
  get(key: string): string | null {
    try {
      return window.localStorage.getItem(STORAGE_PREFIX + key);
    } catch (err) {
      console.warn('[SaveStore] Falha ao ler localStorage:', err);
      return null;
    }
  }

  set(key: string, value: string): boolean {
    try {
      window.localStorage.setItem(STORAGE_PREFIX + key, value);
      return true;
    } catch (err) {
      console.warn('[SaveStore] Falha ao gravar localStorage (quota/modo privado?):', err);
      return false;
    }
  }

  delete(key: string): void {
    try {
      window.localStorage.removeItem(STORAGE_PREFIX + key);
    } catch (err) {
      console.warn('[SaveStore] Falha ao remover localStorage:', err);
    }
  }
}

export class SaveStore {
  constructor(private readonly adapter: StorageAdapter = new LocalStorageAdapter()) {}

  load<T>(key: string): T | null {
    const raw = this.adapter.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch (err) {
      console.warn(`[SaveStore] Save corrompido em "${key}", ignorando em vez de apagar:`, err);
      return null;
    }
  }

  /** Retorna `true` se a gravação teve sucesso — quem chama decide se avisa o
   * jogador em caso de falha; o SaveStore nunca apaga dado existente sozinho. */
  save<T>(key: string, data: T): boolean {
    return this.adapter.set(key, JSON.stringify(data));
  }

  delete(key: string): void {
    this.adapter.delete(key);
  }
}

export const saveStore = new SaveStore();
