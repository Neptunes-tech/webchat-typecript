import * as actions from './actionTypes';

export function initialize() {
    return {
        type: actions.INITIALIZE,
    };
}

export function connectServer() {
    return {
        type: actions.CONNECT,
    };
}

export function connect() {
    return {
        type: actions.CONNECT,
    };
}

export function disconnect() {
    return {
        type: actions.DISCONNECT,
    };
}

export function disconnectServer() {
    return {
        type: actions.DISCONNECT,
    };
}

export function getOpenState() {
    return {
        type: actions.GET_OPEN_STATE,
    };
}

export function getVisibleState() {
    return {
        type: actions.GET_VISIBLE_STATE,
    };
}

export function showChat() {
    return {
        type: actions.SHOW_CHAT,
    };
}

export function hideChat() {
    return {
        type: actions.HIDE_CHAT,
    };
}

export function toggleChat() {
    return {
        type: actions.TOGGLE_CHAT,
    };
}

export function openChat() {
    return {
        type: actions.OPEN_CHAT,
    };
}

export function closeChat() {
    return {
        type: actions.CLOSE_CHAT,
    };
}

export function toggleFullScreen() {
    return {
        type: actions.TOGGLE_FULLSCREEN,
    };
}

export function toggleInputDisabled(disable:any) {
    return {
        type: actions.TOGGLE_INPUT_DISABLED,
        disable,
    };
}

export function addUserMessage(text:string, nextMessageIsTooltip = false, hidden = false) {
    return {
        type: actions.ADD_NEW_USER_MESSAGE,
        text,
        nextMessageIsTooltip,
        hidden,
    };
}

export function emitUserMessage(text:string) {
    return {
        type: actions.EMIT_NEW_USER_MESSAGE,
        text,
    };
}

export function addResponseMessage(text:string) {
    return {
        type: actions.ADD_NEW_RESPONSE_MESSAGE,
        text,
    };
}

export function addCarousel(carousel:any) {
    return {
        type: actions.ADD_CAROUSEL,
        carousel,
    };
}

export function addVideoSnippet(video:any) {
    return {
        type: actions.ADD_NEW_VIDEO_VIDREPLY,
        video,
    };
}

export function addImageSnippet(image:any) {
    return {
        type: actions.ADD_NEW_IMAGE_IMGREPLY,
        image,
    };
}

export function addButtons(buttons:any) {
    return {
        type: actions.ADD_BUTTONS,
        buttons,
    };
}

export function setButtons(id:any, title:string) {
    return {
        type: actions.SET_BUTTONS,
        id,
        title,
    };
}

export function insertUserMessage(index:any, text:string) {
    return {
        type: actions.INSERT_NEW_USER_MESSAGE,
        index,
        text,
    };
}

export function renderCustomComponent(component:any, props:any, showAvatar:any) {
    return {
        type: actions.ADD_COMPONENT_MESSAGE,
        component,
        props,
        showAvatar,
    };
}

export function dropMessages() {
    return {
        type: actions.DROP_MESSAGES,
    };
}

export function pullSession() {
    return {
        type: actions.PULL_SESSION,
    };
}

export function newUnreadMessage() {
    return {
        type: actions.NEW_UNREAD_MESSAGE,
    };
}

export function triggerMessageDelayed(messageDelayed:any) {
    return {
        type: actions.TRIGGER_MESSAGE_DELAY,
        messageDelayed,
    };
}

export function showTooltip(visible:any) {
    return {
        type: actions.SHOW_TOOLTIP,
        visible,
    };
}

export function tooltipDismissed(visible:any) {
    return {
        type: actions.TOOLTIP_DISMISSED,
        visible,
    };
}

export function triggerTooltipSent(payloadSent:any) {
    return {
        type: actions.TRIGGER_TOOLTIP_SENT,
        payloadSent,
    };
}

export function clearMetadata() {
    return {
        type: actions.CLEAR_METADATA,
    };
}

export function setLinkTarget(target:any) {
    return {
        type: actions.SET_LINK_TARGET,
        target,
    };
}

export function setUserInput(userInputState:any) {
    return {
        type: actions.SET_USER_INPUT,
        userInputState,
    };
}

export function setPageChangeCallbacks(pageChangeCallbacks:any) {
    return {
        type: actions.SET_PAGECHANGE_CALLBACKS,
        pageChangeCallbacks,
    };
}

export function setDomHighlight(domHighlight:any) {
    return {
        type: actions.SET_DOM_HIGHLIGHT,
        domHighlight,
    };
}

export function hintText(hint:any) {
    return {
        type: actions.SET_HINT_TEXT,
        hint,
    };
}

export function changeOldUrl(url:any) {
    return {
        type: actions.SET_OLD_URL,
        url,
    };
}

export function evalUrl(url:any) {
    return {
        type: actions.EVAL_URL,
        url,
    };
}

export function setCustomCss(customCss:any) {
    return {
        type: actions.SET_CUSTOM_CSS,
        customCss,
    };
}
