# frozen_string_literal: true

#
# Copyright (C) 2015 - present Instructure, Inc.
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

module Login::Shared
  def reset_session_for_login
    reset_session_saving_keys(:return_to,
                              :oauth,
                              :oauth2,
                              :confirm,
                              :enrollment,
                              :expected_user_id,
                              :masquerade_return_to,
                              :oauth2_nonce)
  end

  def redirect_to_unknown_user_url(message)
    unknown_user_url = @domain_root_account.unknown_user_url.presence
    if unknown_user_url
      unknown_user_url += (URI.parse(unknown_user_url).query ? "&" : "?")
      unknown_user_url << "message=#{URI::DEFAULT_PARSER.escape(message)}"
    else
      flash[:delegated_message] = message
    end
    redirect_to unknown_user_url || login_url
  end

  def successful_login(user, pseudonym, otp_passed = false)
    reset_authenticity_token!
    Auditors::Authentication.record(pseudonym, "login")

    auth_provider = pseudonym&.authentication_provider
    increment_statsd(:success, authentication_provider: pseudonym&.authentication_provider)

    # Since the user just logged in, we'll reset the context to include their info.
    setup_live_events_context
    # TODO: Only send this if the current_pseudonym's root account matches the current root
    # account?
    Canvas::LiveEvents.logged_in(session, user, pseudonym)

    otp_passed ||= user.validate_otp_secret_key_remember_me_cookie(cookies["canvas_otp_remember_me"], request.remote_ip)
    unless otp_passed || auth_provider.skip_internal_mfa
      mfa_settings = user.mfa_settings(pseudonym_hint: @current_pseudonym)
      if (mfa_settings == :optional && (user.otp_secret_key || auth_provider.mfa_required)) || mfa_settings == :required
        session[:pending_otp] = true
        respond_to do |format|
          format.html { redirect_to otp_login_url }
          format.json { render json: { otp_required: true }, status: :ok }
        end
        return
      end
    end

    # ensure the next page rendered includes an instfs pixel to log them in
    # there
    session.delete(:shown_instfs_pixel)

    if pseudonym.account_id != @domain_root_account.id
      # they have no reason to be at this account; send them to where they belong
      if (session[:return_to].blank? || session[:return_to] == "/") &&
         session[:oauth2].blank? &&
         @domain_root_account.user_account_associations.where(user_id: pseudonym.user_id).none? &&
         !@domain_root_account.grants_right?(user, :read)
        return redirect_to dashboard_url(host: HostUrl.context_host(pseudonym.account, request.host_with_port), cross_domain_login: request.host_with_port)
      end

      flash[:notice] = t("You are logged in at %{institution1} using your credentials from %{institution2}",
                         institution1: @domain_root_account.name,
                         institution2: pseudonym.account.name)
    end

    if pseudonym.account_id == Account.site_admin.id && Account.site_admin.delegated_authentication?
      cookies["canvas_sa_delegated"] = {
        value: "1",
        domain: remember_me_cookie_domain,
        httponly: true,
        secure: CanvasRails::Application.config.session_options[:secure]
      }
    end
    session[:require_terms] = true if @domain_root_account.require_acceptance_of_terms?(user)
    @current_user = user
    @current_pseudonym = pseudonym

    respond_to do |format|
      if (oauth = session[:oauth2])
        # redirect to external OAuth provider
        provider = Canvas::OAuth::Provider.new(oauth[:client_id], oauth[:redirect_uri], oauth[:scopes], oauth[:purpose])
        return redirect_to Canvas::OAuth::Provider.confirmation_redirect(self, provider, user)

      elsif session[:course_uuid] && user && (course = Course.where(uuid: session[:course_uuid], workflow_state: "created").first)
        # redirect to course if session includes valid course UUID
        claim_session_course(course, user)
        redirect_target = course_url(course, login_success: "1")
        format.html { redirect_to redirect_target }

      elsif session[:confirm]
        # redirect to registration confirmation
        redirect_target = registration_confirmation_path(session.delete(:confirm),
                                                         enrollment: session.delete(:enrollment),
                                                         login_success: 1,
                                                         confirm: ((user.id == session.delete(:expected_user_id)) ? 1 : nil))
        format.html { redirect_to redirect_target }

      else
        # the URL to redirect back to is stored in the session, so it's
        # assumed that if that URL is found rather than using the default,
        # they must have cookies enabled and we don't need to worry about
        # adding the :login_success param to it.
        redirect_target = delegated_auth_redirect_uri(redirect_back_or_default(dashboard_url(login_success: "1")))
        format.html { redirect_to redirect_target }
      end

      format.json { render json: pseudonym.as_json(methods: :user_code).merge(location: redirect_target), status: :ok }
    end
  end

  def logout_current_user
    reset_authenticity_token!
    Auditors::Authentication.record(@current_pseudonym, "logout")
    Canvas::LiveEvents.logged_out
    Lti::LogoutService.queue_callbacks(@current_pseudonym)
    super
  end

  def forbid_on_files_domain
    if HostUrl.is_file_host?(request.host_with_port)
      reset_session
      return redirect_to dashboard_url(host: HostUrl.default_host)
    end
    true
  end

  include PseudonymSessionsController
  def remember_me_cookie_domain
    otp_remember_me_cookie_domain
  end

  def delegated_auth_redirect_uri(uri)
    uri
  end

  def need_email_verification?(unique_ids, auth_provider)
    old_login_attribute = auth_provider.settings["old_login_attribute"]
    if old_login_attribute.present? &&
       auth_provider.login_attribute != old_login_attribute &&
       unique_ids.is_a?(Hash) &&
       unique_ids.key?(old_login_attribute) &&
       unique_ids.key?(auth_provider.login_attribute)
      pseudonym = @domain_root_account.pseudonyms.for_auth_configuration(unique_ids[old_login_attribute], auth_provider)
      if pseudonym
        pseudonym.begin_login_attribute_migration!(unique_ids)
        redirect_to login_email_verify_show_url(d: CanvasSecurity.create_jwt({ i: pseudonym.id, e: pseudonym.email }, 15.minutes.from_now))
        return true
      end
    end
    false
  end

  protected

  def increment_statsd(counter, tags: {}, action: nil, reason: nil, authentication_provider: nil)
    action ||= params[:action]
    authentication_provider ||= @aac
    auth_type = authentication_provider&.auth_type || self.auth_type
    tags ||= {}
    tags = tags.reverse_merge({ auth_type:, domain: request.host })
    tags[:auth_provider_id] = authentication_provider.global_id if authentication_provider
    tags[:reason] = reason if reason
    InstStatsd::Statsd.distributed_increment("auth.#{action}.#{counter}", tags:)
  end
end
