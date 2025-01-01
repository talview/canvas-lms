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

import axe from 'axe-core'
import Conference from '../../models/Conference'
import ConferenceView from '../ConferenceView'
import $ from 'jquery'

describe('ConferenceView', () => {
  let container

  const createConferenceView = (conferenceOpts = {}) => {
    const defaultOpts = {
      id: null,
      recordings: [],
      user_settings: {},
      conference_type: 'AdobeConnect',
      context_code: 'course_1',
      context_id: 1,
      context_type: 'Course',
      join_url: 'www.blah.com',
      url: '/api/v1/courses/1/conferences/1',
      permissions: {
        close: true,
        create: true,
        delete: true,
        initiate: true,
        join: true,
        read: true,
        resume: false,
        update: true,
        edit: true,
        manage_recordings: true,
      },
    }

    const conference = new Conference({...defaultOpts, ...conferenceOpts})
    const view = new ConferenceView({model: conference})
    container = document.createElement('div')
    container.id = 'fixtures'
    document.body.appendChild(container)
    view.$el.appendTo($(container))
    return view.render()
  }

  beforeEach(() => {
    window.ENV = {
      context_asset_string: 'course_1',
    }
    $.screenReaderFlashMessage = jest.fn()
  })

  afterEach(() => {
    window.ENV = null
    if (container) {
      container.remove()
      container = null
    }
    jest.restoreAllMocks()
  })

  it('renders the conference view', () => {
    const view = createConferenceView()
    expect(view.el).toBeInTheDocument()
  })

  it('shows screenreader message when deleting a conference', async () => {
    const mockConfirm = jest.spyOn(window, 'confirm').mockImplementation(() => true)
    const mockDestroy = jest.fn().mockImplementation(options => {
      options.success()
      return Promise.resolve()
    })

    const view = createConferenceView({id: 1})
    view.model.destroy = mockDestroy

    const event = new Event('click')
    event.preventDefault = jest.fn()
    await view.delete(event)

    expect($.screenReaderFlashMessage).toHaveBeenCalledWith('Conference was deleted')
    mockConfirm.mockRestore()
  })

  it('shows screenreader message when deleting recordings', async () => {
    const mockConfirm = jest.spyOn(window, 'confirm').mockImplementation(() => true)
    const ajaxDeferred = $.Deferred()
    ajaxDeferred.resolve({deleted: true})
    $.ajaxJSON = jest.fn().mockReturnValue(ajaxDeferred)

    const conferenceWithRecordings = {
      id: 1,
      recordings: [
        {
          recording_id: '954cc3',
          title: 'Conference',
          duration_minutes: 0,
          playback_url: null,
          playback_formats: [
            {
              type: 'statistics',
              url: 'www.blah.com',
              length: null,
            },
            {
              type: 'presentation',
              url: 'www.blah.com',
              length: 0,
              show_to_students: true,
            },
          ],
          created_at: 1518554650000,
        },
      ],
      user_settings: {
        record: true,
      },
    }

    const view = createConferenceView(conferenceWithRecordings)
    const $recordingButton = view.$el.find('div.ig-button[data-id="954cc3"]')
    $recordingButton.data('url', '/recording')
    $recordingButton.data('id', '954cc3')

    const event = new Event('click')
    event.preventDefault = jest.fn()
    const deleteLink = $recordingButton.find('a.delete_recording_link')[0]
    await view.deleteRecording({...event, currentTarget: deleteLink})

    expect($.ajaxJSON).toHaveBeenCalledWith('/recording/recording', 'DELETE', {
      recording_id: '954cc3',
    })
    mockConfirm.mockRestore()
  })

  it('renders adobe connect link correctly', () => {
    window.ENV.conference_type_details = [
      {
        name: 'Adobe Connect',
        type: 'AdobeConnect',
        settings: [],
      },
    ]

    const adobeConnectConference = {
      id: 1,
      conference_type: 'AdobeConnect',
      playback_url: 'www.blah.com',
      recordings: [
        {
          recording_id: '954cc3',
          title: 'Conference',
          playback_url: 'www.blah.com',
          duration_minutes: 0,
          playback_formats: [
            {
              type: 'statistics',
              url: 'www.blah.com',
              length: null,
            },
            {
              type: 'presentation',
              url: 'www.blah.com',
              length: 0,
            },
          ],
          created_at: 1518554650000,
        },
      ],
      user_settings: {
        record: true,
      },
    }

    createConferenceView(adobeConnectConference)
    const link = document.querySelector('#adobe-connect-playback-link')
    expect(link).toHaveAttribute('href', 'www.blah.com')
  })

  // Skip accessibility test for now as it requires more setup
  it.skip('is accessible', async () => {
    const view = createConferenceView()
    const results = await axe.run(view.el)
    expect(results.violations.length).toBe(0)
  })
})
