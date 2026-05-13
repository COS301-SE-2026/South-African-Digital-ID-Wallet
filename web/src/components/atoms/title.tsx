import * as React from 'react'
import { cn } from '@/lib/utils'

type TitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  headingSize?: 'h1' | 'h2' | 'h3' | 'h4'
}

const headingSizeClasses: Record<
  NonNullable<TitleProps['headingSize']>,
  string
> = {
  h1: 'text-3xl md:text-4xl',
  h2: 'text-2xl md:text-3xl',
  h3: 'text-xl md:text-2xl',
  h4: 'text-lg md:text-xl',
} //maps each heading level to their size there

export function Title({
  headingSize = 'h1',
  className,
  children,
  ...props
}: TitleProps) {
  const Comp = headingSize

  return (
    <Comp
      className={cn(
        'font-bold tracking-tight text-[#173F2A]',
        headingSizeClasses[headingSize],
        className
      )}
      {...props}
    >
      {/*cn combines  the 3 class strings together*/}
      {children}
      {/*its whats put between the title tags. ex) <Title></Title>*/}
    </Comp>
  )
}
