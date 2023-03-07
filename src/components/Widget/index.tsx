import ImmutablePropTypes from 'react-immutable-proptypes';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
    toggleFullScreen,
    toggleChat,
    openChat,
    closeChat,
    showChat,
    addUserMessage,
    emitUserMessage,
    addResponseMessage,
    addCarousel,
    addVideoSnippet,
    addImageSnippet,
    addButtons,
    renderCustomComponent,
    initialize,
    connectServer,
    disconnectServer,
    pullSession,
    newUnreadMessage,
    triggerMessageDelayed,
    triggerTooltipSent,
    showTooltip,
    clearMetadata,
    setUserInput,
    setLinkTarget,
    setPageChangeCallbacks,
    changeOldUrl,
    setDomHighlight,
    evalUrl,
    setCustomCss,
} from '../../store/actions';
import { safeQuerySelectorAll } from '../../utils/dom';
import { SESSION_NAME, NEXT_MESSAGE } from '../../constants';
import { isVideo, isImage, isButtons, isText, isCarousel } from './msgProcessor';
import WidgetLayout from './layout';
import { storeLocalSession, getLocalSession } from '../../store/reducers/helper';

class Widget extends Component {
    eventListenerCleaner: () => void;
    intervalId: null;
    onGoingMessageDelay: boolean;
    messageDelayTimeout: null;
    delayedMessage: null;
    messages: never[];
    tooltipTimeout: string | number  | undefined;
    static defaultProps: {
        isChatOpen: boolean; isChatVisible: boolean; fullScreenMode: boolean; connectOn: string; autoClearCache: boolean; displayUnreadCount: boolean; tooltipHeader: null; tooltipText: string; tooltipSuggestions: null; tooltipPayload: null; iconSpinFrequence: number; iconSpinNoTooltip: boolean; inputTextFieldHint: string; oldUrl: string; disableTooltips: boolean; defaultHighlightClassname: string; defaultHighlightCss: string;
        // unfortunately it looks like outline-style is not an animatable property on Safari
        defaultHighlightAnimation: string;
    };
    constructor(props: any) {
        super(props);
        this.messages = [];
        this.delayedMessage = null;
        this.messageDelayTimeout = null;
        this.onGoingMessageDelay = false;
        this.sendMessage = this.sendMessage.bind(this);
        this.getSessionId = this.getSessionId.bind(this);
        this.intervalId = null;
        this.eventListenerCleaner = () => { };
    }

    componentDidMount() {
        const {
            connectOn,
            autoClearCache,
            storage,
            dispatch,
            defaultHighlightAnimation,
            tooltipText,
            tooltipDismissed,
        }: any = this.props;

        // add the default highlight css to the document
        const styleNode = document.createElement('style');
        styleNode.innerHTML = defaultHighlightAnimation;
        document.body.appendChild(styleNode);

        (this as any).intervalId = setInterval(() => dispatch(evalUrl(window.location.href)), 500);
        if (tooltipText && !tooltipDismissed) {
            dispatch(showTooltip(true));
        }
        if (connectOn === 'mount') {
            console.log("connectOn is 'mount'");
            this.initializeWidget();
            return;
        }

        const localSession = getLocalSession(storage, SESSION_NAME);
        const lastUpdate = localSession ? localSession.lastUpdate : 0;

        if (autoClearCache) {
            if (Date.now() - lastUpdate < 30 * 60 * 1000) {
                this.initializeWidget();
            } else {
                localStorage.removeItem(SESSION_NAME);
            }
        } else {
            this.checkVersionBeforePull();
            dispatch(pullSession());
            if (lastUpdate) this.initializeWidget();
        }
    }

    componentDidUpdate() {
        const { isChatOpen, dispatch, embedded, initialized }: any = this.props;

        if (isChatOpen) {
            if (!initialized) {
                this.initializeWidget();
            }
            this.trySendInitPayload();
        }

        if (embedded && initialized) {
            dispatch(showChat());
            dispatch(openChat());
        }
    }

    componentWillUnmount() {
        const { socket }: any = this.props;

        if (socket) {
            socket.close();
        }
        clearTimeout(this.tooltipTimeout);
        clearInterval((this as any).intervalId);
    }

    getSessionId() {
        const { storage }: any = this.props;
        // Get the local session, check if there is an existing session_id
        const localSession = getLocalSession(storage, SESSION_NAME);
        const localId = localSession ? localSession.session_id : null;
        return localId;
    }

    sendMessage(payload: any, text = '', when = 'always', tooltipSelector = false) {
        const { dispatch, initialized, messages }: any = this.props;
        const emit = () => {
            const send = () => {
                dispatch(emitUserMessage(payload));
                if (text !== '') {
                    dispatch(addUserMessage(text, tooltipSelector));
                } else {
                    dispatch(addUserMessage('hidden', tooltipSelector, true));
                }
                if (tooltipSelector) {
                    dispatch(closeChat());
                    showTooltip(true);
                }
            };
            if (when === 'always') {
                send();
            } else if (when === 'init') {
                if (messages.size === 0) {
                    send();
                }
            }
        };
        if (!initialized) {
            this.initializeWidget(false);
            dispatch(initialize());
            emit();
        } else {
            emit();
        }
    }

    handleMessageReceived(messageWithMetadata: any) {
        const { dispatch, isChatOpen, disableTooltips }: any = this.props;

        // we extract metadata so we are sure it does not interfer with type checking of the message
        const { metadata, ...message } = messageWithMetadata;
        if (!isChatOpen) {
            this.dispatchMessage(message);
            dispatch(newUnreadMessage());
            if (!disableTooltips) {
                dispatch(showTooltip(true));
                this.applyCustomStyle();
            }
        } else if (!this.onGoingMessageDelay) {
            this.onGoingMessageDelay = true;
            dispatch(triggerMessageDelayed(true));
            this.newMessageTimeout(message);
        } else {

            (this as any).messages.push(message);
        }
    }

    popLastMessage() {
        const { dispatch }: any = this.props;
        if (this.messages.length) {
            this.onGoingMessageDelay = true;
            dispatch(triggerMessageDelayed(true));
            this.newMessageTimeout(this.messages.shift());
        }
    }

    newMessageTimeout(message: any) {
        const { dispatch, customMessageDelay }: any = this.props;
        this.delayedMessage = message;
        (this as any).messageDelayTimeout = setTimeout(() => {
            this.dispatchMessage(message);
            this.delayedMessage = null;
            this.applyCustomStyle();
            dispatch(triggerMessageDelayed(false));
            this.onGoingMessageDelay = false;
            this.popLastMessage();
        }, customMessageDelay(message.text || ''));
    }

    propagateMetadata(metadata:any) {
        const { dispatch }:any = this.props;
        const {
            linkTarget,
            userInput,
            pageChangeCallbacks,
            domHighlight,
            forceOpen,
            forceClose,
            pageEventCallbacks,
        } = metadata;
        if (linkTarget) {
            dispatch(setLinkTarget(linkTarget));
        }
        if (userInput) {
            dispatch(setUserInput(userInput));
        }
        if (pageChangeCallbacks) {
            dispatch(changeOldUrl(window.location.href));
            dispatch(setPageChangeCallbacks(pageChangeCallbacks));
        }
        if (domHighlight) {
            dispatch(setDomHighlight(domHighlight));
        }
        if (forceOpen) {
            dispatch(openChat());
        }
        if (forceClose) {
            dispatch(closeChat());
        }
        if (pageEventCallbacks) {
            this.eventListenerCleaner = this.addCustomsEventListeners(
                pageEventCallbacks.pageEvents
            );
        }
    }

    handleBotUtterance(botUtterance:any) {
        const { dispatch }:any = this.props;
        this.clearCustomStyle();
        this.eventListenerCleaner();
        dispatch(clearMetadata());
        if (botUtterance.metadata) this.propagateMetadata(botUtterance.metadata);
        const newMessage = { ...botUtterance, text: String(botUtterance.text) };
        if (botUtterance.metadata && botUtterance.metadata.customCss) {
            newMessage.customCss = botUtterance.metadata.customCss;
        }
        this.handleMessageReceived(newMessage);
    }

    addCustomsEventListeners(pageEventCallbacks:any) {
        const eventsListeners:any = [];

        pageEventCallbacks.forEach((pageEvent:any) => {
            const { event, payload, selector } = pageEvent;
            const sendPayload = () => {
                this.sendMessage(payload);
            };

            if (event && payload && selector) {
                const elemList = document.querySelectorAll(selector);
                if (elemList.length > 0) {
                    elemList.forEach((elem) => {
                        eventsListeners.push({ elem, event, sendPayload });
                        elem.addEventListener(event, sendPayload);
                    });
                }
            }
        });

        const cleaner = () => {
            eventsListeners.forEach((eventsListener:any) => {
                eventsListener.elem.removeEventListener(
                    eventsListener.event,
                    eventsListener.sendPayload
                );
            });
        };

        return cleaner;
    }

    clearCustomStyle() {
        const { domHighlight, defaultHighlightClassname }:any = this.props;
        const domHighlightJS = domHighlight.toJS() || {};
        if (domHighlightJS.selector) {
            const elements = safeQuerySelectorAll(domHighlightJS.selector);
            elements.forEach((element) => {
                switch (domHighlightJS.style) {
                    case 'custom':
                        element.setAttribute('style', '');
                        break;
                    case 'class':
                        element.classList.remove(domHighlightJS.css);
                        break;
                    default:
                        if (defaultHighlightClassname !== '') {
                            element.classList.remove(defaultHighlightClassname);
                        } else {
                            element.setAttribute('style', '');
                        }
                }
            });
        }
    }

    applyCustomStyle() {
        const { domHighlight, defaultHighlightCss, defaultHighlightClassname }:any = this.props;
        const domHighlightJS = domHighlight.toJS() || {};
        if (domHighlightJS.selector) {
            const elements = safeQuerySelectorAll(domHighlightJS.selector);
            elements.forEach((element) => {
                switch (domHighlightJS.style) {
                    case 'custom':
                        element.setAttribute('style', domHighlightJS.css);
                        break;
                    case 'class':
                        element.classList.add(domHighlightJS.css);
                        break;
                    default:
                        if (defaultHighlightClassname !== '') {
                            element.classList.add(defaultHighlightClassname);
                        } else {
                            element.setAttribute('style', defaultHighlightCss);
                        }
                }
            });
            // We check that the method is here to prevent crashes on unsupported browsers.
            if (elements[0] && elements[0].scrollIntoView) {
                // If I don't use a timeout, the scrollToBottom in messages.jsx
                // seems to override that scrolling
                setTimeout(() => {
                    if (/Mobi/.test(navigator.userAgent)) {
                        elements[0].scrollIntoView({
                            block: 'center',
                            inline: 'nearest',
                            behavior: 'smooth',
                        });
                    } else {
                        const rectangle = elements[0].getBoundingClientRect();

                        const ElemIsInViewPort =
                            rectangle.top >= 0 &&
                            rectangle.left >= 0 &&
                            rectangle.bottom <=
                            (window.innerHeight || document.documentElement.clientHeight) &&
                            rectangle.right <=
                            (window.innerWidth || document.documentElement.clientWidth);
                        if (!ElemIsInViewPort) {
                            elements[0].scrollIntoView({
                                block: 'center',
                                inline: 'nearest',
                                behavior: 'smooth',
                            });
                        }
                    }
                }, 50);
            }
        }
    }

    checkVersionBeforePull() {
        const { storage } :any= this.props;
        const localSession = getLocalSession(storage, SESSION_NAME);
        if (localSession && localSession.version !== 'PACKAGE_VERSION_TO_BE_REPLACED') {
            storage.removeItem(SESSION_NAME);
        }
    }

    initializeWidget(sendInitPayload = true) {
        const {
            storage,
            socket,
            dispatch,
            embedded,
            initialized,
            connectOn,
            tooltipPayload,
            tooltipDelay,
        } :any= this.props;
        if (!socket.isInitialized()) {
            socket.createSocket();

            socket.on('bot_uttered', (botUttered:any) => {
                // botUttered.attachment.payload.elements = [botUttered.attachment.payload.elements];
                // console.log(botUttered);
                this.handleBotUtterance(botUttered);
            });

            this.checkVersionBeforePull();

            dispatch(pullSession());

            // Request a session from server
            socket.on('connect', () => {
                const localId = this.getSessionId();
                socket.emit('session_request', { session_id: localId });
            });

            // When session_confirm is received from the server:
            socket.on('session_confirm', (sessionObject:any) => {
                const remoteId =
                    sessionObject && sessionObject.session_id
                        ? sessionObject.session_id
                        : sessionObject;

                // eslint-disable-next-line no-console
                console.log(`session_confirm:${socket.socket.id} session_id:${remoteId}`);
                // Store the initial state to both the redux store and the storage, set connected to true
                dispatch(connectServer());
                /*
        Check if the session_id is consistent with the server
        If the localId is null or different from the remote_id,
        start a new session.
        */
                const localId = this.getSessionId();
                if (localId !== remoteId) {
                    // storage.clear();
                    // Store the received session_id to storage

                    storeLocalSession(storage, SESSION_NAME, remoteId);
                    dispatch(pullSession());
                    if (sendInitPayload) {
                        this.trySendInitPayload();
                    }
                } else {
                    // If this is an existing session, it's possible we changed pages and want to send a
                    // user message when we land.
                    const nextMessage = window.localStorage.getItem(NEXT_MESSAGE);

                    if (nextMessage !== null) {
                        const { message, expiry } = JSON.parse(nextMessage);
                        window.localStorage.removeItem(NEXT_MESSAGE);

                        if (expiry === 0 || expiry > Date.now()) {
                            dispatch(addUserMessage(message));
                            dispatch(emitUserMessage(message));
                        }
                    }
                }
                if (connectOn === 'mount' && tooltipPayload) {
                    (this as any).tooltipTimeout = setTimeout(() => {
                        this.trySendTooltipPayload();
                    }, parseInt(tooltipDelay, 10));
                }
            });

            socket.on('disconnect', (reason:any) => {
                // eslint-disable-next-line no-console
                console.log(reason);
                if (reason !== 'io client disconnect') {
                    dispatch(disconnectServer());
                }
            });
        }

        if (embedded && initialized) {
            dispatch(showChat());
            dispatch(openChat());
        }
    }

    // TODO: Need to erase redux store on load if localStorage
    // is erased. Then behavior on reload can be consistent with
    // behavior on first load

    trySendInitPayload() {
        const {
            initPayload,
            customData,
            socket,
            initialized,
            isChatOpen,
            isChatVisible,
            embedded,
            connected,
            dispatch,
        }:any = this.props;

        // Send initial payload when chat is opened or widget is shown
        if (!initialized && connected && ((isChatOpen && isChatVisible) || embedded)) {
            // Only send initial payload if the widget is connected to the server but not yet initialized

            const sessionId = this.getSessionId();

            // check that session_id is confirmed
            if (!sessionId) return;

            // eslint-disable-next-line no-console
            console.log('sending init payload', sessionId);
            socket.emit('user_uttered', {
                message: initPayload,
                customData,
                session_id: sessionId,
            });
            dispatch(initialize());
        }
    }

    trySendTooltipPayload() {
        const { tooltipPayload, socket, customData, connected, isChatOpen, dispatch, tooltipSent }:any =
            this.props;

        if (connected && !isChatOpen && !tooltipSent.get(tooltipPayload)) {
            const sessionId = this.getSessionId();

            if (!sessionId) return;

            socket.emit('user_uttered', {
                message: tooltipPayload,
                customData,
                session_id: sessionId,
            });

            dispatch(triggerTooltipSent(tooltipPayload));
            dispatch(initialize());
        }
    }

    toggleConversation() {
        const { isChatOpen, dispatch, disableTooltips }:any = this.props;
        if (isChatOpen && this.delayedMessage) {
            if (!disableTooltips) dispatch(showTooltip(true));
            clearTimeout((this as any).messageDelayTimeout);
            this.dispatchMessage(this.delayedMessage);
            dispatch(newUnreadMessage());
            this.onGoingMessageDelay = false;
            dispatch(triggerMessageDelayed(false));
            this.messages.forEach((message) => {
                this.dispatchMessage(message);
                dispatch(newUnreadMessage());
            });
            this.applyCustomStyle();

            this.messages = [];
            this.delayedMessage = null;
        } else {
            (this as any).props.dispatch(showTooltip(false));
        }
        clearTimeout(this.tooltipTimeout);
        dispatch(toggleChat());
    }

    toggleFullScreen() {
        (this as any).props.dispatch(toggleFullScreen());
    }

    dispatchMessage(message:any) {
        if (Object.keys(message).length === 0) {
            return;
        }
        const { customCss, ...messageClean } = message;

        if (isText(messageClean)) {
            (this as any).props.dispatch(addResponseMessage(messageClean.text));
        } else if (isButtons(messageClean)) {
            (this as any).props.dispatch(addButtons(messageClean));
        } else if (isCarousel(messageClean)) {
            (this as any).props.dispatch(addCarousel(messageClean));
        } else if (isVideo(messageClean)) {
            const element = messageClean.attachment.payload;
            (this as any).props.dispatch(
                addVideoSnippet({
                    title: element.title,
                    video: element.src,
                })
            );
        } else if (isImage(messageClean)) {
            const element = messageClean.attachment.payload;
            (this as any).props.dispatch(
                addImageSnippet({
                    title: element.title,
                    image: element.src,
                })
            );
        } else {
            // some custom message
            const props = messageClean;
            if ((this as any).props.customComponent) {
                (this as any).props.dispatch(renderCustomComponent((this as any).props.customComponent, props, true));
            }
        }
        if (customCss) {
            (this as any).props.dispatch(setCustomCss(message.customCss));
        }
    }

    handleMessageSubmit(message:any) {
        const userUttered = message;
        if (userUttered) {
            (this as any).props.dispatch(addUserMessage(userUttered));
            (this as any).props.dispatch(emitUserMessage(userUttered));
        }
    }

    render() {
        return (
            <WidgetLayout
                toggleChat={() => this.toggleConversation()}
                toggleFullScreen={() => this.toggleFullScreen()}
                onSendMessage={(message:any) => this.handleMessageSubmit(message)}
                title={(this as any).props.title}
                subtitle={(this as any).props.subtitle}
                titleImage={(this as any).props.titleImage}
                customData={(this as any).props.customData}
                profileAvatar={(this as any).props.profileAvatar}
                showCloseButton={(this as any).props.showCloseButton}
                showFullScreenButton={(this as any).props.showFullScreenButton}
                hideWhenNotConnected={(this as any).props.hideWhenNotConnected}
                fullScreenMode={(this as any).props.fullScreenMode}
                isChatOpen={(this as any).props.isChatOpen}
                isChatVisible={(this as any).props.isChatVisible}
                badge={(this as any).props.badge}
                chatIndicator={(this as any).props.chatIndicator}
                tooltipDisabled={(this as any).props.tooltipDisabled}
                embedded={(this as any).props.embedded}
                params={(this as any).props.params}
                openLauncherImage={(this as any).props.openLauncherImage}
                inputTextFieldHint={(this as any).props.inputTextFieldHint}
                closeImage={(this as any).props.closeImage}
                customComponent={(this as any).props.customComponent}
                displayUnreadCount={(this as any).props.displayUnreadCount}
                showMessageDate={(this as any).props.showMessageDate}
                tooltipHeader={(this as any).props.tooltipHeader}
                tooltipText={(this as any).props.tooltipText}
                tooltipSuggestions={(this as any).props.tooltipSuggestions}
                tooltipPayload={(this as any).props.tooltipPayload}
                iconSpinFrequence={(this as any).props.iconSpinFrequence}
                iconSpinNoTooltip={(this as any).props.iconSpinNoTooltip}
            />
        );
    }
}

const mapStateToProps = (state:any) => ({
    initialized: state.behavior.get('initialized'),
    connected: state.behavior.get('connected'),
    isChatOpen: state.behavior.get('isChatOpen'),
    isChatVisible: state.behavior.get('isChatVisible'),
    fullScreenMode: state.behavior.get('fullScreenMode'),
    tooltipSent: state.metadata.get('tooltipSent'),
    tooltipDismissed: state.metadata.get('tooltipDismissed'),
    oldUrl: state.behavior.get('oldUrl'),
    pageChangeCallbacks: state.behavior.get('pageChangeCallbacks'),
    domHighlight: state.metadata.get('domHighlight'),
    messages: state.messages,
});

Widget.propTypes = {
    title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    customData: PropTypes.shape({}),
    subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    titleImage: PropTypes.string,
    initPayload: PropTypes.string,
    profileAvatar: PropTypes.string,
    showCloseButton: PropTypes.bool,
    showFullScreenButton: PropTypes.bool,
    hideWhenNotConnected: PropTypes.bool,
    connectOn: PropTypes.oneOf(['mount', 'open']),
    autoClearCache: PropTypes.bool,
    fullScreenMode: PropTypes.bool,
    isChatVisible: PropTypes.bool,
    isChatOpen: PropTypes.bool,
    badge: PropTypes.number,
    chatIndicator: PropTypes.bool,
    tooltipDisabled: PropTypes.bool,
    socket: PropTypes.shape({}),
    embedded: PropTypes.bool,
    params: PropTypes.shape({}),
    connected: PropTypes.bool,
    initialized: PropTypes.bool,
    openLauncherImage: PropTypes.string,
    closeImage: PropTypes.string,
    inputTextFieldHint: PropTypes.string,
    customComponent: PropTypes.func,
    displayUnreadCount: PropTypes.bool,
    showMessageDate: PropTypes.oneOfType([PropTypes.bool, PropTypes.func]),
    customMessageDelay: PropTypes.func.isRequired,
    tooltipHeader: PropTypes.string,
    tooltipText: PropTypes.string,
    tooltipSuggestions: PropTypes.arrayOf(PropTypes.string),
    tooltipPayload: PropTypes.string,
    tooltipSent: PropTypes.shape({}),
    tooltipDismissed: PropTypes.bool,
    tooltipDelay: PropTypes.number.isRequired,
    iconSpinFrequence: PropTypes.number,
    iconSpinNoTooltip: PropTypes.bool,
    domHighlight: PropTypes.shape({}),
    storage: PropTypes.shape({}),
    disableTooltips: PropTypes.bool,
    defaultHighlightAnimation: PropTypes.string,
    defaultHighlightCss: PropTypes.string,
    defaultHighlightClassname: PropTypes.string,
    messages: ImmutablePropTypes.listOf(ImmutablePropTypes.map),
};

Widget.defaultProps = {
    isChatOpen: false,
    isChatVisible: true,
    fullScreenMode: false,
    connectOn: 'mount',
    autoClearCache: false,
    displayUnreadCount: false,
    tooltipHeader: null,
    tooltipText: " ",
    tooltipSuggestions: null,
    tooltipPayload: null,
    iconSpinFrequence: 10000,
    iconSpinNoTooltip: true,
    inputTextFieldHint: 'Type a message...',
    oldUrl: '',
    disableTooltips: false,
    defaultHighlightClassname: '',
    defaultHighlightCss:
        'animation: 0.5s linear infinite alternate default-botfront-blinker-animation; outline-style: solid;',
    // unfortunately it looks like outline-style is not an animatable property on Safari
    defaultHighlightAnimation: `@keyframes default-botfront-blinker-animation {
    0% {
      outline-color: rgba(0,255,0,0);
    }
    49% {
      outline-color: rgba(0,255,0,0);
    }
    50% {
      outline-color:green;
    }
    100% {
      outline-color: green;
    }
  }`,
};

export default connect(mapStateToProps, null, null, { forwardRef: true })(Widget as any);
