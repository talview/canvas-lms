/*
 * Copyright (C) 2017 - present Instructure, Inc.
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
import userEvent from '@testing-library/user-event'
import {Pill} from '@instructure/ui-pill'
import {Opportunity} from '../index'

function defaultProps(options = {}) {
  return {
    id: '1',
    dueAt: '2017-03-09T20:40:35Z',
    courseName: 'course about stuff',
    opportunityTitle: 'this is a description about the opportunity',
    points: 20,
    url: 'http://www.non_default_url.com',
    timeZone: 'America/Denver',
    dismiss: () => {},
    registerAnimatable: () => {},
    deregisterAnimatable: () => {},
    animatableIndex: 1,
    ...options,
  }
}

it('renders the base component correctly', () => {
  const wrapper = render(<Opportunity {...defaultProps()} />)
  expect(wrapper.container).toMatchSnapshot()
})

it('calls the onClick prop when dismissed is clicked', async () => {
  const tempProps = defaultProps()
  tempProps.dismiss = jest.fn()
  const wrapper = render(<Opportunity {...tempProps} />)
  const dismissButton = wrapper
    .getByText('Dismiss this is a description about the opportunity')
    .closest('button')
  await userEvent.click(dismissButton)
  expect(tempProps.dismiss).toHaveBeenCalled()
})

it('renders the base component correctly without points', () => {
  const tempProps = defaultProps()
  tempProps.points = null
  const wrapper = render(<Opportunity {...tempProps} />)
  expect(wrapper.container).toMatchSnapshot()
})

// to distinguish between no point and 0 points
it('renders the base component correctly with 0 points', () => {
  const props = defaultProps({points: 0})
  const wrapper = render(<Opportunity {...props} />)
  expect(wrapper.container).toMatchSnapshot()
})

it('renders a Pill if in the past', () => {
  const props = defaultProps()
  const wrapper = render(<Opportunity {...props} />)
  expect(wrapper.getAllByText('Missing')).toHaveLength(1)
})

it('registers itself as animatable', () => {
  const fakeRegister = jest.fn()
  const fakeDeregister = jest.fn()
  const ref = React.createRef()
  const wrapper = render(
    <Opportunity
      ref={ref}
      {...defaultProps()}
      id="1"
      registerAnimatable={fakeRegister}
      deregisterAnimatable={fakeDeregister}
      animatableIndex={42}
    />
  )
  expect(fakeRegister).toHaveBeenCalledWith('opportunity', ref.current, 42, ['1'])

  wrapper.rerender(
    <Opportunity
      ref={ref}
      {...defaultProps()}
      id="2"
      registerAnimatable={fakeRegister}
      deregisterAnimatable={fakeDeregister}
      animatableIndex={43}
    />
  )
  expect(fakeDeregister).toHaveBeenCalledWith('opportunity', ref.current, ['1'])
  expect(fakeRegister).toHaveBeenCalledWith('opportunity', ref.current, 43, ['2'])
  const instance = ref.current
  wrapper.unmount()
  expect(fakeDeregister).toHaveBeenCalledWith('opportunity', instance, ['2'])
})

it('renders a close icon', () => {
  const props = defaultProps()
  const wrapper = render(<Opportunity {...props} />)
  expect(wrapper.queryByText(`Dismiss ${props.opportunityTitle}`)).toBeInTheDocument()
})

it('renders no close icon if dismissed', () => {
  const props = defaultProps({plannerOverride: {dismissed: true}})
  const wrapper = render(<Opportunity {...props} />)
  expect(wrapper.queryByText(`Dismiss ${props.opportunityTitle}`)).toBeNull()
})

it('renders no close icon if user is observing a student', () => {
  const props = defaultProps({isObserving: true})
  const wrapper = render(<Opportunity {...props} />)
  expect(wrapper.queryByText(`Dismiss ${props.opportunityTitle}`)).toBeNull()
})
