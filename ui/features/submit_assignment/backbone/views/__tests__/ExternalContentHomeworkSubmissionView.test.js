/*
 * Copyright (C) 2018 - present Instructure, Inc.
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

import Backbone from '@canvas/backbone'
import sinon from 'sinon'
import ExternalContentHomeworkSubmissionView from '../ExternalContentHomeworkSubmissionView'

// mock windowAlert
jest.mock('@canvas/util/globalUtils', () => ({
  windowAlert: jest.fn(),
}))

const ok = x => expect(x).toBeTruthy()
const notOk = x => expect(x).toBeFalsy()

const container = document.createElement('div')
container.setAttribute('id', 'fixtures')
document.body.appendChild(container)

function newView() {
  const view = new ExternalContentHomeworkSubmissionView()
  view.externalTool = {}
  view.model = new Backbone.Model({})
  return view
}

describe('ExternalContentHomeworkSubmissionView#uploadFileFromUrl', () => {
  afterEach(() => {
    document.getElementById('fixtures').innerHTML = ''
  })

  test('Does submit the assignment if the EULA checkbox is not checked', () => {
    const view = newView()
    const submitSpy = sinon.spy()

    const input = document.createElement('input')
    input.type = 'checkbox'
    input.className = 'turnitin_pledge external-tool'
    input.checked = false

    document.getElementById('fixtures').appendChild(input)
    view.submitHomework = submitSpy
    view._triggerSubmit({preventDefault: () => {}, stopPropagation: () => {}})

    notOk(submitSpy.called)
  })

  test('Does submit the assignment if the EULA checkbox is checked', () => {
    const view = newView()
    const submitSpy = sinon.spy()

    const input = document.createElement('input')
    input.type = 'checkbox'
    input.className = 'turnitin_pledge external-tool'
    input.checked = true

    document.getElementById('fixtures').appendChild(input)
    view.submitHomework = submitSpy
    view._triggerSubmit({preventDefault: () => {}, stopPropagation: () => {}})

    ok(submitSpy.called)
  })

  test('Does submit the assignment if the EULA checkbox does not exist', () => {
    const view = newView()
    const submitSpy = sinon.spy()

    view.submitHomework = submitSpy
    view._triggerSubmit({preventDefault: () => {}, stopPropagation: () => {}})

    ok(submitSpy.called)
  })
})
