import React from 'react';
import PropTypes from 'prop-types';
import { KeyboardAvoidingView, Platform } from 'react-native';

import Header from './components/Header';
import Messages from './components/Messages';
import Sender from './components/Sender';
import './style.scss';

const Conversation = (props) => (
    <div className="rw-conversation-container">
        <Header
            title={props.title}
            subtitle={props.subtitle}
            titleImage={props.titleImage}
            toggleChat={props.toggleChat}
            toggleFullScreen={props.toggleFullScreen}
            fullScreenMode={props.fullScreenMode}
            showCloseButton={props.showCloseButton}
            showFullScreenButton={props.showFullScreenButton}
            connected={props.connected}
            connectingText={props.connectingText}
            closeImage={props.closeImage}
            profileAvatar={props.profileAvatar}
        />
        <Messages
            profileAvatar={props.profileAvatar}
            params={props.params}
            customComponent={props.customComponent}
            showMessageDate={props.showMessageDate}
        />
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : ''}>
            <Sender
                sendMessage={props.sendMessage}
                disabledInput={props.disabledInput}
                inputTextFieldHint={props.inputTextFieldHint}
            />
        </KeyboardAvoidingView>
    </div>
);

Conversation.propTypes = {
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    titleImage: PropTypes.string,
    sendMessage: PropTypes.func,
    profileAvatar: PropTypes.string,
    toggleFullScreen: PropTypes.func,
    fullScreenMode: PropTypes.bool,
    toggleChat: PropTypes.func,
    showCloseButton: PropTypes.bool,
    showFullScreenButton: PropTypes.bool,
    disabledInput: PropTypes.bool,
    inputTextFieldHint: PropTypes.string,
    params: PropTypes.object,
    connected: PropTypes.bool,
    connectingText: PropTypes.string,
    closeImage: PropTypes.string,
    customComponent: PropTypes.func,
    showMessageDate: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
};

export default Conversation;
