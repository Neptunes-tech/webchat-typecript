/* eslint-disable jsx-a11y/no-static-element-interactions */
import React, { useState, useEffect, useContext, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch, useSelector } from 'react-redux';
import { Map } from 'immutable';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { usePopper } from 'react-popper';
import Slider from 'react-slick';
// slick carousel fonts kaputt und werden derzeit nicht benutzt
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';
import Typewriter from 'typewriter-effect';

import { MESSAGES_TYPES } from '../../../../constants';
import { Image, Buttons, Message } from '../Conversation/components/Messages/components';
import { showTooltip as showTooltipAction, emitUserMessage, tooltipDismissed } from '../../../../store/actions';
import { onRemove } from '../../../../utils/dom';
import openLauncher from '../../../../assets/launcher_button.png';
import closeIcon from '../../../../assets/clear-button-grey.svg';
import close from '../../../../assets/clear-button.svg';
import Badge from './components/Badge';
import ChatIndicator from './components/ChatIndicator';
import { safeQuerySelectorAll } from '../../../../utils/dom';
import './style.scss';
import ThemeContext from '../../ThemeContext';

const Launcher = ({
    toggle,
    isChatOpen,
    badge,
    fullScreenMode,
    openLauncherImage,
    closeImage,
    // unreadCount,
    displayUnreadCount,
    lastMessages,
    tooltipHeader,
    tooltipText,
    tooltipSuggestions,
    iconSpinFrequence,
    iconSpinNoTooltip,
    chatIndicator,
    tooltipDisabled
}: any) => {
    const { mainColor, assistBackgoundColor } = useContext(ThemeContext);

    const [referenceElement, setReferenceElement] = useState(null);

    const [newChatIndicator, setNewChatIndicator] = useState(true)
    const dispatch = useDispatch()
    const closeTooltip = () => {
        dispatch(showTooltipAction(false));
        dispatch(tooltipDismissed(true));
    }
    const sendPayload = (payload: any) => dispatch(emitUserMessage(payload))



    let unreadCount = useSelector((state: any) => state.behavior.get('unreadCount') || 0)
    let showTooltip = useSelector((state: any) => state.metadata.get('showTooltip'))
    let linkTarget = useSelector((state: any) => state.metadata.get('linkTarget'))
    let lastUserMessage: any = useSelector((state: any) => {
        (function getLastUserMessage() {
            if (!state.messages) return false;
            let index = -1;
            while (index > -10) {
                const lastMessage = state.messages.get(index);
                if (lastMessage) {
                    if (lastMessage.get('sender') === 'client') return lastMessage;
                } else {
                    return false;
                }
                index -= 1;
            }
            return false;
        })()
    })
    let domHighlight = useSelector((state: any) => state.metadata.get('domHighlight'))



    useEffect(() => {
        const setReference = (selector: any) => {
            const reference = safeQuerySelectorAll(selector);
            if (reference && reference.length === 1) {
                onRemove(reference[0], () => setReferenceElement(null));
                setReferenceElement(reference[0]);
            } else {
                setReferenceElement(null);
            }
        };
        if (lastUserMessage && lastUserMessage.get('nextMessageIsTooltip')) {
            setReference(lastUserMessage.get('nextMessageIsTooltip'));
        } else if (domHighlight && domHighlight.get('selector')) {
            setReference(domHighlight.get('selector'));
        } else {
            setReferenceElement(null);
        }
    }, [lastUserMessage, domHighlight]);

    const [popperElement, setPopperElement] = useState(null as any);
    const [arrowElement, setArrowElement] = useState(null as any);

    const { styles, attributes } = usePopper(referenceElement, popperElement, {
        modifiers: [
            // The arrow padding ensures it never get on the border where it looks ugly
            { name: 'arrow', options: { element: arrowElement, padding: 5 } },
            {
                name: 'preventOverflow',
                options: {
                    padding: 15, // 0 by default
                },
            },
        ],
        placement: (domHighlight && domHighlight.get('tooltipPlacement')) || 'auto',
    });

    let tooltipMessage = /* new */ Map();
    if (tooltipText) {
        tooltipMessage =/* new */  Map({
            any: MESSAGES_TYPES.TEXT,
            sender: 'response',
            text: tooltipText,
        });
    }

    const iconSpinnerDelay = iconSpinFrequence;
    const [animationClass, setAnimationClass] = useState('rw-rotation-half');

    const updateSuggestion = () => {
        if (iconSpinNoTooltip || showTooltip) {
            setAnimationClass('rw-rotation-full');
            setTimeout(() => {
                setAnimationClass('');
            }, 975);
        }
    };

    useEffect(() => {
        if (animationClass === 'rw-rotation-half') {
            setAnimationClass('');
        }
        if (iconSpinnerDelay >= 1000) {
            const intervalID = setInterval(updateSuggestion, iconSpinnerDelay);
            return () => {
                clearInterval(intervalID);
            };
        }
    }, [updateSuggestion]);

    const className = ['rw-launcher'];

    const sliderSettings = {
        dots: true,
        infinite: false,
        adaptiveHeight: true,
    };
    const lastMessage = lastMessages ? lastMessages.slice(-1)[0] : /* new */ Map();
    // This is used to distinguish bw drag and click events in the tooltips sequences.
    const dragStatus = useRef({
        x: 0,
        y: 0,
    });

    if (isChatOpen) className.push('rw-hide-sm');
    if (fullScreenMode && isChatOpen) className.push('rw-full-screen rw-hide');

    const getComponentToRender = (message: any, buttonSeparator = false) => {
        const ComponentToRender: any = (() => {
            switch (message.get('type')) {
                case MESSAGES_TYPES.TEXT: {
                    return Message;
                }
                case MESSAGES_TYPES.IMGREPLY.IMAGE: {
                    return Image;
                }
                case MESSAGES_TYPES.BUTTONS: {
                    return Buttons;
                }
                default:
                    return null;
            }
        })();
        if (ComponentToRender) {
            return (
                <ComponentToRender
                    separateButtons={buttonSeparator}
                    id={-1}
                    params={{}}
                    message={message}
                    isLast
                />
            );
        }
        toggle(); // open the chat if the tooltip do not know how to display the compoment
    };

    const renderSequenceTooltip = (lastMessagesSeq: any) => (
        <div className="rw-slider-safe-zone" onClick={(e) => e.stopPropagation()}>
            <Slider {...sliderSettings}>
                {lastMessagesSeq.map((message: any) => (
                    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                    <div
                        className="rw-tooltip-response"
                        onMouseDown={(event) => {
                            dragStatus.current.x = event.clientX;
                            dragStatus.current.y = event.clientY;
                        }}
                        onMouseUp={(event) => {
                            if (
                                Math.abs(dragStatus.current.x - event.clientX) +
                                Math.abs(dragStatus.current.y - event.clientY) <
                                15
                            ) {
                                toggle();
                            }
                        }}
                    >
                        {getComponentToRender(message)}
                    </div>
                ))}
            </Slider>
        </div>
    );

    const renderTooltipContent = () => (
        <React.Fragment>
            <div className="rw-tooltip-header">
                <p className="tooltip-header">{tooltipHeader}</p>
                <div className="rw-tooltip-close">
                    <button
                        onClick={(e) => {
                            /* stop the propagation because the popup is also a button
                               otherwise it would open the webchat when closing the tooltip */
                            e.stopPropagation();

                            const payload = domHighlight.get('tooltipClose');
                            if (domHighlight && payload) {
                                sendPayload(`/${payload}`);
                            }
                            closeTooltip();
                        }}
                    >
                        <img src={closeIcon} alt="close" />
                    </button>
                </div>
            </div>

            {(tooltipMessage.size > 0 && tooltipSuggestions && (
                <div onMouseUp={() => toggle()}>
                    <p className="rw-dynamic-text">{tooltipText}</p>
                    <p className="rw-dynamic-suggestions">
                        <Typewriter
                            options={{
                                strings: tooltipSuggestions,
                                autoStart: true,
                                delay: 50,
                                deleteSpeed: 25,
                                // pauseFor: 3000,
                                loop: true,
                                cursor: '',
                                wrapperClassName: 'rw-textwriter-effect',
                            }}
                        />
                    </p>
                </div>
            )) ||
                (tooltipMessage.size > 0 && (
                    <div onMouseUp={() => toggle()}>
                        {getComponentToRender(tooltipMessage, true)}
                    </div>
                )) ||
                (lastMessages.length === 1 && (
                    <div onMouseUp={() => toggle()}>
                        {getComponentToRender(lastMessages[0], true)}
                    </div>
                )) ||
                renderSequenceTooltip(lastMessages)}
        </React.Fragment>
    );

    const renderPlacedTooltip = () => (
        <div
            className="rw-tooltip-body"
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
        >
            {renderTooltipContent()}
            <div
                className="rw-tooltip-decoration rw-popper-arrow"
                ref={setArrowElement}
                style={styles.arrow}
            />
        </div>
    );

    const renderToolTip = () => (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <div
            className="rw-tooltip-body"
            style={{ backgroundColor: assistBackgoundColor }}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            {renderTooltipContent()}
            <div
                className="rw-tooltip-decoration"
                style={{ backgroundColor: assistBackgoundColor }}
            />
        </div>
    );

    const renderOpenLauncherImage = () => (
        <div className="rw-open-launcher__container">
            {unreadCount > 0 && displayUnreadCount && (
                <div className="rw-unread-count-pastille">{unreadCount}</div>
            )}
            <div className="rw-closing-animation">
                <img
                    src={openLauncherImage || openLauncher}
                    className={`rw-open-launcher ${animationClass}`}
                    alt=""
                />
            </div>
            {!tooltipDisabled && showTooltip &&
                (tooltipText || (lastMessage && lastMessage.get('sender') === 'response')) &&
                (referenceElement ? renderPlacedTooltip() : renderToolTip())}
        </div>
    );

    return (
        <button
            type="button"
            style={{ backgroundColor: mainColor }}
            className={className.join(' ')}
            onClick={(e) => { toggle(); setNewChatIndicator(false); }}
        >
            <Badge badge={badge} />
            {chatIndicator && newChatIndicator && !isChatOpen && <ChatIndicator />}
            {isChatOpen ? (
                <img
                    src={closeImage || close}
                    className={`rw-close-launcher ${closeImage ? '' : 'rw-default'}`}
                    alt=""
                />
            ) : (
                renderOpenLauncherImage()
            )}

        </button>
    );
};

// Launcher.propTypes = {
//     toggle: PropTypes.func,
//     isChatOpen: PropTypes.bool,
//     badge: PropTypes.number,
//     fullScreenMode: PropTypes.bool,
//     openLauncherImage: PropTypes.string,
//     closeImage: PropTypes.string,
//     unreadCount: PropTypes.number,
//     displayUnreadCount: PropTypes.bool,
//     showTooltip: PropTypes.bool,
//     lastUserMessage: PropTypes.oneOfType([ImmutablePropTypes.map, PropTypes.bool]),
//     domHighlight: PropTypes.shape({}),
//     lastMessages: PropTypes.arrayOf(ImmutablePropTypes.map),
//     chatIndicator: PropTypes.bool,
//     tooltipDisabled: PropTypes.bool
// };


// const mapDispatchToProps = (dispatch: any) => ({
//     closeTooltip: () => {
//         dispatch(showTooltipAction(false));
//         dispatch(tooltipDismissed(true));
//     },
//     sendPayload: (payload: any) => dispatch(emitUserMessage(payload)),
// });

export default (Launcher as any);