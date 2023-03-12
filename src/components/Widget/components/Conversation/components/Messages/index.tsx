import React, { Component, useEffect, useContext } from 'react';
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

import { MESSAGES_TYPES } from '../../../../../../constants';
import { Video, Image, Message, Carousel, Buttons } from '../Messages/components';

import './styles.scss';
import ThemeContext from '../../../../ThemeContext';

const isToday = (date: any) => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

const formatDate = (date: any) => {
  const dateToFormat = new Date(date);
  const showDate = isToday(dateToFormat) ? '' : `${dateToFormat.toLocaleDateString()} `;
  return `${showDate}${dateToFormat.toLocaleTimeString('en-US', { timeStyle: 'short' })}`;
};

const scrollToBottom = () => {
  const messagesDiv = document.getElementById('rw-messages');
  if (messagesDiv) {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
};

interface MessagesProps {
  profileAvatar: string;
  customComponent(): any;
  showMessageDate: boolean | any;
  params: any
}


const Messages = (props: MessagesProps) => {
  const messages: any = useSelector((store: any): any => store.messages)
  const displayTypingIndication: boolean = useSelector((store: any): boolean => store.displayTypingIndication) || false

  useEffect(() => {
    scrollToBottom()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [])

  const getComponentToRender = (message: any, index: number, isLast: any) => {
    const { params }: any = props
    const { customComponent } = props;


    const ComponentToRender: any = (() => {
      switch (message.get('type')) {
        case MESSAGES_TYPES.TEXT: {
          return Message;
        }
        case MESSAGES_TYPES.CAROUSEL: {
          return Carousel;
        }
        case MESSAGES_TYPES.VIDREPLY.VIDEO: {
          return Video;
        }
        case MESSAGES_TYPES.IMGREPLY.IMAGE: {
          return Image;
        }
        case MESSAGES_TYPES.BUTTONS: {
          return Buttons;
        }
        case MESSAGES_TYPES.CUSTOM_COMPONENT:
          return connect(
            store => ({ store }),
            dispatch => ({ dispatch })
          )(customComponent);
        default:
          return null;
      }
    })();

    if (message.get('type') === 'component') {
      const messageProps = message.get('props');
      return (<ComponentToRender
        id={index}
        {...(messageProps.toJS ? messageProps.toJS() : messageProps)}
        isLast={isLast}
      />);
    }
    return <ComponentToRender id={index} params={params} message={message} isLast={isLast} />;
  }

  const { profileAvatar }: any = props;

  const renderMessages = () => {
    const { showMessageDate }: any = props;

    if (messages.isEmpty()) return null;

    const groups = [];
    let group: any = null;

    const dateRenderer = typeof showMessageDate === 'function' ? showMessageDate :
      showMessageDate === true ? formatDate : null;

    const renderMessageDate = (message: any) => {
      const timestamp = message.get('timestamp');

      if (!dateRenderer || !timestamp) return null;
      const dateToRender = dateRenderer(message.get('timestamp', message));
      return dateToRender
        ? <span className="rw-message-date">{dateRenderer(message.get('timestamp'), message)}</span>
        : null;
    };

    const renderMessage = (message: any, index: number) => (
      <div className={`rw-message ${profileAvatar && 'rw-with-avatar'}`} key={index}>
        {
          profileAvatar &&
          message.get('showAvatar') &&
          <img src={profileAvatar} className="rw-avatar" alt="profile" />
        }
        {getComponentToRender(message, index, index === messages.size - 1)}
        {renderMessageDate(message)}
      </div>
    );

    messages.forEach((msg: any, index: number) => {
      if (msg.get('hidden')) return;
      if (group === null || group.from !== msg.get('sender')) {
        if (group !== null) groups.push(group);

        group = {
          from: msg.get('sender'),
          messages: []
        };
      }

      group.messages.push(renderMessage(msg, index));
    });

    groups.push(group); // finally push last group of messages.

    return groups.map((g, index) => (
      <div className={`rw-group-message rw-from-${g && g.from}`} key={`group_${index}`}>
        {g.messages}
      </div>
    ));
  };

  const { conversationBackgroundColor, assistBackgoundColor }: any = useContext(ThemeContext);

  return (
    <div id="rw-messages" style={{ backgroundColor: conversationBackgroundColor }} className="rw-messages-container">
      {renderMessages()}
      {displayTypingIndication && (
        <div className={`rw-message rw-typing-indication ${profileAvatar && 'rw-with-avatar'}`}>
          {
            profileAvatar &&
            <img src={profileAvatar} className="rw-avatar" alt="profile" />
          }
          <div style={{ backgroundColor: assistBackgoundColor }} className="rw-response">
            <div id="wave">
              <span className="rw-dot" />
              <span className="rw-dot" />
              <span className="rw-dot" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default (Messages as any)
