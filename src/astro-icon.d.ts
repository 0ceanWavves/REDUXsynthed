declare module 'astro-icon/components' {
  import { ComponentProps } from 'astro/types';
  
  interface IconProps extends ComponentProps<'svg'> {
    name: string;
  }
  
  export function Icon(props: IconProps): any;
} 