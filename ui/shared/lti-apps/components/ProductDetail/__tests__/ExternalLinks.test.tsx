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
import {render} from '@testing-library/react'
import ExternalLinks from '../ExternalLinks'
import {product} from '../../common/__tests__/data'

describe('ExternalLinks renders as expected', () => {
  it('ExternalLinks renders as expected', () => {
    const {getByText} = render(<ExternalLinks product={product[0]} />)
    expect(getByText('Partner Privacy Policy')).toBeInTheDocument()
    expect(getByText('Accessibility Documentation')).toBeInTheDocument()
  })
})
