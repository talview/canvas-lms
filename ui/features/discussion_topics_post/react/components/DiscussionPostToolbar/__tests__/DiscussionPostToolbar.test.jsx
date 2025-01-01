/*
 * Copyright (C) 2021 - present Instructure, Inc.
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

import {MockedProvider} from '@apollo/client/testing'
import {AlertManagerContext} from '@canvas/alerts/react/AlertManager'
import {assignLocation, openWindow} from '@canvas/util/globalUtils'
import {waitFor} from '@testing-library/dom'
import {fireEvent, render} from '@testing-library/react'
import React from 'react'
import {ChildTopic} from '../../../../graphql/ChildTopic'
import {updateUserDiscussionsSplitscreenViewMock} from '../../../../graphql/Mocks'
import * as constants from '../../../utils/constants'
import {DiscussionManagerUtilityContext} from '../../../utils/constants'
import {DiscussionPostToolbar} from '../DiscussionPostToolbar'

jest.mock('@canvas/util/globalUtils', () => ({
  assignLocation: jest.fn(),
  openWindow: jest.fn(),
}))

jest.mock('../../../utils', () => ({
  ...jest.requireActual('../../../utils'),
  responsiveQuerySizes: () => ({desktop: {maxWidth: '1024px'}}),
}))

jest.mock('../../../utils/constants')

const onFailureStub = jest.fn()
const onSuccessStub = jest.fn()

beforeEach(() => {
  window.matchMedia = jest.fn().mockImplementation(() => {
    return {
      matches: true,
      media: '',
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    }
  })

  window.ENV = {
    course_id: '1',
    SPEEDGRADER_URL_TEMPLATE: '/courses/1/gradebook/speed_grader?assignment_id=1&:student_id',
    DISCUSSION: {
      preferences: {
        discussions_splitscreen_view: false,
      },
    },
  }
})

afterEach(() => {
  onFailureStub.mockClear()
  onSuccessStub.mockClear()
  jest.clearAllMocks()
})

const setup = (props, mocks) => {
  return render(
    <MockedProvider mocks={mocks}>
      <AlertManagerContext.Provider
        value={{setOnFailure: onFailureStub, setOnSuccess: onSuccessStub}}
      >
        <DiscussionManagerUtilityContext.Provider value={{translationLanguages: {current: []}}}>
          <DiscussionPostToolbar {...props} />
        </DiscussionManagerUtilityContext.Provider>
      </AlertManagerContext.Provider>
    </MockedProvider>,
  )
}

describe('DiscussionPostToolbar', () => {
  describe('Rendering', () => {
    it('should render', () => {
      const component = setup()
      expect(component).toBeTruthy()
    })

    it('should not render Collapse Toggle by default', () => {
      const {queryByTestId} = setup()
      expect(queryByTestId('collapseToggle')).toBeNull()
    })

    it('should not render clear search button by default', () => {
      const {queryByTestId} = setup()
      expect(queryByTestId('clear-search-button')).toBeNull()
    })
  })

  describe('Splitscreen Button', () => {
    it('should call updateUserDiscussionsSplitscreenView mutation when clicked', async () => {
      const {getByTestId} = setup(
        {
          setUserSplitScreenPreference: jest.fn(),
          userSplitScreenPreference: false,
          closeView: jest.fn(),
        },
        updateUserDiscussionsSplitscreenViewMock({discussionsSplitscreenView: true}),
      )

      const splitscreenButton = getByTestId('splitscreenButton')
      fireEvent.click(splitscreenButton)

      await waitFor(() => {
        expect(onSuccessStub.mock.calls.length).toBe(1)
      })
    })
  })

  describe('Search Field', () => {
    it('should call onChange when typing occurs', () => {
      const onSearchChangeMock = jest.fn()
      const {getByLabelText} = setup({onSearchChange: onSearchChangeMock})
      const searchInput = getByLabelText('Search entries or author...')
      fireEvent.change(searchInput, {target: {value: 'A'}})
      window.setTimeout(() => expect(onSearchChangeMock.mock.calls.length).toBe(1), 1500)
      fireEvent.change(searchInput, {target: {value: 'B'}})
      window.setTimeout(() => expect(onSearchChangeMock.mock.calls.length).toBe(2), 1500)
    })
  })

  describe('View Dropdown', () => {
    it('should call onChange when event is fired', () => {
      const onViewFilterMock = jest.fn()
      const {getByText, getByLabelText} = setup({onViewFilter: onViewFilterMock})
      const simpleSelect = getByLabelText('Filter by')
      fireEvent.click(simpleSelect)
      const unread = getByText('Unread')
      fireEvent.click(unread)
      expect(onViewFilterMock.mock.calls.length).toBe(1)
      expect(onViewFilterMock.mock.calls[0][1].id).toBe('unread')
    })
  })

  describe('Sort control', () => {
    it('should show up arrow when ascending', () => {
      const {getByTestId} = setup({
        sortDirection: 'asc',
      })
      const upArrow = getByTestId('UpArrow')
      expect(upArrow).toBeTruthy()
    })

    it('should show down arrow when descending', () => {
      const {getByTestId} = setup({
        sortDirection: 'desc',
      })
      const downArrow = getByTestId('DownArrow')
      expect(downArrow).toBeTruthy()
    })

    it('should call onClick when clicked', () => {
      const onSortClickMock = jest.fn()
      const {getByTestId} = setup({
        onSortClick: onSortClickMock,
      })
      const button = getByTestId('sortButton')
      button.click()
      expect(onSortClickMock.mock.calls.length).toBe(1)
    })
  })

  describe('Groups Menu Button', () => {
    it('should not render when there are no child topics and the user is an admin', () => {
      const container = setup({
        childTopics: [],
        isAdmin: true,
      })
      expect(container.queryByTestId('groups-menu-button')).toBeNull()
    })

    it('should render when there are child topics and the user is an admin', () => {
      const container = setup({
        childTopics: [ChildTopic.mock()],
        isAdmin: true,
      })
      expect(container.queryByTestId('groups-menu-button')).toBeTruthy()
    })

    it('should not render when the user is not an admin', () => {
      const container = setup({
        childTopics: [ChildTopic.mock()],
        isAdmin: false,
      })
      expect(container.queryByTestId('groups-menu-button')).toBeNull()
    })
  })

  describe('Anonymous Indicator Avatar', () => {
    describe('discussion is anonymous', () => {
      it('should render discussionAnonymousState is not null', () => {
        ENV.current_user_roles = ['student']
        const container = setup({
          discussionAnonymousState: 'full_anonymity',
        })
        expect(container.queryByTestId('anonymous_avatar')).toBeTruthy()
      })
    })

    describe('discussion is not anonymous', () => {
      it('should render discussionAnonymousState is null', () => {
        ENV.current_user_roles = ['student']
        const container = setup({
          discussionAnonymousState: null,
        })
        expect(container.queryByTestId('anonymous_avatar')).toBeNull()
      })
    })
  })

  describe('Assign To', () => {
    beforeEach(() => {
      ENV.FEATURES = {
        selective_release_ui_api: true,
      }
    })

    it('renders the Assign To button if user can manageAssignTo and in a course discussion', () => {
      const {getByRole} = setup({
        manageAssignTo: true,
        showAssignTo: true,
      })
      expect(getByRole('button', {name: 'Assign To'})).toBeInTheDocument()
    })

    it('does not render the Assign To button if in speedGrader', () => {
      constants.isSpeedGraderInTopUrl = jest.fn().mockReturnValue(true)

      const container = setup({
        manageAssignTo: true,
        discussionTopic: {
          _id: '1',
          contextType: 'Course',
          groupSet: null,
          assignment: true,
        },
      })
      expect(container.queryByTestId('assign-to-button')).toBeNull()
    })

    it('does not render the Assign To button if user can not manageAssignTo', () => {
      const {queryByRole} = setup({
        manageAssignTo: false,
        contextType: 'Course',
      })
      expect(queryByRole('button', {name: 'Assign To'})).not.toBeInTheDocument()
    })

    it('does not render the Assign To button if a group discussion', () => {
      const {queryByText} = setup({
        manageAssignTo: true,
        contextType: 'Group',
      })
      expect(queryByText('Assign To')).not.toBeInTheDocument()
    })

    it('does not render the Assign To button if an ungraded group discussion in course context', () => {
      const {queryByTestId} = setup({
        manageAssignTo: true,
        contextType: 'Course',
        isGraded: false,
        isGroupDiscussion: true,
      })
      expect(queryByTestId('manage-assign-to')).not.toBeInTheDocument()
    })
  })

  describe('Discussion Summary', () => {
    it('should render the discussion summary button if user can summarize and summary is not enabled', () => {
      ENV.user_can_summarize = true
      const {queryByTestId} = setup({isSummaryEnabled: false})

      expect(queryByTestId('summarize-button')).toBeTruthy()
    })

    it('should not render the discussion summary button if summary is enabled', () => {
      ENV.user_can_summarize = true
      const {queryByTestId} = setup({isSummaryEnabled: true})

      expect(queryByTestId('summarize-button')).toBeNull()
    })

    it('should not render the discussion summary button if user can not summarize', () => {
      ENV.user_can_summarize = false
      const {queryByTestId} = setup({isSummaryEnabled: false})

      expect(queryByTestId('summarize-button')).toBeNull()
    })
  })
})
