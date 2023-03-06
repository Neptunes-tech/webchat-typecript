import React, { useRef, useState, useContext } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { addUserMessage, emitUserMessage } from '../../../../../../../../store/actions';
import { PROP_TYPES } from '../../../../../../../../constants';
import Arrow from '../../../../../../../../assets/arrow'
import ThemeContext from '../../../../../../ThemeContext'

import './styles.scss'

const Carousel = (props: any) => {
  const carousel = props.message.toJS()

  const handleClick = (action: any) => {
    if (!action || action.type !== 'postback') return
    const { chooseReply } = props;
    chooseReply(action.payload, action.title);
  };

  const scrollContainer = useRef(null as any);
  const [leftButton, setLeftButton] = useState(false);
  const [rightButton, setRightButton] = useState(true);
  const { mainColor, assistTextColor } = useContext(ThemeContext);


  const handleScroll = () => {
    const current = scrollContainer.current;
    if ((current as any).scrollLeft > 0) {
      setLeftButton(true);
    } else {
      setLeftButton(false);
    }
    if ((current as any).clientWidth === (current as any).scrollWidth - (current as any).scrollLeft) {
      setRightButton(false);
    } else {
      setRightButton(true);
    }
  };

  const handleLeftArrow = () => {
    (scrollContainer as any).current.scrollTo({
      left: (scrollContainer as any).current.scrollLeft - 230,
      behavior: 'smooth'
    });
  };

  const handleRightArrow = () => {
    (scrollContainer as any).current.scrollTo({
      left: (scrollContainer as any).current.scrollLeft + 230,
      behavior: 'smooth'
    });
  };

  const { linkTarget } = props;

  return (
    <React.Fragment>
      <div className="rw-carousel-container" ref={scrollContainer} onScroll={() => handleScroll()}>
        {carousel.elements.map((carouselCard: any, index: number) => {
          const defaultActionUrl =
            carouselCard.default_action && carouselCard.default_action.type === 'web_url'
              ? carouselCard.default_action.url
              : null;
          return (
            <div className="rw-carousel-card" key={index}>
              <a
                href={defaultActionUrl}
                target={linkTarget || '_blank'}
                rel="noopener noreferrer"
                onClick={() => handleClick(carouselCard.default_action)}
              >
                {carouselCard.image_url ? (
                  <img
                    className="rw-carousel-card-image"
                    src={carouselCard.image_url}
                    alt={`${carouselCard.title} ${carouselCard.subtitle}}}`}
                  />
                ) : (
                  <div className="rw-carousel-card-image" />
                )}
              </a>
              <a
                className="rw-carousel-card-title"
                href={defaultActionUrl}
                target={linkTarget || '_blank'}
                rel="noopener noreferrer"
                onClick={() => handleClick(carouselCard.default_action)}
                style={{ color: assistTextColor }}
              >
                {carouselCard.title}
              </a>
              <a
                className="rw-carousel-card-subtitle"
                href={defaultActionUrl}
                target={linkTarget || '_blank'}
                rel="noopener noreferrer"
                onClick={() => handleClick(carouselCard.default_action)}
                style={{ color: assistTextColor }}
              >
                {carouselCard.subtitle}
              </a>
              <div className="rw-carousel-buttons-container">
                {carouselCard.buttons.map((button: any, buttonIndex: any) => {
                  if (button.type === 'web_url') {
                    return (
                      <a
                        key={buttonIndex}
                        href={button.url}
                        target={linkTarget || '_blank'}
                        rel="noopener noreferrer"
                        className="rw-reply"
                        style={{ borderColor: mainColor, color: mainColor }}
                      >
                        <span>{button.title}</span>
                      </a>
                    );
                  }
                  return (
                    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
                    <div
                      key={buttonIndex}
                      className="rw-reply"
                      onClick={() => handleClick(button)}
                      role="button"
                      tabIndex={0}
                      style={{ borderColor: mainColor, color: mainColor }}
                    >
                      <span>{button.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="rw-carousel-arrows-container">
        {leftButton && (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <div
            className="rw-left-arrow rw-carousel-arrow"
            onClick={handleLeftArrow}
            role="button"
            tabIndex={0}
          >
            <div className="rw-arrow" ><Arrow /></div>
          </div>
        )}
        {rightButton && (
          // eslint-disable-next-line jsx-a11y/no-static-element-interactions
          <div
            className="rw-right-arrow rw-carousel-arrow"
            onClick={handleRightArrow}
            role="button"
            tabIndex={0}
          >
            <div className="rw-arrow"><Arrow /></div>
          </div>
        )}
      </div>
    </React.Fragment>
  );
};


Carousel.propTypes = {
  message: PROP_TYPES.CAROUSEL,
  // completely bugged, it's actually used in handle click
  // eslint-disable-next-line react/no-unused-prop-types
  chooseReply: PropTypes.func.isRequired,
  linkTarget: PropTypes.string
};

const mapStateToProps = (state: any) => ({
  linkTarget: state.metadata.get('linkTarget')
});

const mapDispatchToProps = (dispatch: any) => ({
  chooseReply: (payload: any, title: any) => {
    if (title) dispatch(addUserMessage(title));
    dispatch(emitUserMessage(payload));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(Carousel);
