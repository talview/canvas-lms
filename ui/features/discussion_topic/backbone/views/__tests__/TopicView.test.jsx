/*
 * Copyright (C) 2019 - present Instructure, Inc.
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

import TopicView from '../TopicView'
import Backbone from '@canvas/backbone'
import fakeENV from '@canvas/test-utils/fakeENV'
import DiscussionFilterState from '../../models/DiscussionFilterState'
import ReactDOM from 'react-dom'
import DirectShareUserModal from '@canvas/direct-sharing/react/components/DirectShareUserModal'
import DirectShareCourseTray from '@canvas/direct-sharing/react/components/DirectShareCourseTray'
import sinon from 'sinon'

const equal = (x, y) => expect(x).toEqual(y)
const deepEqual = (x, y) => expect(x).toEqual(y)

describe('TopicView', () => {
  beforeEach(() => {
    sinon.stub(ReactDOM, 'render')
    fakeENV.setup()
    ENV.DISCUSSION = {
      TOPIC: {
        ID: '42',
        IS_SUBSCRIBED: false,
        CAN_UNPUBLISH: false,
        IS_PUBLISHED: false,
        IS_ASSIGNMENT: false,
        ASSIGNMENT_ID: null,
        CAN_SUBSCRIBE: false,
        TITLE: 'discussion',
      },
      PERMISSIONS: {CAN_ATTACH: false, CAN_REPLY: false},
      ROOT_URL: 'foo',
      THREADED: false,
    }
    ENV.use_rce_enhancements = true
    ENV.COURSE_ID = '1'
  })

  afterEach(() => {
    fakeENV.teardown()
    // eslint-disable-next-line no-restricted-properties
    ReactDOM.render.restore()
  })

  // These tests cheat a bit by calling methods on the view directly. For now this was easier than
  // trying to get this old view to actually render.
  describe('Direct Share', () => {
    test('opens direct share send modal', () => {
      const view = new TopicView({
        model: new Backbone.Model(),
        filterModel: new DiscussionFilterState(),
      })
      view.$announcementCog = {focus() {}}

      view.openSendTo()
      // eslint-disable-next-line no-restricted-properties
      equal(ReactDOM.render.firstCall.args[0].type, DirectShareUserModal)
      // eslint-disable-next-line no-restricted-properties
      const {onDismiss, ...props} = ReactDOM.render.firstCall.args[0].props
      deepEqual(props, {
        open: true,
        sourceCourseId: '1',
        contentShare: {content_type: 'discussion_topic', content_id: '42'},
      })
      onDismiss()
      // eslint-disable-next-line no-restricted-properties
      equal(ReactDOM.render.secondCall.args[0].props.open, false)
    })

    test('opens direct share copy modal', () => {
      const view = new TopicView({
        model: new Backbone.Model(),
        filterModel: new DiscussionFilterState(),
      })
      view.$announcementCog = {focus() {}}

      view.openCopyTo()
      // eslint-disable-next-line no-restricted-properties
      equal(ReactDOM.render.firstCall.args[0].type, DirectShareCourseTray)
      // eslint-disable-next-line no-restricted-properties
      const {onDismiss, ...props} = ReactDOM.render.firstCall.args[0].props
      deepEqual(props, {
        open: true,
        sourceCourseId: '1',
        contentSelection: {discussion_topics: ['42']},
      })
      onDismiss()
      // eslint-disable-next-line no-restricted-properties
      equal(ReactDOM.render.secondCall.args[0].props.open, false)
    })
  })
})
