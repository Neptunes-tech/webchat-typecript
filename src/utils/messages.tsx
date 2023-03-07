import { Map } from 'immutable';
import { MESSAGES_TYPES, MESSAGE_SENDER } from '../constants';

export function createComponentMessage(component: any, props: any, showAvatar: any) {
    return Map({
        type: MESSAGES_TYPES.CUSTOM_COMPONENT,
        component,
        props,
        sender: MESSAGE_SENDER.RESPONSE,
        showAvatar
    });
}
