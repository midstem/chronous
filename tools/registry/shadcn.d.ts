declare module '@/components/ui/button' {
  export const Button: (
    props: import('react').ComponentProps<'button'> & {
      size?: string
      variant?: string
    }
  ) => import('react').ReactElement
}
