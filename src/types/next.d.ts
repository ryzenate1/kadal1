import 'next';

declare module 'next' {
  // Remove this conflicting interface
  // export interface PageProps {
  //   params?: Record<string, string>;
  //   searchParams?: Record<string, string | string[]>;
  // }

  // Add specific page props for dynamic routes
  export interface OrderPageProps extends PageProps {
    params: {
      orderId: string;
    };
  }

  export interface ProductPageProps extends PageProps {
    params: {
      slug: string;
    };
  }
  
  // For app router async components
  export interface AsyncPageProps<T = {}> {
    params: T;
    searchParams?: Record<string, string | string[]>;
  }
}

declare module 'next/link' {
  import { AnchorHTMLAttributes, DetailedHTMLProps } from 'react';
  
  export interface LinkProps extends Omit<DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, 'href'> {
    href: string | { pathname: string; query: Record<string, any> };
    as?: string;
    replace?: boolean;
    scroll?: boolean;
    shallow?: boolean;
    passHref?: boolean;
    prefetch?: boolean;
    locale?: string | false;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}

declare module 'next/image' {
  import { ImgHTMLAttributes } from 'react';
  
  export interface ImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'ref' | 'width' | 'height' | 'loading'> {
    src: string | StaticImport;
    width: number;
    height: number;
    alt: string;
    loader?: ImageLoader;
    quality?: number | string;
    priority?: boolean;
    loading?: 'lazy' | 'eager';
    placeholder?: 'blur' | 'empty';
    blurDataURL?: string;
    unoptimized?: boolean;
    onLoadingComplete?: (result: { naturalWidth: number; naturalHeight: number }) => void;
    layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive';
    objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
    objectPosition?: string;
    lazyBoundary?: string;
    lazyRoot?: string;
  }
}
