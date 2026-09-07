import { describe, it, expect, vi, afterEach } from 'vitest';
import { initOrientationController } from '@/core/orientation';

function setViewport(width: number, height: number): void {
  Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
  Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });
}

describe('initOrientationController', () => {
  afterEach(() => {
    setViewport(1024, 768);
  });

  it('detecta portrait no estado inicial (altura > largura)', () => {
    setViewport(390, 844);
    const onPortrait = vi.fn();
    const onLandscape = vi.fn();
    const stop = initOrientationController({ onPortrait, onLandscape });
    expect(onPortrait).toHaveBeenCalledTimes(1);
    expect(onLandscape).not.toHaveBeenCalled();
    stop();
  });

  it('detecta landscape no estado inicial (largura > altura)', () => {
    setViewport(844, 390);
    const onPortrait = vi.fn();
    const onLandscape = vi.fn();
    const stop = initOrientationController({ onPortrait, onLandscape });
    expect(onLandscape).toHaveBeenCalledTimes(1);
    expect(onPortrait).not.toHaveBeenCalled();
    stop();
  });

  it('alterna portrait -> landscape -> portrait -> landscape via resize, sem duplicar chamadas por estado', () => {
    setViewport(390, 844);
    const onPortrait = vi.fn();
    const onLandscape = vi.fn();
    const stop = initOrientationController({ onPortrait, onLandscape });
    expect(onPortrait).toHaveBeenCalledTimes(1);

    setViewport(844, 390);
    window.dispatchEvent(new Event('resize'));
    expect(onLandscape).toHaveBeenCalledTimes(1);

    setViewport(390, 844);
    window.dispatchEvent(new Event('resize'));
    expect(onPortrait).toHaveBeenCalledTimes(2);

    setViewport(844, 390);
    window.dispatchEvent(new Event('resize'));
    expect(onLandscape).toHaveBeenCalledTimes(2);

    stop();
  });

  it('é idempotente: resize sem mudança de estado não dispara callback de novo', () => {
    setViewport(844, 390);
    const onPortrait = vi.fn();
    const onLandscape = vi.fn();
    const stop = initOrientationController({ onPortrait, onLandscape });
    expect(onLandscape).toHaveBeenCalledTimes(1);

    // Ainda landscape (dimensões diferentes, mesma orientação) — não deve
    // disparar onLandscape de novo.
    setViewport(900, 400);
    window.dispatchEvent(new Event('resize'));
    expect(onLandscape).toHaveBeenCalledTimes(1);

    stop();
  });

  it('reavalia o estado quando o documento volta a ficar visível (background -> foreground)', () => {
    setViewport(390, 844);
    const onPortrait = vi.fn();
    const onLandscape = vi.fn();
    const stop = initOrientationController({ onPortrait, onLandscape });
    expect(onPortrait).toHaveBeenCalledTimes(1);

    // App volta de background já em landscape (aparelho girado enquanto em segundo plano).
    setViewport(844, 390);
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    expect(onLandscape).toHaveBeenCalledTimes(1);

    stop();
  });
});
