import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import Widget from '../index';
import RulesHandler, { RULES_HANDLER_SINGLETON } from './rules';

const RasaWebchatPro = React.memo(
  forwardRef((props: any, ref: any) => {
    const widget = useRef(null);

    const updateRules = (newRules: any) => {
      if (newRules && widget && (widget as any).current.sendMessage) {
        const handler =
          ((window as any)[RULES_HANDLER_SINGLETON] &&
            (window as any)[RULES_HANDLER_SINGLETON].updateRules(newRules)) ||
          new RulesHandler(
            newRules,
            (widget as any).current.sendMessage,
            props.triggerEventListenerUpdateRate
          );
        handler.initHandler();
        // putting it in the window object lets us do the singleton design pattern
        (window as any)[RULES_HANDLER_SINGLETON] = handler;
      }
    };

    useEffect(() => function cleanUp() {
      const handler = (window as any)[RULES_HANDLER_SINGLETON];
      if (handler && handler instanceof RulesHandler) {
        handler.cleanUp(true);
      }
    }, []);

    useImperativeHandle(ref, () => {
      return {
        sendMessage: (...args: any) => {
          (widget as any)?.current?.sendMessage(...args);
        },
        updateRules: (rules: any) => {
          updateRules(rules);
        },
        getSessionId: (widget as any)?.current?.getSessionId
      }
    });

    return <Widget ref={widget} {...{ ...props }} />;
  })
);

// RasaWebchatPro.propTypes = rasaWebchatProTypes;

// RasaWebchatPro.defaultProps = rasaWebchatProDefaultTypes;

export default RasaWebchatPro;
