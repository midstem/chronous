declare module '@/lib/utils' {
  export const cn: (...inputs: unknown[]) => string
}

declare module '@/components/ui/button' {
  export const Button: (
    props: import('react').ComponentProps<'button'> & {
      size?: 'default' | 'sm' | 'lg' | 'icon'
      variant?:
        'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
    }
  ) => import('react').ReactElement
}
