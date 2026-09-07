export interface Interactable {
  id: string;
  x: number;
  y: number;
  /** Raio em pixels do mundo — dentro dele o indicador/botão fica disponível. */
  radius: number;
  label: string;
  onInteract: () => void;
  /** Falso quando a interação não deve mais disparar (ex.: quest já concluída
   * e nada de novo a dizer aqui) — o sistema simplesmente ignora. */
  enabled: () => boolean;
}
