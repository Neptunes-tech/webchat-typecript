import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import RasaWebchatPro from './src/pro-src/rules-wrapper';

import './src/pro-src/index.css';

// interface RasaWebchatProTypes {
//     socketUrl?: string;
//     initPayload: string;
//     title: string | Element;
//     subtitl: string | Element;
//     protocol: string;
//     socketPath: string;
//     protocolOptions: object;
//     customData: object;
//     handleNewUserMessage(): any;
//     profileAvatar: string;
//     inputTextFieldHint: string;
//     connectingText: string;
//     showCloseButton: boolean;
//     showFullScreenButton: boolean;
//     hideWhenNotConnected: boolean;
//     connectOn: string;
//     autoClearCache: boolean;
//     onSocketEvent: any;
//     fullScreenMode: boolean;
//     badge: number;
//     chatIndicator: boolean;
//     tooltipDisabled: boolean;
//     embedded: boolean;
//     params: object;
//     openLauncherImage: string;
//     closeImage: string;
//     docViewer: boolean;
//     customComponent(): any;
//     displayUnreadCount: boolean;
//     showMessageDate: any;
//     customMessageDelay(): any;
//     tooltipHeader: string;
//     tooltipText: string;
//     tooltipSuggestions: string[];
//     iconSpinFrequence: number;
//     iconSpinNoTooltip: boolean;
//     tooltipPayload: string;
//     tooltipDelay: number;
//     withRules: boolean;
//     rules: object[];
//     triggerEventListenerUpdateRate: number;
//     innerRef: any;
// };

const RasaWebchatProWithRules = (props) => {
    const { connectOn, onSocketEvent } = props;
    let { withRules } = props;
    const [webchatRef, setWebChatRef] = useState(null)
    const [propsRetrieved, setPropsRetrieved] = useState(!withRules)
    const [rulesApplied, setRulesApplied] = useState(!withRules)

    if (connectOn === 'open' && withRules === true) {
        throw new Error(
            "You can't use rules and connect on open, you have to use connect on mount"
        );
    }

    if (withRules === undefined) {
        withRules = true;
    }

    const setRef = (element) => {
        const { innerRef } = props;
        if (!innerRef) {
            setWebChatRef(element)
        }
        else if (innerRef && innerRef.constructor && innerRef.call && innerRef.apply) {
            // if this is true, innerRef is a function and thus it's a callback ref
            setWebChatRef(element)
            innerRef(element);
        }
        else {
            innerRef.current = element;
        }
    }

    const handleSessionConfirm = (sessionObject) => {
        const { innerRef } = props;

        setPropsRetrieved({ ...sessionObject.props })
        if (((innerRef && innerRef.current) || webchatRef.updateRules) && sessionObject.props && sessionObject.props.rules) {
            setTimeout(() => {
                if (innerRef && innerRef.current) {
                    innerRef.current.updateRules(sessionObject.props.rules);
                }
                else {
                    webchatRef.updateRules(sessionObject.props.rules);
                }
            }, 100);
            setRulesApplied(true)
        }
    }

    if (withRules === undefined) {
        withRules = true;
    }
    let propsToApply = {};
    if (propsRetrieved) propsToApply = propsRetrieved;
    delete propsToApply.rules;

    return (
        <div
            style={{ display: propsRetrieved ? undefined : 'none' }}
            className={
                props.embedded || (propsToApply && propsToApply.embedded)
                    ? 'rw-pro-widget-embedded'
                    : ''
            }
        >
            <RasaWebchatPro
                ref={setRef}
                {...{
                    ...propsToApply,
                    ...props,
                }}
                onSocketEvent={
                    withRules
                        ? {
                            session_confirm: handleSessionConfirm,
                            ...onSocketEvent,
                        }
                        : { ...onSocketEvent }
                }
            />
        </div>
    );
}

export default React.forwardRef((props, ref) => {

    const defaultProps = {
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
        embedded: false,
        params: {
            storage: 'local',
        },
        docViewer: false,
        showCloseButton: true,
        showFullScreenButton: false,
        displayUnreadCount: false,
        showMessageDate: false,
        customMessageDelay: (message) => {
            let delay = message.length * 10;
            if (delay > 2000) delay = 2000;
            if (delay < 800) delay = 800;
            return delay;
        },
        tooltipHeader: null,
        tooltipText: null,
        tooltipSuggestions: null,
        tooltipPayload: null,
        tooltipDelay: 500,
        iconSpinFrequence: 10000,
        iconSpinNoTooltip: true,
        withRules: true,
        rules: null,
        triggerEventListenerUpdateRate: 500,
        ...props
    }

    return (
        <h1>Hello</h1>
    )

    // return (
    //     <RasaWebchatProWithRules innerRef={ref} {...defaultProps} />
    // )
});

export const selfMount = (props, element = null) => {
    const load = () => {
        if (element === null) {
            const node = document.createElement('div');
            node.setAttribute('id', 'rasaWebchatPro');
            document.body.appendChild(node);
        }
        const mountElement = element || document.getElementById('rasaWebchatPro');
        const webchatPro = React.createElement(RasaWebchatProWithRules, props);
        ReactDOM.render(webchatPro, mountElement);
    };
    if (document.readyState === 'complete') {
        load();
    } else {
        window.addEventListener('load', () => {
            load();
        });
    }
};
