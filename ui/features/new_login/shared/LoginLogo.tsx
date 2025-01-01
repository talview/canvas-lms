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
import {Flex} from '@instructure/ui-flex'
import {Img} from '@instructure/ui-img'
import {Responsive} from '@instructure/ui-responsive'
import {canvas} from '@instructure/ui-theme-tokens'
import {Text} from '@instructure/ui-text'
import {useNewLogin} from '../context/NewLoginContext'

const LoginLogo = () => {
  const {loginLogoUrl: src, loginLogoText: text} = useNewLogin()

  if (!src) return null

  return (
    <Responsive
      match="media"
      query={{
        tablet: {minWidth: canvas.breakpoints.tablet}, // 768px
        desktop: {minWidth: canvas.breakpoints.desktop}, // 1024px
      }}
    >
      {(_props, matches) => {
        const isDesktop = matches?.includes('desktop')
        const isTablet = matches?.includes('tablet')
        const width = isDesktop ? '18.75rem' : isTablet ? '23.25rem' : '11.25rem' // 300px, 372px, 180px
        const height = isDesktop ? '7.5rem' : '5rem' // 120px, 80px

        return (
          <Flex
            direction="column"
            height={height}
            gap="x-small"
            alignItems="center"
            justifyItems="center"
          >
            <Flex.Item width={width} shouldShrink={true} shouldGrow={true}>
              <Img constrain="contain" display="block" height="100%" src={src} width="100%" />
            </Flex.Item>

            {text && (
              <Flex.Item textAlign="center">
                <Text size="x-small">{text}</Text>
              </Flex.Item>
            )}
          </Flex>
        )
      }}
    </Responsive>
  )
}

export default LoginLogo
