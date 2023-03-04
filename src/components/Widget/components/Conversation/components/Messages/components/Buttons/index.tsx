import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { PROP_TYPES } from '../../../../../../../../constants';
import { addUserMessage, emitUserMessage, setButtons, toggleInputDisabled } from '../../../../../../../../store/actions';
import Message from '../Message/index';

import './styles.scss';
import ThemeContext from '../../../../../../ThemeContext';


class Buttons extends PureComponent {
  static propTypes: { src: PropTypes.Validator<string>; };
  constructor(props: any) {
    super(props);
    this.handleClick = this.handleClick.bind(this);

    const {
      message,
      getChosenReply,
      inputState,
      id
    }: any = this.props;

    const hint = message.get('hint');
    const chosenReply = getChosenReply(id);
    if (!chosenReply && !inputState) {
      // this.props.toggleInputDisabled();
    }
  }

  handleClick(reply: any) {
    const {
      chooseReply,
      id
    }: any = this.props;

    const payload = reply.get('payload');
    const title = reply.get('title');
    chooseReply(payload, title, id);
  }

  renderButtons(message: string, buttons: any, persit: any) {
    const { isLast, linkTarget, separateButtons
    }: any = this.props;
    const { userTextColor, userBackgroundColor }: any = this.context;
    const buttonStyle = {
      color: userTextColor,
      backgroundColor: userBackgroundColor,
      borderColor: userBackgroundColor
    };
    return (
      <div>
        <Message message={message} />
        {separateButtons && (<div className="rw-separator" />)}
        {(isLast || persit) && (
          <div className="rw-replies">
            {buttons.map((reply: any, index: any) => {
              if (reply.get('type') === 'web_url') {
                return (
                  <a
                    key={index}
                    href={reply.get('url')}
                    target={linkTarget || '_blank'}
                    rel="noopener noreferrer"
                    className={'rw-reply'}
                    style={buttonStyle}
                    onMouseUp={e => e.stopPropagation()}
                  >
                    {reply.get('title')}
                  </a>
                );
              }
              return (
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                <div
                  key={index}
                  className={'rw-reply'}
                  onClick={(e) => { e.stopPropagation(); this.handleClick(reply); }}
                  style={buttonStyle}
                  onMouseUp={e => e.stopPropagation()}
                >
                  {reply.get('title')}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }


  render() {
    const {
      message,
      getChosenReply,
      id
    }: any = this.props;
    const chosenReply = getChosenReply(id);
    if (message.get('quick_replies') !== undefined) {
      const buttons = message.get('quick_replies');
      if (chosenReply) {
        return <Message message={message} />;
      }
      return this.renderButtons(message, buttons, false);
    } else if (message.get('buttons') !== undefined) {
      const buttons = message.get('buttons');
      return this.renderButtons(message, buttons, true);
    }
    return <Message message={message} />;
  }
}

Buttons.contextType = ThemeContext;

const mapStateToProps = (state:any) => ({
  getChosenReply: (id:any) => state.messages.get(id).get('chosenReply'),
  inputState: state.behavior.get('disabledInput'),
  linkTarget: state.metadata.get('linkTarget')
});

const mapDispatchToProps = (dispatch:any) => ({
  toggleInputDisabled: () => dispatch(toggleInputDisabled(null)),
  chooseReply: (payload:any, title:any, id:any) => {
    dispatch(setButtons(id, title));
    dispatch(addUserMessage(title));
    dispatch(emitUserMessage(payload));
    // dispatch(toggleInputDisabled());
  }
});

Buttons.propTypes = {
  getChosenReply: PropTypes.func,
  chooseReply: PropTypes.func,
  id: PropTypes.number,
  isLast: PropTypes.bool,
  message: PROP_TYPES.BUTTONS,
  linkTarget: PropTypes.string
};

export default connect(mapStateToProps, mapDispatchToProps)(Buttons);
