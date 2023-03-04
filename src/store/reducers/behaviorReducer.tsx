import { Map, fromJS } from 'immutable';
import { SESSION_NAME } from '../../constants';
import * as actionTypes from '../actions/actionTypes';
import { getLocalSession, storeParamsTo } from './helper';

export default function (connectingText:any, storage:any, docViewer = false, onWidgetEvent = {},) {
  const initialState = Map({
    connected: false,
    initialized: false,
    isChatVisible: true,
    isChatOpen: false,
    disabledInput: true,
    docViewer,
    connectingText,
    unreadCount: 0,
    messageDelayed: false,
    oldUrl: '',
    pageChangeCallbacks: Map()
  });

  return function reducer(state = initialState, action:any) {
    const storeParams = storeParamsTo(storage);
    switch (action.type) {
      // Each change to the redux store's behavior Map gets recorded to storage
      case actionTypes.SHOW_CHAT: {
        if ((onWidgetEvent as any).onChatVisible) (onWidgetEvent as any).onChatVisible();
        return storeParams(state.update('isChatVisible', () => true));
      }
      case actionTypes.HIDE_CHAT: {
        if ((onWidgetEvent as any).onChatHidden) (onWidgetEvent as any).onChatHidden();
        return storeParams(state.update('isChatVisible', () => false));
      }
      case actionTypes.TOGGLE_CHAT: {
        if (state.get('isChatOpen', false) && (onWidgetEvent as any).onChatClose) {
          (onWidgetEvent as any).onChatClose();
        } else if ((onWidgetEvent as any).onChatOpen) {
          (onWidgetEvent as any).onChatOpen();
        }

        return storeParams(state.update('isChatOpen', isChatOpen => !isChatOpen).set('unreadCount', 0));
      }
      case actionTypes.OPEN_CHAT: {
        if ((onWidgetEvent as any).onChatOpen) (onWidgetEvent as any).onChatOpen();
        return storeParams(state.update('isChatOpen', () => true).set('unreadCount', 0));
      }
      case actionTypes.CLOSE_CHAT: {
        if ((onWidgetEvent as any).onChatClose) (onWidgetEvent as any).onChatClose();
        return storeParams(state.update('isChatOpen', () => false));
      }
      case actionTypes.TOGGLE_FULLSCREEN: {
        if ((onWidgetEvent as any).onChatFullScreen) (onWidgetEvent as any).onChatFullScreen();
        return storeParams(state.update('fullScreenMode', fullScreenMode => !fullScreenMode));
      }
      case actionTypes.TOGGLE_INPUT_DISABLED: {
        const disable = action.disable;
        if (disable !== undefined && disable !== null) {
          return storeParams(state.update('disabledInput', () => disable));
        }

        return storeParams(state.update('disabledInput', disabledInput => !disabledInput));
      }
      case actionTypes.CONNECT: {
        return storeParams(state.set('connected', true).set('disabledInput', false));
      }
      case actionTypes.DISCONNECT: {
        return storeParams(state.set('connected', false).set('disabledInput', true));
      }
      case actionTypes.INITIALIZE: {
        return storeParams(state.set('initialized', true));
      }
      case actionTypes.NEW_UNREAD_MESSAGE: {
        return storeParams(state.set('unreadCount', state.get('unreadCount', 0) + 1));
      }
      case actionTypes.TRIGGER_MESSAGE_DELAY: {
        return storeParams(state.set('messageDelayed', action.messageDelayed));
      }
      case actionTypes.SET_OLD_URL: {
        return storeParams(state.set('oldUrl', action.url));
      }
      case actionTypes.SET_PAGECHANGE_CALLBACKS: {
        return storeParams(state.set('pageChangeCallbacks', fromJS(action.pageChangeCallbacks)));
      }
      case actionTypes.EVAL_URL: {
        const newUrl = action.url;
        const pageCallbacks = state.get('pageChangeCallbacks');
        const pageCallbacksJs = pageCallbacks ? pageCallbacks.toJS() : {};
        if (!pageCallbacksJs.pageChanges) return state;
        if (state.get('oldUrl') !== newUrl) {
          return storeParams(state.set('oldUrl', newUrl).set('pageChangeCallbacks', Map()));
        }
        return state;
      }

      // Pull params from storage to redux store
      case actionTypes.PULL_SESSION: {
        const localSession = getLocalSession(storage, SESSION_NAME);

        // Do not persist connected state
        const connected = state.get('connected');
        const messageDelayed = state.get('messageDelayed');
        if (localSession && localSession.params) {
          return fromJS({ ...localSession.params, connected, messageDelayed });
        }
        return state;
      }
      default:
        return state;
    }
  };
}
