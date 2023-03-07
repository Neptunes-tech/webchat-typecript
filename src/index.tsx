import React, { forwardRef, useRef } from 'react';

import PropTypes from 'prop-types';
import { Provider } from 'react-redux';

import Widget from './components/Widget';
import { initStore } from './store/store';
import socket from './socket';
import ThemeContext from './components/Widget/ThemeContext';
// eslint-disable-next-line import/no-mutable-exports

const ConnectedWidget = forwardRef((props: any, ref:any) => {
    class Socket {
        url: any;
        customData: any;
        path: any;
        protocol: any;
        protocolOptions: any;
        onSocketEvent: any;
        socket: null;
        onEvents: never[];
        marker: number;
        sessionConfirmed: undefined;
        sessionId: any;
        constructor(url: any, customData: any, path: any, protocol: any, protocolOptions: any, onSocketEvent: any) {

            this.url = url;
            this.customData = customData;
            this.path = path;
            this.protocol = protocol;
            this.protocolOptions = protocolOptions;
            this.onSocketEvent = onSocketEvent;
            this.socket = null;
            this.onEvents = [];
            this.marker = Math.random();
        }

        isInitialized() {
            return this.socket !== null && (this as any).socket.connected;
        }



        on(event: any, callback: any) {
            if (!this.socket) {

                (this as any).onEvents.push({ event, callback })
            } else {
                (this as any).socket.on(event, callback);
            }
        }

        emit(message: any, data: any) {
            if (this.socket) {
                (this as any).socket.emit(message, data);
            }
        }

        close() {
            if (this.socket) {
                (this as any).socket.close();
            }
        }

        createSocket() {
            this.socket = socket(
                this.url,
                this.customData,
                this.path,
                this.protocol,
                this.protocolOptions
            );
            // We set a function on session_confirm here so as to avoid any race condition
            // this will be called first and will set those parameters for everyone to use.
            (this as any).socket.on('session_confirm', (sessionObject: any) => {
                (this as any).sessionConfirmed = true;
                this.sessionId =
                    sessionObject && sessionObject.session_id
                        ? sessionObject.session_id
                        : sessionObject;
            });
            this.onEvents.forEach((event: any) => {
                (this as any).socket.on(event.event, event.callback);
            });

            this.onEvents = [];
            Object.keys(this.onSocketEvent).forEach((event) => {
                (this as any).socket.on(event, this.onSocketEvent[event]);
            });
        }
    }

    const instanceSocket = useRef({});
    const store = useRef(null);

    if (!(instanceSocket as any).current.url && !(store && store.current && (store as any).current.socketRef)) {
        instanceSocket.current = new Socket(
            props.socketUrl,
            props.customData,
            props.socketPath,
            props.protocol,
            props.protocolOptions,
            props.onSocketEvent
        );
    }

    if (!(instanceSocket as any).current.url && store && store.current && (store as any).current.socketRef) {
        instanceSocket.current = (store as any).socket;
    }

    const storage = props.params.storage === 'session' ? sessionStorage : localStorage;

    if (!store || !store.current) {
        (store as any).current = initStore(
            props.connectingText,
            instanceSocket.current,
            storage,
            props.docViewer,
            props.onWidgetEvent
        );
        (store as any).current.socketRef = (instanceSocket as any).current.marker;
        (store as any).current.socket = instanceSocket.current;
    }
    const { initPayload }: any = props
    return (
        <Provider store={(store as any).current}>
            <ThemeContext.Provider
                value={{
                    mainColor: props.mainColor,
                    conversationBackgroundColor: props.conversationBackgroundColor,
                    userTextColor: props.userTextColor,
                    userBackgroundColor: props.userBackgroundColor,
                    assistTextColor: props.assistTextColor,
                    assistBackgoundColor: props.assistBackgoundColor,
                }}
            >
                <Widget
                    ref={ref}
                    initPayload={initPayload}
                    title={props.title}
                    subtitle={props.subtitle}
                    titleImage={props.titleImage}
                    customData={props.customData}
                    handleNewUserMessage={props.handleNewUserMessage}
                    profileAvatar={props.profileAvatar}
                    showCloseButton={props.showCloseButton}
                    showFullScreenButton={props.showFullScreenButton}
                    hideWhenNotConnected={props.hideWhenNotConnected}
                    connectOn={props.connectOn}
                    autoClearCache={props.autoClearCache}
                    fullScreenMode={props.fullScreenMode}
                    badge={props.badge}
                    chatIndicator={props.chatIndicator}
                    tooltipDisabled={props.tooltipDisabled}
                    embedded={props.embedded}
                    params={props.params}
                    storage={storage}
                    inputTextFieldHint={props.inputTextFieldHint}
                    openLauncherImage={props.openLauncherImage}
                    closeImage={props.closeImage}
                    customComponent={props.customComponent}
                    displayUnreadCount={props.displayUnreadCount}
                    socket={instanceSocket.current}
                    showMessageDate={props.showMessageDate}
                    customMessageDelay={props.customMessageDelay}
                    tooltipHeader={props.tooltipHeader}
                    tooltipText={props.tooltipText}
                    tooltipSuggestions={props.tooltipSuggestions}
                    tooltipPayload={props.tooltipPayload}
                    tooltipDelay={props.tooltipDelay}
                    iconSpinFrequence={props.iconSpinFrequence}
                    iconSpinNoTooltip={props.iconSpinNoTooltip}
                    disableTooltips={props.disableTooltips}
                    defaultHighlightCss={props.defaultHighlightCss}
                    defaultHighlightAnimation={props.defaultHighlightAnimation}
                    defaultHighlightClassname={props.defaultHighlightClassname}
                />
            </ThemeContext.Provider>
        </Provider>
    );
});

ConnectedWidget.propTypes = {
    initPayload: PropTypes.string,
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    titleImage: PropTypes.string,
    protocol: PropTypes.string,
    socketUrl: PropTypes.string.isRequired,
    socketPath: PropTypes.string,
    protocolOptions: PropTypes.shape({}),
    customData: PropTypes.shape({}),
    handleNewUserMessage: PropTypes.func,
    profileAvatar: PropTypes.string,
    inputTextFieldHint: PropTypes.string,
    connectingText: PropTypes.string,
    showCloseButton: PropTypes.bool,
    showFullScreenButton: PropTypes.bool,
    hideWhenNotConnected: PropTypes.bool,
    connectOn: PropTypes.oneOf(['mount', 'open']),
    autoClearCache: PropTypes.bool,
    onSocketEvent: PropTypes.objectOf(PropTypes.func),
    fullScreenMode: PropTypes.bool,
    badge: PropTypes.number,
    chatIndicator: PropTypes.bool,
    tooltipDisabled: PropTypes.bool,
    embedded: PropTypes.bool,
    // eslint-disable-next-line react/forbid-prop-types
    params: PropTypes.object,
    openLauncherImage: PropTypes.string,
    closeImage: PropTypes.string,
    docViewer: PropTypes.bool,
    customComponent: PropTypes.func,
    displayUnreadCount: PropTypes.bool,
    showMessageDate: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    customMessageDelay: PropTypes.func,
    tooltipHeader: PropTypes.string,
    tooltipText: PropTypes.string,
    tooltipSuggestions: PropTypes.arrayOf(PropTypes.string),
    tooltipPayload: PropTypes.string,
    tooltipDelay: PropTypes.number,
    iconSpinFrequence: PropTypes.number,
    iconSpinNoTooltip: PropTypes.bool,
    onWidgetEvent: PropTypes.shape({
        onChatOpen: PropTypes.func,
        onChatClose: PropTypes.func,
        onChatVisible: PropTypes.func,
        onChatHidden: PropTypes.func,
    }),
    disableTooltips: PropTypes.bool,
    defaultHighlightCss: PropTypes.string,
    defaultHighlightAnimation: PropTypes.string,
    mainColor: PropTypes.string,
    conversationBackgroundColor: PropTypes.string,
    userTextColor: PropTypes.string,
    userBackgroundColor: PropTypes.string,
    assistTextColor: PropTypes.string,
    assistBackgoundColor: PropTypes.string,
};

ConnectedWidget.defaultProps = {
    title: 'Welcome',
    customData: {},
    inputTextFieldHint: 'Type a message...',
    connectingText: 'Waiting for server...',
    fullScreenMode: false,
    hideWhenNotConnected: true,
    autoClearCache: false,
    connectOn: 'mount',
    onSocketEvent: {},
    protocol: 'socketio',
    socketUrl: 'http://localhost',
    protocolOptions: {},
    badge: 0,
    chatIndicator: false,
    tooltipDisabled: false,
    embedded: false,
    params: {
        storage: 'local',
    },
    docViewer: false,
    showCloseButton: true,
    showFullScreenButton: false,
    displayUnreadCount: false,
    showMessageDate: false,
    customMessageDelay: (message: any) => {
        let delay = message.length * 10;
        if (delay > 2000) delay = 2000;
        if (delay < 800) delay = 800;
        return delay;
    },
    tooltipHeader: null,
    tooltipText: " ",
    tooltipSuggestions: null,
    tooltipPayload: null,
    tooltipDelay: 500,
    iconSpinFrequence: 10000,
    iconSpinNoTooltip: true,
    onWidgetEvent: {
        onChatOpen: () => { },
        onChatClose: () => { },
        onChatVisible: () => { },
        onChatHidden: () => { },
    },
    disableTooltips: false,
    mainColor: '',
    conversationBackgroundColor: '',
    userTextColor: '',
    userBackgroundColor: '',
    assistTextColor: '',
    assistBackgoundColor: '',
};

export default ConnectedWidget;
