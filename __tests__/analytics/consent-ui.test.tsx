import React from 'react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
vi.mock('next/navigation',()=>({usePathname:()=>'/en'}))
const locale = vi.hoisted(()=>({value:'en'}))
vi.mock('next-intl',()=>({useLocale:()=>locale.value}))
import { GoogleAnalytics } from '@/components/analytics/google-analytics'
beforeEach(()=>{localStorage.clear(); locale.value='en'; Object.defineProperty(window,'location',{configurable:true,value:new URL('https://preview.vercel.app/en')}); window.fbq=undefined;})
afterEach(()=>cleanup())
it('asks for separate marketing choice for an existing analytics visitor',()=>{
 localStorage.setItem('atp-analytics-consent','granted');render(<GoogleAnalytics/>);
 expect(screen.getByText('Analytics only')).toBeInTheDocument();
 fireEvent.click(screen.getByText('Analytics only'));
 expect(localStorage.getItem('atp-analytics-consent')).toBe('granted');expect(localStorage.getItem('atp-marketing-consent')).toBe('denied');
})
it('allows both only after explicit allow all',()=>{
 render(<GoogleAnalytics/>);fireEvent.click(screen.getByText('Allow all'));
 expect(localStorage.getItem('atp-marketing-consent')).toBe('granted');
})
it('supports Arabic rejection of both categories',()=>{
 locale.value='ar';render(<GoogleAnalytics/>);fireEvent.click(screen.getByText('رفض'));
 expect(localStorage.getItem('atp-analytics-consent')).toBe('denied');expect(localStorage.getItem('atp-marketing-consent')).toBe('denied');
})
