import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';

import close from 'assets/clear-button.svg';
import fullscreen from 'assets/fullscreen_button.svg';
import fullscreenExit from 'assets/fullscreen_exit_button.svg';
import './style.scss';
import ThemeContext from '../../../../ThemeContext';

const Header = ({
  title,
  subtitle,
  titleImage,
  fullScreenMode,
  toggleFullScreen,
  toggleChat,
  showCloseButton,
  showFullScreenButton,
  connected,
  connectingText,
  closeImage,
  profileAvatar
}) => {
  const { mainColor } = useContext(ThemeContext);
  return (
    <div className="rw-header-and-loading">
      <div style={{ backgroundColor: mainColor }}className={`rw-header ${subtitle ? 'rw-with-subtitle' : ''}`}>
        {
          profileAvatar && (
            <img src={profileAvatar} className="rw-avatar" alt="chat avatar" />
          )
        }
        <div className="rw-header-buttons">
          {
            showFullScreenButton &&
            <button className="rw-toggle-fullscreen-button" onClick={toggleFullScreen}>
              <img
                className={`rw-toggle-fullscreen ${fullScreenMode ? 'rw-fullScreenExitImage' : 'rw-fullScreenImage'}`}
                src={fullScreenMode ? fullscreenExit : fullscreen}
                alt="toggle fullscreen"
              />
            </button>
          }
          {
            showCloseButton &&
            <button className="rw-close-button" onClick={toggleChat}>
              <img
                className={`rw-close ${closeImage ? '' : 'rw-default'}`}
                src={closeImage || close}
                alt="close"
              />
            </button>
          }
        </div>
        {titleImage && <img src={titleImage} style={{margin: '20px'}} />}
        {!titleImage && <>
          <h4 className={`rw-title ${profileAvatar && 'rw-with-avatar'}`}>{title}</h4>
          {subtitle && <ReactMarkdown className={`rw-markdown subtitle-markdown ${profileAvatar && 'rw-with-avatar'}`}>{subtitle}</ReactMarkdown>}
        </>}
        </div>
      {
        !connected &&
        <span className="rw-loading">
          {connectingText}
        </span>
      }
    </div>);
};

Header.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  titleImage: PropTypes.string,
  fullScreenMode: PropTypes.bool,
  toggleFullScreen: PropTypes.func,
  toggleChat: PropTypes.func,
  showCloseButton: PropTypes.bool,
  showFullScreenButton: PropTypes.bool,
  connected: PropTypes.bool,
  connectingText: PropTypes.string,
  closeImage: PropTypes.string,
  profileAvatar: PropTypes.string
};

export default Header;
