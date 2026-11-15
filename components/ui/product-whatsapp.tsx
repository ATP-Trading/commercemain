'use client';

import {createContext, useContext, useEffect, useState, type ReactNode} from 'react';
import {usePathname} from 'next/navigation';

const contactUrl = 'https://wa.me/971569586422';
const ContactContext = createContext(contactUrl);
type ProductContact = {path: string; href: string};
const RegisterContext = createContext<(contact: ProductContact | null) => void>(() => {});

export function ProductContactProvider({children}: {children: ReactNode}) {
  const pathname = usePathname();
  const [product, setProduct] = useState<ProductContact | null>(null);
  return (
    <RegisterContext.Provider value={setProduct}>
      <ContactContext.Provider value={product && pathname === product.path ? product.href : contactUrl}>
        {children}
      </ContactContext.Provider>
    </RegisterContext.Provider>
  );
}

export function useWhatsAppHref() {
  return useContext(ContactContext);
}

export function useProductWhatsApp(name: string, handle: string, locale: 'ar' | 'en') {
  const register = useContext(RegisterContext);
  const path = `/${locale}/product/${encodeURIComponent(handle)}`;
  const message = locale === 'ar' ? `هلا، عندي سؤال عن ${name}.` : `Hi, I have a question about ${name}.`;
  const href = contactUrl + '?text=' + encodeURIComponent(message + '\nhttps://www.atpgroupservices.ae' + path);
  useEffect(() => {
    register({path, href});
    return () => register(null);
  }, [register, path, href]);
  return href;
}
