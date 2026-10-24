import * as React from 'react'

import { Button as UiButton, type ButtonProps as UiButtonProps } from '@/components/ui/button'
import { Icon, type IconName } from '@/components/daydor/Icon'

export interface ButtonProps extends Omit<UiButtonProps, 'size'> {
  size?: 'sm' | 'md' | 'lg'
  icon?: IconName
  iconRight?: IconName
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ icon, iconRight, loading, children, disabled, ...props }, ref) => (
    <UiButton ref={ref} disabled={disabled || loading} {...props}>
      {loading ? <Icon name="loader" size={14} className="animate-spin" /> : icon ? <Icon name={icon} size={14} /> : null}
      {children}
      {!loading && iconRight ? <Icon name={iconRight} size={14} /> : null}
    </UiButton>
  ),
)
Button.displayName = 'DaydorButton'
