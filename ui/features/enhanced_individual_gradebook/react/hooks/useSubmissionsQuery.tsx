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

import {useMemo, useState} from 'react'
import {fetchSubmissions, getNextSubmissionsPage} from '../../queries/Queries'
import {useAllPages} from '@canvas/query'

export const useSubmissionsQuery = (courseId: string) => {
  const [queryKey] = useState(['individual-gradebook-submissions', courseId])

  const {data, hasNextPage, isError, isLoading} = useAllPages({
    queryKey,
    queryFn: fetchSubmissions,
    getNextPageParam: getNextSubmissionsPage,
    meta: {
      fetchAtLeastOnce: true,
    },
  })

  const submissions = useMemo(
    () => data?.pages.flatMap(page => page.course.submissionsConnection.nodes) ?? [],
    [data]
  )

  return {
    submissions,
    submissionsLoading: isLoading,
    submissionsSuccessful: !isError && !isLoading && !hasNextPage,
  }
}
