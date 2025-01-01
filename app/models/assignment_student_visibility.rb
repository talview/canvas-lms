# frozen_string_literal: true

#
# Copyright (C) 2014 - present Instructure, Inc.
#
# This file is part of Canvas.
#
# Canvas is free software: you can redistribute it and/or modify it under
# the terms of the GNU Affero General Public License as published by the Free
# Software Foundation, version 3 of the License.
#
# Canvas is distributed in the hope that it will be useful, but WITHOUT ANY
# WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR
# A PARTICULAR PURPOSE. See the GNU Affero General Public License for more
# details.
#
# You should have received a copy of the GNU Affero General Public License along
# with this program. If not, see <http://www.gnu.org/licenses/>.

class AssignmentStudentVisibility < ActiveRecord::Base
  include VisibilityPluckingHelper

  belongs_to :user
  belongs_to :assignment, inverse_of: :assignment_student_visibilities, class_name: "AbstractAssignment"
  belongs_to :course

  # create_or_update checks for !readonly? before persisting
  def readonly?
    true
  end

  def self.where_with_guard(*)
    if Account.site_admin.feature_enabled?(:selective_release_backend)
      raise StandardError, "AssignmentStudentVisibility view should not be used when selective_release_backend site admin flag is on.  Use AssignmentVisibilityService instead"
    end

    where_without_guard(*)
  end

  class << self
    alias_method :where_without_guard, :where
    alias_method :where, :where_with_guard
  end

  def self.visible_assignment_ids_in_course_by_user(opts)
    if Account.site_admin.feature_enabled?(:selective_release_backend)
      raise StandardError, "AssignmentStudentVisibility view should not be used when selective_release_backend site admin flag is on.  Use AssignmentVisibilityService instead"
    end

    visible_object_ids_in_course_by_user(:assignment_id, opts)
  end

  def self.assignments_with_user_visibilities(course, assignments)
    if Account.site_admin.feature_enabled?(:selective_release_backend)
      raise StandardError, "AssignmentStudentVisibility view should not be used when selective_release_backend site admin flag is on.  Use AssignmentVisibilityService instead"
    end

    only_visible_to_overrides, visible_to_everyone = assignments.partition(&:only_visible_to_overrides)
    assignment_visibilities = {}

    if only_visible_to_overrides.any?
      options = { course_id: course.id, assignment_id: only_visible_to_overrides.map(&:id) }
      assignment_visibilities.merge!(users_with_visibility_by_assignment(options))
    end

    if visible_to_everyone.any?
      assignment_visibilities.merge!(visible_to_everyone.map(&:id).index_with { [] })
    end
    assignment_visibilities
  end

  def self.users_with_visibility_by_assignment(opts)
    if Account.site_admin.feature_enabled?(:selective_release_backend)
      raise StandardError, "AssignmentStudentVisibility view should not be used when selective_release_backend site admin flag is on.  Use AssignmentVisibilityService instead"
    end

    users_with_visibility_by_object_id(:assignment_id, opts)
  end

  def self.visible_assignment_ids_for_user(user_id, course_ids = nil)
    if Account.site_admin.feature_enabled?(:selective_release_backend)
      raise StandardError, "AssignmentStudentVisibility view should not be used when selective_release_backend site admin flag is on.  Use AssignmentVisibilityService instead"
    end

    opts = { user_id: }
    if course_ids
      opts[:course_id] = course_ids
    end
    where(opts).pluck(:assignment_id)
  end

  # readonly? is not checked in destroy though
  before_destroy { raise ActiveRecord::ReadOnlyRecord }
end
