import React from 'react';
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useMagneticCursor } from '@/lib/hooks/use-magnetic-cursor';

// Framer Motion and the hook under test are real. Only the browser media API
// is supplied so that motion-preference behavior is deterministic in jsdom.
let media: MediaQueryList;
const addListener = vi.fn();
const removeListener = vi.fn();
beforeEach(() => {
  addListener.mockReset(); removeListener.mockReset();
  media = {
    matches: false, media: '(prefers-reduced-motion: reduce)', onchange: null,
    addListener: vi.fn(), removeListener: vi.fn(),
    addEventListener: addListener, removeEventListener: removeListener,
    dispatchEvent: vi.fn(() => true),
  };
  vi.stubGlobal('matchMedia', vi.fn(() => media));
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
const wrapper = ({ children }: React.PropsWithChildren) => <React.StrictMode>{children}</React.StrictMode>;

describe('magnetic cursor preserves Hook order and motion values', () => {
  it.each([true, false])('can toggle scaling both ways from initial scale=%s', initialScale => {
    const view = renderHook(({ scale }) => useMagneticCursor({ scale }), { initialProps: { scale: initialScale }, wrapper });
    const { x, y } = view.result.current;
    for (const scale of [!initialScale, initialScale, !initialScale]) {
      expect(() => view.rerender({ scale })).not.toThrow();
      expect(view.result.current.x).toBe(x);
      expect(view.result.current.y).toBe(y);
      if (!scale) expect(view.result.current.scale.get()).toBe(1);
    }
    expect(() => view.unmount()).not.toThrow();
  });
  it.each([true, false])('retains its scale MotionValue during ordinary rerenders with scale=%s', scale => {
    const view = renderHook(({ strength }) => useMagneticCursor({ scale, strength }), { initialProps: { strength: 0.2 }, wrapper });
    const value = view.result.current.scale;
    view.rerender({ strength: 0.4 });
    expect(view.result.current.scale).toBe(value);
  });
  it('keeps the disabled scale neutral while hover state still works', () => {
    const view = renderHook(() => useMagneticCursor({ scale: false }), { wrapper });
    act(() => view.result.current.handlers.onMouseEnter());
    expect(view.result.current.isActive).toBe(true);
    expect(view.result.current.scale.get()).toBe(1);
    act(() => view.result.current.handlers.onMouseLeave());
    expect(view.result.current.isActive).toBe(false);
    expect(view.result.current.scale.get()).toBe(1);
  });
  it('honors the reduced-motion preference and removes its media listener on unmount', () => {
    Object.defineProperty(media, 'matches', { value: true });
    const view = renderHook(() => useMagneticCursor({ scale: true }));
    act(() => view.result.current.handlers.onMouseEnter());
    expect(view.result.current.scale.get()).toBe(1);
    const listener = addListener.mock.calls[0][1];
    view.unmount();
    expect(removeListener).toHaveBeenCalledExactlyOnceWith('change', listener);
  });
});
