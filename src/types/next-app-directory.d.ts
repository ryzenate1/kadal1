import 'next';

declare module 'next' {
  export interface PageProps {
    params: Record<string, string>;
    searchParams?: Record<string, string | string[]>;
  }
}

// For app directory page props
declare global {
  namespace React {
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      // Add any custom HTML attributes here
      class?: string;
    }
  }

  // For dynamic route params
  type PageParams<T extends Record<string, string>> = {
    params: T;
    searchParams?: { [key: string]: string | string[] | undefined };
  };
}

export {};
