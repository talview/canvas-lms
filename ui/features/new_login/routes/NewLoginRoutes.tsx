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

import React, {lazy} from 'react'
import RegistrationRoutesMiddleware from './RegistrationRoutesMiddleware'
import {LoginLayout} from '../layouts/LoginLayout'
import {NewLoginProvider} from '../context/NewLoginContext'
import {ROUTES} from './routes'
import {Route} from 'react-router-dom'

const SignIn = lazy(() => import('../pages/SignIn'))
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'))
const RegisterLanding = lazy(() => import('../pages/register/Landing'))
const RegisterStudent = lazy(() => import('../pages/register/Student'))
const RegisterParent = lazy(() => import('../pages/register/Parent'))
const RegisterTeacher = lazy(() => import('../pages/register/Teacher'))

export const NewLoginRoutes = (
  <Route
    path={ROUTES.SIGN_IN}
    element={
      <NewLoginProvider>
        <LoginLayout />
      </NewLoginProvider>
    }
  >
    <Route index={true} element={<SignIn />} />
    <Route path="forgot-password" element={<ForgotPassword />} />
    <Route path="register" element={<RegistrationRoutesMiddleware />}>
      <Route index={true} element={<RegisterLanding />} />
      <Route path="student" element={<RegisterStudent />} />
      <Route path="parent" element={<RegisterParent />} />
      <Route path="teacher" element={<RegisterTeacher />} />
    </Route>
    <Route path="*" element={<SignIn />} />
  </Route>
)
