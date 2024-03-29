import { ArrowIconT } from '../../types'
import colors from '../../theme/colors'
import { ArrowDirections, IconSizes } from '../../constants'

import { directions } from './constants'

const Arrow = ({
  sx = {},
  color = colors.red,
  size = IconSizes.md,
  direction = ArrowDirections.LEFT,
}: ArrowIconT): JSX.Element => (
  <svg
    style={sx}
    width={size}
    height={size}
    fill={color}
    focusable="false"
    aria-hidden="true"
    viewBox="0 0 24 24"
  >
    <path d={directions[direction]}></path>
  </svg>
)

export default Arrow
