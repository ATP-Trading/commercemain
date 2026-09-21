// Global custom-element definitions used by the storefront.
import type { ReactNode } from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "tamara-widget": {
        id?: string;
        type?: string;
        amount?: string;
        config?: string;
        "inline-type"?: string;
        children?: ReactNode;
      };
    }
  }
}
