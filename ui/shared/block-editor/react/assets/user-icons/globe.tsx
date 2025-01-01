/*
 * Copyright (C) 2024 - present Instructure, Inc.
 *
 * This file is part of Canvas.
 *
 * Canvas is free software: you can redistribute it and/or modify it under
 * the terms of the GNU Affero General Public License as published by the Free
 * Software Foundation, version 3 of the License.
 *
 * Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
 * WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
 * A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
 * details.
 *
 * You should have received a copy of the GNU Affero General Public License along
 * with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import React from 'react'
import {SVGIcon} from '@instructure/ui-svg-images'
import {type IconProps} from './iconTypes'

import {useScope as createI18nScope} from '@canvas/i18n'

const I18n = createI18nScope('block-editor')

export default ({elementRef, size = 'small'}: IconProps) => {
  return (
    <SVGIcon
      elementRef={elementRef}
      title={I18n.t('globe')}
      src={`<svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
<path fill-rule="evenodd" clip-rule="evenodd" d="M12.3084 22.4498V24.1226H11.5003C11.0542 24.1226 10.6921 24.4847 10.6921 24.9308C10.6921 25.3768 11.0542 25.7389 11.5003 25.7389H14.7328C15.1788 25.7389 15.5409 25.3768 15.5409 24.9308C15.5409 24.4847 15.1788 24.1226 14.7328 24.1226H13.9246V22.6858C16.1049 22.8442 18.3548 22.3738 20.3896 21.1996C20.7759 20.9766 20.9084 20.482 20.6854 20.0957C20.4624 19.7095 19.9678 19.5769 19.5815 19.8C14.9469 22.4757 9.01042 20.8853 6.33472 16.2499C3.65821 11.6153 5.2494 5.6796 9.884 3.00309C10.2703 2.78005 10.4028 2.28548 10.1798 1.89919C9.95673 1.51291 9.46216 1.38038 9.07588 1.60342C3.66871 4.72521 1.81245 11.6508 4.93505 17.058C6.58928 19.9236 9.31023 21.7912 12.3084 22.4498ZM14.7594 3.31988H14.7328H14.7069C10.3608 3.33361 6.81798 6.78512 6.65716 11.0948C6.65312 11.1272 6.6515 11.1595 6.6515 11.1926C6.6515 11.2104 6.65231 11.2274 6.65312 11.2443C6.65231 11.2969 6.6515 11.3494 6.6515 11.4011C6.6515 15.8612 10.2727 19.4824 14.7328 19.4824C19.1928 19.4824 22.814 15.8612 22.814 11.4011C22.814 11.3478 22.814 11.2945 22.8124 11.2411C22.8132 11.225 22.814 11.2088 22.814 11.1926C22.814 11.1611 22.8124 11.1296 22.8083 11.0989C22.6491 6.78755 19.1063 3.33442 14.7594 3.31988ZM16.3369 12.0008C16.2714 13.9443 15.9369 15.6462 15.4302 16.7436C15.2774 17.075 15.115 17.3433 14.9316 17.5243C14.8637 17.5914 14.8087 17.6576 14.7328 17.6576C14.6576 17.6576 14.6018 17.5914 14.534 17.5243C14.3505 17.3433 14.1881 17.075 14.0353 16.7436C13.5294 15.6462 13.1941 13.9443 13.1286 12.0008H16.3369ZM11.5124 12.0008H8.29522C8.5312 14.5633 10.2654 16.6951 12.613 17.5105C12.015 16.2466 11.5867 14.2675 11.5124 12.0008ZM21.1703 12.0008H17.9539C17.8796 14.2675 17.4513 16.2458 16.8525 17.5105C19.2001 16.6951 20.9343 14.5633 21.1703 12.0008ZM12.5015 5.33211C10.339 6.12892 8.71707 8.04903 8.34775 10.3845H11.5196C11.6069 8.34803 11.9795 6.55804 12.5015 5.33211ZM16.3288 10.3845H13.1367C13.2183 8.52824 13.5472 6.90876 14.0353 5.85093C14.1881 5.51959 14.3505 5.25049 14.534 5.06947C14.6018 5.0024 14.6576 4.93613 14.7328 4.93613C14.8087 4.93613 14.8637 5.0024 14.9316 5.06947C15.115 5.25049 15.2774 5.51959 15.4302 5.85093C15.9183 6.90876 16.2472 8.52824 16.3288 10.3845ZM16.964 5.33211C17.486 6.55804 17.8586 8.34722 17.9459 10.3845H21.1185C20.7484 8.04903 19.1273 6.12892 16.964 5.33211Z" fill="currentColor"/>
</svg>
`}
      size={size}
    />
  )
}
