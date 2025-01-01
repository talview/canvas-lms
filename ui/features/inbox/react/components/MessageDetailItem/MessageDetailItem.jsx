/*
 * Copyright (C) 2020 - present Instructure, Inc.
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

import {Alert} from '@instructure/ui-alerts'
import {Avatar} from '@instructure/ui-avatar'
import DateHelper from '@canvas/datetime/dateHelper'
import {Flex} from '@instructure/ui-flex'
import {MessageDetailActions} from '../MessageDetailActions/MessageDetailActions'
import {MessageDetailParticipants} from '../MessageDetailParticipants/MessageDetailParticipants'
import PropTypes from 'prop-types'
import React, {useContext, useEffect, useState} from 'react'
import {Responsive} from '@instructure/ui-responsive'
import {responsiveQuerySizes} from '../../../util/utils'
import {IconPaperclipLine} from '@instructure/ui-icons'
import {Link} from '@instructure/ui-link'
import {List} from '@instructure/ui-list'
import {Text} from '@instructure/ui-text'
import {ConversationContext} from '../../../util/constants'
import {MediaAttachment} from '@canvas/message-attachments'
import {formatMessage, containsHtmlTags} from '@canvas/util/TextHelper'
import {useScope as createI18nScope} from '@canvas/i18n'
import {Spinner} from '@instructure/ui-spinner'
import {translationSeparator} from '../../utils/constants'
import {translateInboxMessage} from '../../utils/inbox_translator'
import sanitizeHtml from 'sanitize-html-with-tinymce'

const I18n = createI18nScope('conversations_2')

export const MessageDetailItem = ({...props}) => {
  const createdAt = DateHelper.formatDatetimeForDisplay(props.conversationMessage.createdAt)
  const pronouns = props.conversationMessage?.author?.pronouns
  const {isSubmissionCommentsType} = useContext(ConversationContext)
  const {conversationMessage: {mediaComment} = {}} = props
  const [translatedMessage, setTranslatedMessage] = useState('')
  const [translationError, setTranslationError] = useState('')
  const [isTranslating, setIsTranslating] = useState(false)
  const translateInboundMessage = ENV?.inbox_translation_enabled
  const isMessageHtml = containsHtmlTags(props.conversationMessage?.htmlBody)

  useEffect(() => {
    if (translateInboundMessage == null || !translateInboundMessage) {
      return
    }

    // We've already translated
    if (translatedMessage !== '') {
      return
    }

    // Should translate here, check the body for the separator.
    // If we have the separator in the message, don't translate.
    if (props.conversationMessage?.body.includes(translationSeparator)) {
      return
    }

    const doTranslation = async () => {
      setIsTranslating(true)
      setTranslationError('')

      try {
        // Send the translation call to the backend.
        const translated_text = await translateInboxMessage(props.conversationMessage?.body)

        if (translated_text) {
          setTranslatedMessage(translationSeparator.concat(translated_text))
        }
      } catch {
        setTranslationError(I18n.t('Error while trying to translate message'))
      } finally {
        setIsTranslating(false)
      }
    }

    doTranslation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [translatedMessage])

  const messageBody = (
    isMessageHtml
      ? sanitizeHtml(props.conversationMessage?.htmlBody)
      : formatMessage(props.conversationMessage?.body)
  ).concat(translatedMessage)
  return (
    <Responsive
      match="media"
      query={responsiveQuerySizes({mobile: true, tablet: true, desktop: true})}
      props={{
        mobile: {
          avatar: 'small',
          usernames: 'x-small',
          courseNameDate: 'x-small',
          messageBody: 'x-small',
          dataTestId: 'message-detail-item-mobile',
        },
        tablet: {
          avatar: 'medium',
          usernames: 'small',
          courseNameDate: 'x-small',
          messageBody: 'small',
          dataTestId: 'message-detail-item-tablet',
        },
        desktop: {
          avatar: 'medium',
          usernames: 'medium',
          courseNameDate: 'x-small',
          messageBody: 'medium',
          dataTestId: 'message-detail-item-desktop',
        },
      }}
      render={responsiveProps => (
        <>
          <Flex data-testid={responsiveProps.dataTestId} alignItems="start">
            <Flex.Item>
              <Avatar
                size={responsiveProps.avatar}
                margin="small small small none"
                name={props.conversationMessage?.author?.shortName}
                src={props.conversationMessage?.author?.avatarUrl}
              />
            </Flex.Item>
            <Flex.Item shouldShrink={true} shouldGrow={true}>
              <Flex direction="column">
                <Flex.Item>
                  <MessageDetailParticipants
                    participantsSize={responsiveProps.usernames}
                    conversationMessage={props.conversationMessage}
                  />
                </Flex.Item>
                <Flex.Item>
                  <Text weight="normal" size={responsiveProps.courseNameDate} wrap="break-word">
                    {props.contextName}
                  </Text>
                </Flex.Item>
                {ENV?.SETTINGS?.can_add_pronouns && pronouns && (
                  <Flex.Item>
                    <Text weight="normal" size={responsiveProps.courseNameDate} wrap="break-word">
                      {pronouns}
                    </Text>
                  </Flex.Item>
                )}
                <Flex.Item>
                  <Text weight="normal" size={responsiveProps.courseNameDate} wrap="break-word">
                    {createdAt}
                  </Text>
                </Flex.Item>
              </Flex>
            </Flex.Item>
            {!isSubmissionCommentsType && (
              <Flex.Item textAlign="end">
                <MessageDetailActions
                  onReply={props.onReply}
                  onReplyAll={props.onReplyAll}
                  onDelete={props.onDelete}
                  onForward={props.onForward}
                  authorName={
                    props.conversationMessage?.author?.name?.length > 0
                      ? props.conversationMessage?.author?.name
                      : I18n.t('Unknown User')
                  }
                />
              </Flex.Item>
            )}
          </Flex>
          {isTranslating && (
            <Flex justifyItems="start">
              <Flex.Item>
                <Spinner renderTitle={I18n.t('Translating')} size="x-small" />
              </Flex.Item>
              <Flex.Item margin="0 0 0 x-small">
                <Text>{I18n.t('Checking for Translation')}</Text>
              </Flex.Item>
            </Flex>
          )}
          {!isTranslating && translationError && (
            <Alert variant="error" margin="small" timeout={3000}>
              {translationError}
            </Alert>
          )}
          <Text
            wrap="break-word"
            size={responsiveProps.messageBody}
            dangerouslySetInnerHTML={{__html: messageBody}}
          />
          {props.conversationMessage.attachments?.length > 0 && (
            <List isUnstyled={true} margin="medium auto small">
              {props.conversationMessage.attachments.map(attachment => {
                return (
                  <List.Item as="div" key={attachment.id}>
                    <Link href={attachment.url} renderIcon={<IconPaperclipLine size="x-small" />}>
                      {attachment.displayName}
                    </Link>
                  </List.Item>
                )
              })}
            </List>
          )}
          {mediaComment && (
            <MediaAttachment
              file={{
                mediaID: mediaComment._id,
                title: mediaComment.title,
                mediaTracks: mediaComment.media_tracks,
                mediaSources: mediaComment.mediaSources,
              }}
            />
          )}
        </>
      )}
    />
  )
}

MessageDetailItem.propTypes = {
  // TODO: not sure yet the exact shape of the data that will be fetched, so these will likely change
  conversationMessage: PropTypes.object,
  contextName: PropTypes.string,
  onReply: PropTypes.func,
  onReplyAll: PropTypes.func,
  onDelete: PropTypes.func,
  onForward: PropTypes.func,
}

MessageDetailItem.defaultProps = {
  conversationMessage: {},
}
