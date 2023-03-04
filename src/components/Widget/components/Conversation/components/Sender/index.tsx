import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import TextareaAutosize from 'react-textarea-autosize';
import { isMobile } from 'react-device-detect';
import Send from '../../../../../../assets/send_button';
import './style.scss';

const Sender = ({ sendMessage, inputTextFieldHint, disabledInput, userInput }:any) => {
    const [inputValue, setInputValue] = useState('');
    const formRef = useRef('');
    function handleChange(e:any) {
        setInputValue(e.target.value);
    }

    function handleSend() {
        sendMessage(inputValue);
        setInputValue('');
    }

    function handleSubmit(e:any) {
        e.preventDefault();
        handleSend();
    }

    function onEnterPress(e:any) {
        if (e.keyCode === 13 && e.shiftKey === false) {
            e.preventDefault();
            handleSend();
        }
    }
    return userInput === 'hide' ? (
        <div />
    ) : (
        <form ref={formRef} className="rw-sender" onSubmit={handleSubmit}>
            <TextareaAutosize
                type="text"
                minRows={1}
                onKeyDown={onEnterPress}
                maxRows={3}
                onChange={handleChange}
                className="rw-new-message"
                name="message"
                placeholder={inputTextFieldHint}
                disabled={disabledInput || userInput === 'disable'}
                autoFocus={isMobile ? false : true}
                autoComplete="off"
                value={inputValue}
            />
            <button
                type="submit"
                className="rw-send"
                disabled={!(inputValue && inputValue.length > 0)}
            >
                <Send
                    className="rw-send-icon"
                    ready={!!(inputValue && inputValue.length > 0)}
                    alt="send"
                />
            </button>
        </form>
    );
};
const mapStateToProps = (state:any) => ({
    userInput: state.metadata.get('userInput'),
});

Sender.propTypes = {
    sendMessage: PropTypes.func,
    inputTextFieldHint: PropTypes.string,
    disabledInput: PropTypes.bool,
    userInput: PropTypes.string,
};

export default connect(mapStateToProps)(Sender);
