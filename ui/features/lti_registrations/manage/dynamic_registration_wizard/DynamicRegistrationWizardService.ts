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

import type {
  deleteDeveloperKey,
  updateAdminNickname,
  updateDeveloperKeyWorkflowState,
} from '../api/developerKey'
import type {
  fetchRegistrationToken,
  getLtiImsRegistrationById,
  getRegistrationByUUID,
  updateRegistrationOverlay,
} from '../api/ltiImsRegistration'

export interface DynamicRegistrationWizardService {
  fetchRegistrationToken: typeof fetchRegistrationToken
  getRegistrationByUUID: typeof getRegistrationByUUID
  getLtiImsRegistrationById: typeof getLtiImsRegistrationById
  updateRegistrationOverlay: typeof updateRegistrationOverlay
  updateDeveloperKeyWorkflowState: typeof updateDeveloperKeyWorkflowState
  updateAdminNickname: typeof updateAdminNickname
  deleteDeveloperKey: typeof deleteDeveloperKey
}
