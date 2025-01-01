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

import {showFlashAlert} from '@canvas/alerts/react/FlashAlert'
import GenericErrorPage from '@canvas/generic-error-page/react'
import {useScope as createI18nScope} from '@canvas/i18n'
import errorShipUrl from '@canvas/images/ErrorShip.svg'
import {Button} from '@instructure/ui-buttons'
import {Flex} from '@instructure/ui-flex'
import {Modal} from '@instructure/ui-modal'
import {ProgressBar} from '@instructure/ui-progress'
import {Spinner} from '@instructure/ui-spinner'
import React from 'react'
import type {AccountId} from '../model/AccountId'
import type {UnifiedToolId} from '../model/UnifiedToolId'
import type {LtiImsRegistrationId} from '../model/lti_ims_registration/LtiImsRegistrationId'
import {RegistrationModalBody} from '../registration_wizard/RegistrationModalBody'
import type {DynamicRegistrationWizardService} from './DynamicRegistrationWizardService'
import {
  mkUseDynamicRegistrationWizardState,
  type DynamicRegistrationWizardState,
} from './DynamicRegistrationWizardState'
import {IconConfirmationWrapper} from './components/IconConfirmationWrapper'
import {NamingConfirmationWrapper} from './components/NamingConfirmationWrapper'
import {PermissionConfirmationWrapper} from './components/PermissionConfirmationWrapper'
import {PlacementsConfirmationWrapper} from './components/PlacementsConfirmationWrapper'
import {PrivacyConfirmationWrapper} from './components/PrivacyConfirmationWrapper'
import {ReviewScreenWrapper} from './components/ReviewScreenWrapper'
import {isUnsuccessful} from '../../common/lib/apiResult/ApiResult'

const I18n = createI18nScope('lti_registrations')

export type DynamicRegistrationWizardProps = {
  dynamicRegistrationUrl: string
  accountId: AccountId
  unifiedToolId?: UnifiedToolId
  unregister: () => void
  onSuccessfulRegistration: () => void
  service: DynamicRegistrationWizardService
  registrationId?: LtiImsRegistrationId
}

export const DynamicRegistrationWizard = (props: DynamicRegistrationWizardProps) => {
  const {accountId, dynamicRegistrationUrl, service, unifiedToolId, registrationId} = props
  const useDynamicRegistrationWizardState = React.useMemo(() => {
    return mkUseDynamicRegistrationWizardState(service)
  }, [service])
  const dynamicRegistrationWizardState = useDynamicRegistrationWizardState()

  const {loadRegistrationToken, loadRegistration} = dynamicRegistrationWizardState

  React.useEffect(() => {
    if (registrationId) {
      loadRegistration(accountId, registrationId)
    } else {
      loadRegistrationToken(accountId, dynamicRegistrationUrl, unifiedToolId)
    }
  }, [
    accountId,
    dynamicRegistrationUrl,
    loadRegistrationToken,
    unifiedToolId,
    registrationId,
    loadRegistration,
  ])

  const state = dynamicRegistrationWizardState.state

  switch (state._type) {
    case 'RequestingToken':
      return (
        <>
          {progressBar(state)}
          <RegistrationModalBody>
            <Flex
              justifyItems="center"
              alignItems="center"
              height="100%"
              data-testid="dynamic-reg-modal-loading-registration"
            >
              <Flex.Item>
                <Spinner renderTitle={I18n.t('Loading')} />
              </Flex.Item>
              <Flex.Item>{I18n.t('Loading')}</Flex.Item>
            </Flex>
          </RegistrationModalBody>
          <Modal.Footer>
            <Button color="secondary" type="submit" onClick={props.unregister}>
              {I18n.t('Cancel')}
            </Button>
            <Button margin="small" color="primary" type="submit" disabled={true}>
              {I18n.t('Next')}
            </Button>
          </Modal.Footer>
        </>
      )
    case 'WaitingForTool':
      return (
        <>
          {progressBar(state)}
          <RegistrationModalBody padding="none">
            <iframe
              src={addParams(props.dynamicRegistrationUrl, {
                openid_configuration: state.registrationToken.oidc_configuration_url,
                registration_token: state.registrationToken.token,
              })}
              style={{
                width: '100%',
                height: '100%',
                border: '0',
                display: 'block',
              }}
              title={I18n.t('Register App')}
              data-testid="dynamic-reg-wizard-iframe"
            />
          </RegistrationModalBody>
          <Modal.Footer>
            <Button color="secondary" type="submit" onClick={props.unregister}>
              {I18n.t('Cancel')}
            </Button>
            <Button margin="small" color="primary" type="submit" disabled={true}>
              {I18n.t('Next')}
            </Button>
          </Modal.Footer>
        </>
      )
    case 'LoadingRegistration':
      return (
        <>
          {progressBar(state)}
          <RegistrationModalBody>
            <Flex
              justifyItems="center"
              alignItems="center"
              height="100%"
              data-testid="dynamic-reg-modal-loading-registration"
            >
              <Flex.Item>
                <Spinner renderTitle={I18n.t('Loading')} />
              </Flex.Item>
              <Flex.Item>{I18n.t('Loading Registration')}</Flex.Item>
            </Flex>
          </RegistrationModalBody>
        </>
      )
    case 'PermissionConfirmation':
      return (
        <>
          {progressBar(state)}
          <RegistrationModalBody>
            <PermissionConfirmationWrapper
              registration={state.registration}
              overlayStore={state.overlayStore}
            />
          </RegistrationModalBody>
          <Modal.Footer>
            <Button
              margin="small"
              color="secondary"
              type="submit"
              disabled={false}
              onClick={async () => {
                props.unregister()
                if (!props.registrationId) {
                  const result = await dynamicRegistrationWizardState.deleteKey(
                    state._type,
                    state.registration.developer_key_id
                  )
                  if (isUnsuccessful(result)) {
                    showFlashAlert({
                      message: I18n.t(
                        'Something went wrong deleting the registration. The registration can still be deleted manually on the Manage page.'
                      ),
                      type: 'error',
                    })
                  }
                }
              }}
            >
              {I18n.t('Cancel')}
            </Button>
            <Button
              margin="small"
              color="primary"
              type="submit"
              onClick={() => {
                if (state.reviewing) {
                  dynamicRegistrationWizardState.transitionToConfirmationState(
                    state._type,
                    'Reviewing'
                  )
                } else {
                  dynamicRegistrationWizardState.transitionToConfirmationState(
                    state._type,
                    'PrivacyLevelConfirmation'
                  )
                }
              }}
            >
              {state.reviewing ? I18n.t('Back to Review') : I18n.t('Next')}
            </Button>
          </Modal.Footer>
        </>
      )
    case 'PrivacyLevelConfirmation':
      return (
        <>
          {progressBar(state)}
          <RegistrationModalBody>
            <PrivacyConfirmationWrapper
              overlayStore={state.overlayStore}
              toolName={state.registration.client_name}
            />
          </RegistrationModalBody>
          <Modal.Footer>
            <Button
              margin="small"
              color="secondary"
              type="submit"
              onClick={() => {
                dynamicRegistrationWizardState.transitionToConfirmationState(
                  state._type,
                  'PermissionConfirmation',
                  false
                )
              }}
            >
              {I18n.t('Previous')}
            </Button>
            <Button
              margin="small"
              color="primary"
              type="submit"
              onClick={() => {
                if (state.reviewing) {
                  dynamicRegistrationWizardState.transitionToConfirmationState(
                    state._type,
                    'Reviewing'
                  )
                } else {
                  dynamicRegistrationWizardState.transitionToConfirmationState(
                    state._type,
                    'PlacementsConfirmation'
                  )
                }
              }}
            >
              {state.reviewing ? I18n.t('Back to Review') : I18n.t('Next')}
            </Button>
          </Modal.Footer>
        </>
      )
    case 'PlacementsConfirmation':
      return (
        <>
          {progressBar(state)}
          <RegistrationModalBody>
            <PlacementsConfirmationWrapper
              registration={state.registration}
              overlayStore={state.overlayStore}
            />
          </RegistrationModalBody>
          <Modal.Footer>
            <Button
              margin="small"
              color="secondary"
              type="submit"
              onClick={() => {
                dynamicRegistrationWizardState.transitionToConfirmationState(
                  state._type,
                  'PrivacyLevelConfirmation',
                  false
                )
              }}
            >
              {I18n.t('Previous')}
            </Button>
            <Button
              margin="small"
              color="primary"
              type="submit"
              onClick={() => {
                if (state.reviewing) {
                  dynamicRegistrationWizardState.transitionToConfirmationState(
                    state._type,
                    'Reviewing'
                  )
                } else {
                  dynamicRegistrationWizardState.transitionToConfirmationState(
                    state._type,
                    'NamingConfirmation'
                  )
                }
              }}
            >
              {state.reviewing ? I18n.t('Back to Review') : I18n.t('Next')}
            </Button>
          </Modal.Footer>
        </>
      )
    case 'NamingConfirmation':
      return (
        <>
          {progressBar(state)}
          <RegistrationModalBody>
            <NamingConfirmationWrapper
              registration={state.registration}
              overlayStore={state.overlayStore}
            />
          </RegistrationModalBody>
          <Modal.Footer>
            <Button
              margin="small"
              color="secondary"
              type="submit"
              onClick={() => {
                dynamicRegistrationWizardState.transitionToConfirmationState(
                  state._type,
                  'PlacementsConfirmation',
                  false
                )
              }}
            >
              {I18n.t('Previous')}
            </Button>
            <Button
              margin="small"
              color="primary"
              type="submit"
              onClick={() => {
                if (state.reviewing) {
                  dynamicRegistrationWizardState.transitionToConfirmationState(
                    state._type,
                    'Reviewing'
                  )
                } else {
                  dynamicRegistrationWizardState.transitionToConfirmationState(
                    state._type,
                    'IconConfirmation'
                  )
                }
              }}
            >
              {state.reviewing ? I18n.t('Back to Review') : I18n.t('Next')}
            </Button>
          </Modal.Footer>
        </>
      )
    case 'IconConfirmation':
      return (
        <>
          {progressBar(state)}
          <IconConfirmationWrapper
            overlayStore={state.overlayStore}
            registration={state.registration}
            reviewing={state.reviewing}
            transitionToConfirmationState={
              dynamicRegistrationWizardState.transitionToConfirmationState
            }
            transitionToReviewingState={dynamicRegistrationWizardState.transitionToReviewingState}
          />
        </>
      )
    case 'Reviewing':
      return (
        <>
          {progressBar(state)}
          <ReviewScreenWrapper
            overlayStore={state.overlayStore}
            registration={state.registration}
            transitionToConfirmationState={
              dynamicRegistrationWizardState.transitionToConfirmationState
            }
          />
          <Modal.Footer>
            <Button
              color="secondary"
              type="submit"
              onClick={() => {
                dynamicRegistrationWizardState.transitionToConfirmationState(
                  state._type,
                  'IconConfirmation',
                  false
                )
              }}
            >
              {I18n.t('Previous')}
            </Button>
            <Button
              margin="small"
              color="primary"
              type="submit"
              onClick={() => {
                if (registrationId) {
                  dynamicRegistrationWizardState.updateAndClose(
                    accountId,
                    state.registration.id,
                    state.registration.lti_registration_id,
                    state.overlayStore.getState().state.registration,
                    state.overlayStore.getState().state.adminNickname ??
                      state.registration.client_name,
                    props.onSuccessfulRegistration
                  )
                } else {
                  dynamicRegistrationWizardState.enableAndClose(
                    accountId,
                    state.registration.id,
                    state.registration.lti_registration_id,
                    state.registration.developer_key_id,
                    state.overlayStore.getState().state.registration,
                    state.overlayStore.getState().state.adminNickname ??
                      state.registration.client_name,
                    props.onSuccessfulRegistration
                  )
                }
              }}
            >
              {registrationId ? I18n.t('Update App') : I18n.t('Install App')}
            </Button>
          </Modal.Footer>
        </>
      )
    case 'DeletingDevKey':
      return (
        <RegistrationModalBody>
          <Flex justifyItems="center" alignItems="center" height="100%">
            <Flex.Item>
              <Spinner renderTitle={I18n.t('Deleting App')} />
            </Flex.Item>
            <Flex.Item>{I18n.t('Deleting App')}</Flex.Item>
          </Flex>
        </RegistrationModalBody>
      )
    case 'Enabling':
      return (
        <>
          {progressBar(state)}
          <RegistrationModalBody>
            <Flex justifyItems="center" alignItems="center" height="100%">
              <Flex.Item>
                <Spinner renderTitle={I18n.t('Enabling App')} />
              </Flex.Item>
              <Flex.Item>{I18n.t('Enabling App')}</Flex.Item>
            </Flex>
          </RegistrationModalBody>
        </>
      )
    case 'Updating':
      return (
        <>
          {progressBar(state)}
          <RegistrationModalBody>
            <Flex justifyItems="center" alignItems="center" height="100%">
              <Flex.Item>
                <Spinner renderTitle={I18n.t('Updating App')} />
              </Flex.Item>
              <Flex.Item>{I18n.t('Updating App')}</Flex.Item>
            </Flex>
          </RegistrationModalBody>
        </>
      )
    case 'Error':
      return (
        <RegistrationModalBody>
          <GenericErrorPage
            imageUrl={errorShipUrl}
            errorSubject={I18n.t('Dynamic Registration error')}
            errorCategory="Dynamic Registration"
            errorMessage={state.message}
          />
        </RegistrationModalBody>
      )
  }
}

const addParams = (url: string, params: Record<string, string>) => {
  const u = new URL(url)
  Object.entries(params).forEach(([key, value]) => {
    u.searchParams.set(key, value)
  })
  return u.toString()
}

const TotalProgressLevels = 7

const ProgressLevels: Record<DynamicRegistrationWizardState['_type'], number> = {
  RequestingToken: 0,
  WaitingForTool: 1,
  LoadingRegistration: 1,
  PermissionConfirmation: 2,
  PrivacyLevelConfirmation: 3,
  PlacementsConfirmation: 4,
  NamingConfirmation: 5,
  IconConfirmation: 6,
  Reviewing: 7,
  Updating: 7,
  Enabling: 7,
  DeletingDevKey: 7,
  Error: 0,
}

const progressBar = (state: DynamicRegistrationWizardState) => (
  <ProgressBar
    meterColor="info"
    shouldAnimate={true}
    size="x-small"
    frameBorder="none"
    screenReaderLabel={I18n.t('Installation Progress')}
    valueNow={ProgressLevels[state._type]}
    valueMax={TotalProgressLevels}
    themeOverride={{
      trackBottomBorderWidth: '0',
    }}
    margin="0"
  />
)
