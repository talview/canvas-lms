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
import userEvent from '@testing-library/user-event'
import {ConfiguredDateInput} from '../ConfiguredDateInput'
import moment from 'moment-timezone'
import tzInTest from '@instructure/moment-utils/specHelpers'
import {getI18nFormats} from '@canvas/datetime/configureDateTime'
// @ts-ignore
import tz from 'timezone'
// @ts-ignore
import chicago from 'timezone/America/Chicago'
// @ts-ignore
import detroit from 'timezone/America/Detroit'

describe('ConfiguredDateInput', () => {
  const placeholder = 'Select a date (optional)'
  const renderLabelText = 'Start date'
  const renderScreenReaderLabelText = 'Select a new beginning date'
  const currentYear = new Date().getFullYear()

  beforeEach(() => {
    // Set timezone for both moment and ENV
    const timezone = 'America/Denver'
    moment.tz.setDefault(timezone)
    window.ENV = window.ENV || {}
    window.ENV.TIMEZONE = timezone

    // Mock the current date to be January 1st of the current year at noon
    jest.useFakeTimers()
    jest.setSystemTime(new Date(`${currentYear}-01-01T12:00:00.000Z`))
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('renders correctly with initial date', () => {
    const {getByPlaceholderText, getByText} = render(
      <ConfiguredDateInput
        selectedDate={`${currentYear}-01-01T00:00:00.000Z`}
        onSelectedDateChange={() => {}}
        placeholder={placeholder}
        renderLabelText={renderLabelText}
        renderScreenReaderLabelText={renderScreenReaderLabelText}
      />,
    )
    const input = getByPlaceholderText(placeholder) as HTMLInputElement
    expect(input).toBeInTheDocument()
    expect(input.value).toBe('Jan 1 at 12am')
    expect(getByText(renderLabelText)).toBeInTheDocument()
    expect(getByText(renderScreenReaderLabelText)).toBeInTheDocument()
  })

  it('calls onSelectedDateChange when a date is selected', async () => {
    const user = userEvent.setup({
      advanceTimers: jest.advanceTimersByTime,
    })
    const handleDateChange = jest.fn()
    const {getByPlaceholderText, getByText} = render(
      <ConfiguredDateInput
        selectedDate={`${currentYear}-01-05T00:00:00.000Z`}
        onSelectedDateChange={handleDateChange}
        placeholder={placeholder}
        renderLabelText={renderLabelText}
        renderScreenReaderLabelText={renderScreenReaderLabelText}
      />,
    )

    const input = getByPlaceholderText(placeholder) as HTMLInputElement
    await user.click(input)
    const jan15Button = getByText('15').closest('button')
    if (!jan15Button) {
      throw new Error('Could not find date button for jan 15')
    }
    await user.click(jan15Button)

    // When clicking Jan 15 in the date picker, we get midnight in Denver (07:00 UTC)
    const expectedDate = new Date(`${currentYear}-01-15T07:00:00.000Z`)
    expect(handleDateChange).toHaveBeenCalledWith(expectedDate, 'pick')
  })

  it('renders with disabled', () => {
    const {getByDisplayValue} = render(
      <ConfiguredDateInput
        selectedDate={`${currentYear}-01-01T00:00:00.000Z`}
        onSelectedDateChange={() => {}}
        placeholder={placeholder}
        renderLabelText={renderLabelText}
        renderScreenReaderLabelText={renderScreenReaderLabelText}
        disabled={true}
      />,
    )
    expect(getByDisplayValue('Jan 1 at 12am')).toBeDisabled()
  })

  it('renders error message', () => {
    const errorMessage = 'This is an error message'

    const {getByText} = render(
      <ConfiguredDateInput
        selectedDate={`${currentYear}-01-01T00:00:00.000Z`}
        onSelectedDateChange={() => {}}
        placeholder={placeholder}
        renderLabelText={renderLabelText}
        renderScreenReaderLabelText={renderScreenReaderLabelText}
        errorMessage={errorMessage}
      />,
    )
    expect(getByText(errorMessage)).toBeInTheDocument()
  })

  describe('course and user timezone', () => {
    beforeEach(() => {
      const timezone = 'America/Denver'
      moment.tz.setDefault(timezone)
      window.ENV = window.ENV || {}
      window.ENV.TIMEZONE = timezone

      tzInTest.configureAndRestoreLater({
        tz: tz(detroit, 'America/Detroit', chicago, 'America/Chicago'),
        tzData: {
          'America/Detroit': detroit,
          'America/Chicago': chicago,
        },
        formats: getI18nFormats(),
      })
    })
    const courseTimeZone = 'America/Detroit'
    const userTimeZone = 'America/Chicago'
    const expectedCourseDateString = 'Local: Feb 2 at 6pm'
    const expectedUserDateString = 'Course: Feb 2 at 7pm'

    it('renders time zone data on different timezones', () => {
      const {getByText} = render(
        <ConfiguredDateInput
          selectedDate={`${currentYear}-02-03T00:00:00.000Z`}
          onSelectedDateChange={() => {}}
          placeholder={placeholder}
          renderLabelText={renderLabelText}
          renderScreenReaderLabelText={renderScreenReaderLabelText}
          courseTimeZone={courseTimeZone}
          userTimeZone={userTimeZone}
        />,
      )
      expect(getByText(expectedCourseDateString)).toBeInTheDocument()
      expect(getByText(expectedUserDateString)).toBeInTheDocument()
    })

    it('not renders time zone data on same timezones', () => {
      const {queryByText} = render(
        <ConfiguredDateInput
          selectedDate={`${currentYear}-02-03T00:00:00.000Z`}
          onSelectedDateChange={() => {}}
          placeholder={placeholder}
          renderLabelText={renderLabelText}
          renderScreenReaderLabelText={renderScreenReaderLabelText}
          courseTimeZone={courseTimeZone}
          userTimeZone={courseTimeZone}
        />,
      )
      expect(queryByText(expectedCourseDateString)).toBeNull()
      expect(queryByText(expectedUserDateString)).toBeNull()
    })

    it('not renders time zone data on missing timezones', () => {
      const {queryByText} = render(
        <ConfiguredDateInput
          selectedDate={`${currentYear}-02-03T00:00:00.000Z`}
          onSelectedDateChange={() => {}}
          placeholder={placeholder}
          renderLabelText={renderLabelText}
          renderScreenReaderLabelText={renderScreenReaderLabelText}
        />,
      )
      expect(queryByText(expectedCourseDateString)).toBeNull()
      expect(queryByText(expectedUserDateString)).toBeNull()
    })
  })
})
