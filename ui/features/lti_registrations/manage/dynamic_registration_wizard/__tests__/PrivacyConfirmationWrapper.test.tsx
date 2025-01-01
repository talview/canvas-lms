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
import {render, screen} from '@testing-library/react'
import {mockRegistration} from './helpers'
import {createRegistrationOverlayStore} from '../../registration_wizard/registration_settings/RegistrationOverlayState'
import {PrivacyConfirmationWrapper} from '../components/PrivacyConfirmationWrapper'
import {LtiScopes} from '@canvas/lti/model/LtiScope'
import {i18nLtiPrivacyLevel, i18nLtiPrivacyLevelDescription} from '../../model/i18nLtiPrivacyLevel'
import userEvent from '@testing-library/user-event'

describe('PrivacyConfirmationWrapper', () => {
  it('renders the privacy confirmation window', () => {
    const registration = mockRegistration({
      scopes: [LtiScopes.AccessPageContent],
      client_name: 'Test App',
    })
    const overlayStore = createRegistrationOverlayStore(registration.client_name, registration)

    render(
      <PrivacyConfirmationWrapper overlayStore={overlayStore} toolName={registration.client_name} />
    )

    expect(screen.getByText('Data Sharing')).toBeInTheDocument()
  })

  it("let's the user select a privacy level", async () => {
    const registration = mockRegistration(
      {
        scopes: [LtiScopes.AccessPageContent],
        client_name: 'Test App',
        lti_tool_configuration: {
          'https://canvas.instructure.com/lti/privacy_level': 'public',
          claims: [],
          domain: 'example.com',
          messages: [],
          target_link_uri: 'https://example.com',
        },
      },
      {
        extensions: [
          {
            platform: 'canvas.instructure.com',
            privacy_level: 'public',
            settings: {
              placements: [],
            },
          },
        ],
      }
    )
    const overlayStore = createRegistrationOverlayStore(registration.client_name, registration)
    render(
      <PrivacyConfirmationWrapper overlayStore={overlayStore} toolName={registration.client_name} />
    )
    expect(screen.getByLabelText(/User Data Shared With This App/i)).toHaveValue(
      i18nLtiPrivacyLevel('public')
    )

    await userEvent.click(screen.getByLabelText(/User Data Shared With This App/i))
    await userEvent.click(screen.getByText(i18nLtiPrivacyLevel('public')))

    expect(screen.getByLabelText(/User Data Shared With This App/i)).toHaveValue(
      i18nLtiPrivacyLevel('public')
    )
  })

  it('renders a description of what information is included', () => {
    const registration = mockRegistration(
      {
        scopes: [LtiScopes.AccessPageContent],
        client_name: 'Test App',
        lti_tool_configuration: {
          'https://canvas.instructure.com/lti/privacy_level': 'public',
          claims: [],
          domain: 'example.com',
          messages: [],
          target_link_uri: 'https://example.com',
        },
      },
      {
        extensions: [
          {
            platform: 'canvas.instructure.com',
            privacy_level: 'public',
            settings: {
              placements: [],
            },
          },
        ],
      }
    )
    const overlayStore = createRegistrationOverlayStore(registration.client_name, registration)
    render(
      <PrivacyConfirmationWrapper overlayStore={overlayStore} toolName={registration.client_name} />
    )

    expect(screen.getByText(i18nLtiPrivacyLevelDescription('public'))).toBeInTheDocument()
  })
})
