import React from 'react';
import { connect, useSelector } from 'react-redux';
import PropTypes from 'prop-types';

import Conversation from './components/Conversation';
import Launcher from './components/Launcher';
import './style.scss';

const WidgetLayout = (props: any) => {

    const isChatVisible = useSelector((state: any) => state.behavior.get('isChatVisible'))
    const isChatOpen = useSelector((state: any) => state.behavior.get('isChatOpen'))
    const disabledInput = useSelector((state: any) => state.behavior.get('disabledInput'))
    const connectingText = useSelector((state: any) => state.behavior.get('connectingText'))

    const classes = props.embedded ? ['rw-widget-embedded'] : ['rw-widget-container'];
    if (props.fullScreenMode) {
        classes.push('rw-full-screen');
    }
    const showCloseButton =
        props.showCloseButton !== undefined ? props.showCloseButton : !props.embedded;
    const isVisible = isChatVisible && !(props.hideWhenNotConnected && !props.connected);
    const chatShowing = isChatOpen || props.embedded;

    if (chatShowing && !props.embedded) {
        classes.push('rw-chat-open');
    }

    return isVisible ? (
        <div className={classes.join(' ')}>
            {chatShowing && (
                <Conversation
                    title={props.title}
                    subtitle={props.subtitle}
                    titleImage={props.titleImage}
                    sendMessage={props.onSendMessage}
                    profileAvatar={props.profileAvatar}
                    toggleChat={props.toggleChat}
                    isChatOpen={isChatOpen}
                    toggleFullScreen={props.toggleFullScreen}
                    fullScreenMode={props.fullScreenMode}
                    disabledInput={disabledInput}
                    params={props.params}
                    showFullScreenButton={props.showFullScreenButton}
                    {...{ showCloseButton }}
                    connected={props.connected}
                    connectingText={connectingText}
                    closeImage={props.closeImage}
                    customComponent={props.customComponent}
                    showMessageDate={props.showMessageDate}
                    inputTextFieldHint={props.inputTextFieldHint}
                />
            )}
            {!props.embedded && (
                <Launcher
                    toggle={props.toggleChat}
                    isChatOpen={isChatOpen}
                    badge={props.badge}
                    chatIndicator={props.chatIndicator}
                    tooltipDisabled={props.tooltipDisabled}
                    fullScreenMode={props.fullScreenMode}
                    openLauncherImage={props.openLauncherImage}
                    closeImage={props.closeImage}
                    displayUnreadCount={props.displayUnreadCount}
                    tooltipHeader={props.tooltipHeader}
                    tooltipText={props.tooltipText}
                    tooltipSuggestions={props.tooltipSuggestions}
                    tooltipPayload={props.tooltipPayload}
                    iconSpinFrequence={props.iconSpinFrequence}
                    iconSpinNoTooltip={props.iconSpinNoTooltip}
                />
            )}
        </div>
    ) : null;
};

// const mapStateToProps = (state: any) => ({
//     isChatVisible: state.behavior.get('isChatVisible'),
//     isChatOpen: state.behavior.get('isChatOpen'),
//     disabledInput: state.behavior.get('disabledInput'),
//     connected: state.behavior.get('connected'),
//     connectingText: state.behavior.get('connectingText'),
// });

// WidgetLayout.propTypes = {
//     title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
//     subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
//     titleImage: PropTypes.string,
//     onSendMessage: PropTypes.func,
//     toggleChat: PropTypes.func,
//     toggleFullScreen: PropTypes.func,
//     isChatOpen: PropTypes.bool,
//     isChatVisible: PropTypes.bool,
//     profileAvatar: PropTypes.string,
//     showCloseButton: PropTypes.bool,
//     showFullScreenButton: PropTypes.bool,
//     hideWhenNotConnected: PropTypes.bool,
//     disabledInput: PropTypes.bool,
//     fullScreenMode: PropTypes.bool,
//     badge: PropTypes.number,
//     chatIndicator: PropTypes.bool,
//     tooltipDisabled: PropTypes.bool,
//     embedded: PropTypes.bool,
//     inputTextFieldHint: PropTypes.string,
//     params: PropTypes.object,
//     connected: PropTypes.bool,
//     connectingText: PropTypes.string,
//     openLauncherImage: PropTypes.string,
//     closeImage: PropTypes.string,
//     customComponent: PropTypes.func,
//     displayUnreadCount: PropTypes.bool,
//     showMessageDate: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
//     tooltipHeader: PropTypes.string,
//     tooltipText: PropTypes.string,
//     tooltipSuggestions: PropTypes.arrayOf(PropTypes.string),
//     tooltipPayload: PropTypes.string,
//     iconSpinFrequence: PropTypes.number,
//     iconSpinNoTooltip: PropTypes.bool,
// };

export default (WidgetLayout as any);
