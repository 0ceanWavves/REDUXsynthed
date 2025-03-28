declare module 'astro-icon' {
  import { ComponentProps } from 'astro/types';
  
  interface IconProps extends ComponentProps<'svg'> {
    name: string;
    class?: string;
  }
  
  export function Icon(props: IconProps): any;
} 