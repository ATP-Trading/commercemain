import { renderHook, act } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
const router = vi.hoisted(() => ({ replace: vi.fn(), push: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => router }));
import { useUpdateURL } from '@/components/product/product-context';
it('replaces the current product state instead of adding history entries', () => {
 const { result } = renderHook(() => useUpdateURL());
 act(() => { result.current({ image: '1' }); result.current({ image: '2', size: 'Large' }); });
 expect(router.push).not.toHaveBeenCalled();
 expect(router.replace).toHaveBeenLastCalledWith('?image=2&size=Large', { scroll: false });
});
