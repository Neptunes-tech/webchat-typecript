import React, { useEffect, useState, forwardRef } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { toggleFullScreen, toggleChat, openChat, closeChat, showChat, addUserMessage, emitUserMessage, addResponseMessage, addCarousel, addVideoSnippet, addImageSnippet, addButtons, renderCustomComponent, initialize, connectServer, disconnectServer, pullSession, newUnreadMessage, triggerMessageDelayed, triggerTooltipSent, showTooltip, clearMetadata, setUserInput, setLinkTarget, setPageChangeCallbacks, changeOldUrl, setDomHighlight, evalUrl, setCustomCss } from '../../store/actions';
import { safeQuerySelectorAll } from '../../utils/dom';
import { SESSION_NAME, NEXT_MESSAGE } from '../../constants';
import { isVideo, isImage, isButtons, isText, isCarousel } from './msgProcessor';
import WidgetLayout from './layout';
import { storeLocalSession, getLocalSession } from '../../store/reducers/helper';

const Widget = forwardRef((props: any, ref: any) => {
    const messagess = useSelector((state: any) => state.messages)
    const dispatch = useDispatch()

    const [onGoingMessageDelay, setOnGoingMessageDelay] = useState(false)
    const [delayedMessage, setDelayedMessage] = useState(null)
    const [messageDelayTimeout, setMessageDelayTimeout] = useState<any>(null)
    const [tooltipTimeout, setTooltipTimeout] = useState<number | string>(0)
    const [messages, setMessages] = useState(messagess)
    const initialized = useSelector((state: any) => state.behavior.get('initialized'))
    const connected = useSelector((state: any) => state.behavior.get('connected'))
    const isChatOpen = useSelector((state: any) => state.behavior.get('isChatOpen'))
    const isChatVisible = useSelector((state: any) => state.behavior.get('isChatVisible'))
    const fullScreenMode = useSelector((state: any) => state.behavior.get('fullScreenMode'))
    const tooltipSent = useSelector((state: any) => state.metadata.get('tooltipSent'))
    const tooltipDismissed = useSelector((state: any) => state.metadata.get('tooltipDismissed'))

    const oldUrl = useSelector((state: any) => state.behavior.get('oldUrl'))
    const domHighlight = useSelector((state: any) => state.metadata.get('domHighlight'))

    // const mapStateToProps = (state:any) => ({

    //     fullScreenMode: state.behavior.get('fullScreenMode'),
    //     tooltipSent: state.metadata.get('tooltipSent'),
    //     tooltipDismissed: state.metadata.get('tooltipDismissed'),
    //     oldUrl: state.behavior.get('oldUrl'),
    //     pageChangeCallbacks: state.behavior.get('pageChangeCallbacks'),
    //     domHighlight: state.metadata.get('domHighlight'),
    //     messages: state.messages,
    // });

    function clearCustomStyle() {
        const { defaultHighlightClassname }: any = props;
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

    function sendMessage(payload: any, text = '', when = 'always', tooltipSelector = false) {
        const emit = () => {
            const send = () => {
                dispatch(emitUserMessage(payload));
                if (text !== '') {
                    dispatch(addUserMessage(text, tooltipSelector));
                }
                else {
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
            initializeWidget(false);
            dispatch(initialize());
            emit();
        }
        else {
            emit();
        }
    }

    function addCustomsEventListeners(pageEventCallbacks: any) {
        const eventsListeners: any = [];

        pageEventCallbacks.forEach((pageEvent: any) => {
            const { event, payload, selector } = pageEvent;
            const sendPayload = () => {
                sendMessage(payload);
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
            eventsListeners.forEach((eventsListener: any) => {
                eventsListener.elem.removeEventListener(
                    eventsListener.event,
                    eventsListener.sendPayload
                );
            });
        };

        return cleaner;
    }

    function propagateMetadata(metadata: any) {
        const { linkTarget, userInput, pageChangeCallbacks, forceOpen, forceClose, pageEventCallbacks } = metadata;
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
            const eventListenerCleaner = addCustomsEventListeners(
                pageEventCallbacks.pageEvents
            );
        }
    }

    const eventListenerCleaner = () => console.log('**')

    function dispatchMessage(message: any) {
        if (Object.keys(message).length === 0) {
            return;
        }
        const { customCss, ...messageClean } = message;

        if (isText(messageClean)) {
            dispatch(addResponseMessage(messageClean.text));
        }
        else if (isButtons(messageClean)) {
            dispatch(addButtons(messageClean));
        }
        else if (isCarousel(messageClean)) {
            dispatch(addCarousel(messageClean));
        }
        else if (isVideo(messageClean)) {
            const element = messageClean.attachment.payload;
            dispatch(
                addVideoSnippet({
                    title: element.title,
                    video: element.src,
                })
            );
        } else if (isImage(messageClean)) {
            const element = messageClean.attachment.payload;
            dispatch(
                addImageSnippet({
                    title: element.title,
                    image: element.src,
                })
            );
        } else {
            // some custom message
            const props = messageClean;
            if (props.customComponent) {
                dispatch(renderCustomComponent(props.customComponent, props, true));
            }
        }
        if (customCss) {
            dispatch(setCustomCss(message.customCss));
        }
    }

    function newMessageTimeout(message: any) {
        const { customMessageDelay }: any = props;
        setDelayedMessage(message);
        setMessageDelayTimeout(setTimeout(() => {
            dispatchMessage(message);
            setDelayedMessage(null);
            applyCustomStyle();
            dispatch(triggerMessageDelayed(false));
            setOnGoingMessageDelay(false);
            popLastMessage();
        }, customMessageDelay(message.text || '')))
    }

    function popLastMessage() {
        if (messages.length) {
            setOnGoingMessageDelay(true);
            dispatch(triggerMessageDelayed(true));
            newMessageTimeout(messages.shift());
        }
    }


    function applyCustomStyle() {
        const { defaultHighlightCss, defaultHighlightClassname }: any = props;
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

    function handleMessageReceived(messageWithMetadata: any) {
        const { disableTooltips }: any = props;

        // we extract metadata so we are sure it does not interfer with type checking of the message
        const { metadata, ...message } = messageWithMetadata;
        if (!isChatOpen) {
            dispatchMessage(message);
            dispatch(newUnreadMessage());
            if (!disableTooltips) {
                dispatch(showTooltip(true));
                applyCustomStyle();
            }
        } else if (!onGoingMessageDelay) {
            setOnGoingMessageDelay(true);
            dispatch(triggerMessageDelayed(true));
            newMessageTimeout(message);
        } else {

            messages.push(message);
        }
    }

    function handleBotUtterance(botUtterance: any) {
        clearCustomStyle();
        eventListenerCleaner();
        dispatch(clearMetadata());
        if (botUtterance.metadata) propagateMetadata(botUtterance.metadata);
        const newMessage = { ...botUtterance, text: String(botUtterance.text) };
        if (botUtterance.metadata && botUtterance.metadata.customCss) {
            newMessage.customCss = botUtterance.metadata.customCss;
        }
        handleMessageReceived(newMessage);
    }

    function getSessionId() {
        const { storage }: any = props;
        // Get the local session, check if there is an existing session_id
        const localSession = getLocalSession(storage, SESSION_NAME);
        const localId = localSession ? localSession?.session_id : null;
        return localId;
    }

    function trySendTooltipPayload() {
        const { tooltipPayload, socket, customData, dispatch }: any =
            props;

        if (connected && !isChatOpen && !tooltipSent.get(tooltipPayload)) {
            const sessionId = getSessionId();

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

    function trySendInitPayload() {
        const {
            initPayload,
            customData,
            socket,
            embedded,
        }: any = props;

        // Send initial payload when chat is opened or widget is shown
        if (!initialized && connected && ((isChatOpen && isChatVisible) || embedded)) {
            // Only send initial payload if the widget is connected to the server but not yet initialized

            const sessionId = getSessionId();

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

    function initializeWidget(sendInitPayload = true) {
        const {
            storage,
            socket,
            embedded,
            connectOn,
            tooltipPayload,
            tooltipDelay,
        }: any = props;
        if (!socket.isInitialized()) {
            socket.createSocket();

            socket.on('bot_uttered', (botUttered: any) => {
                // botUttered.attachment.payload.elements = [botUttered.attachment.payload.elements];
                // console.log(botUttered);
                handleBotUtterance(botUttered);
            });

            checkVersionBeforePull();

            dispatch(pullSession());

            // Request a session from server
            socket.on('connect', () => {
                const localId = getSessionId();
                socket.emit('session_request', { session_id: localId });
            });

            // When session_confirm is received from the server:
            socket.on('session_confirm', (sessionObject: any) => {
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
                const localId = getSessionId();
                if (localId !== remoteId) {
                    // storage.clear();
                    // Store the received session_id to storage

                    storeLocalSession(storage, SESSION_NAME, remoteId);
                    dispatch(pullSession());
                    if (sendInitPayload) {
                        trySendInitPayload();
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
                    const tooltipTimeout = setTimeout(() => {
                        trySendTooltipPayload();
                    }, parseInt(tooltipDelay, 10));
                }
            });

            socket.on('disconnect', (reason: any) => {
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

    function checkVersionBeforePull() {
        const { storage }: any = props;
        const localSession = getLocalSession(storage, SESSION_NAME);
        if (localSession && localSession.version !== 'PACKAGE_VERSION_TO_BE_REPLACED') {
            storage.removeItem(SESSION_NAME);
        }
    }


    function toggleConversation() {
        const { disableTooltips }: any = props;
        if (isChatOpen && delayedMessage) {
            if (!disableTooltips) dispatch(showTooltip(true));
            clearTimeout(messageDelayTimeout);
            dispatchMessage(delayedMessage);
            dispatch(newUnreadMessage());
            setOnGoingMessageDelay(false);
            dispatch(triggerMessageDelayed(false));
            messages.forEach((message: any) => {
                dispatchMessage(message);
                dispatch(newUnreadMessage());
            });
            applyCustomStyle();

            setMessages([]);
            setDelayedMessage(null);
        } else {
            dispatch(showTooltip(false));
        }
        clearTimeout(tooltipTimeout);
        dispatch(toggleChat());
    }

    function handleMessageSubmit(message: any) {
        const userUttered = message;
        if (userUttered) {
            dispatch(addUserMessage(userUttered));
            dispatch(emitUserMessage(userUttered));
        }
    }

    useEffect(() => {
        const { connectOn, autoClearCache, storage, defaultHighlightAnimation, tooltipText, }: any = props;
        const styleNode = document.createElement('style');
        styleNode.innerHTML = defaultHighlightAnimation;
        document.body.appendChild(styleNode);

        const intervalId = setInterval(() => dispatch(evalUrl(window.location.href)), 500);
        if (tooltipText && !tooltipDismissed) {
            dispatch(showTooltip(true));
        }
        if (connectOn === 'mount') {
            console.log("connectOn is 'mount'");
            initializeWidget();
            return;
        }
        const localSession = getLocalSession(storage, SESSION_NAME);
        const lastUpdate = localSession ? localSession.lastUpdate : 0;

        if (autoClearCache) {
            if (Date.now() - lastUpdate < 30 * 60 * 1000) {
                initializeWidget();
            } else {
                localStorage.removeItem(SESSION_NAME);
            }
        } else {
            checkVersionBeforePull();
            dispatch(pullSession());
            if (lastUpdate) initializeWidget();
        }
    }, [])

    return (
        <WidgetLayout
            toggleChat={() => toggleConversation()}
            toggleFullScreen={() => dispatch(toggleFullScreen())}
            onSendMessage={(message: any) => handleMessageSubmit(message)}
            title={props.title}
            subtitle={props.subtitle}
            titleImage={props.titleImage}
            customData={props.customData}
            profileAvatar={props.profileAvatar}
            showCloseButton={props.showCloseButton}
            showFullScreenButton={props.showFullScreenButton}
            hideWhenNotConnected={props.hideWhenNotConnected}
            fullScreenMode={fullScreenMode}
            isChatOpen={isChatOpen}
            isChatVisible={isChatVisible}
            badge={props.badge}
            chatIndicator={props.chatIndicator}
            tooltipDisabled={props.tooltipDisabled}
            embedded={props.embedded}
            params={props.params}
            openLauncherImage={props.openLauncherImage}
            inputTextFieldHint={props.inputTextFieldHint}
            closeImage={props.closeImage}
            customComponent={props.customComponent}
            displayUnreadCount={props.displayUnreadCount}
            showMessageDate={props.showMessageDate}
            tooltipHeader={props.tooltipHeader}
            tooltipText={props.tooltipText}
            tooltipSuggestions={props.tooltipSuggestions}
            tooltipPayload={props.tooltipPayload}
            iconSpinFrequence={props.iconSpinFrequence}
            iconSpinNoTooltip={props.iconSpinNoTooltip}
            ref={ref}
        />
    );
})

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


export default (Widget as any)