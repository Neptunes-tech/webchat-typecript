import React, { PureComponent } from 'react';
import ReactMarkdown from 'react-markdown';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { PROP_TYPES } from '../../../../../../../../constants';
import DocViewer from '../docViewer';
import './styles.scss';
import ThemeContext from '../../../../../../ThemeContext';

class Message extends PureComponent {
    static propTypes: { message: Requireable<any>; docViewer: PropTypes.Requireable<boolean>; linkTarget: PropTypes.Requireable<string>; };
    static defaultTypes: { docViewer: boolean; linkTarget: string; };
    render() {
        const { docViewer, linkTarget, message }: any = this.props;
        const sender = message.get('sender');
        const text = message.get('text');
        const customCss: any =
            message.get('customCss') && message.get('customCss').toJS();

        if (customCss && customCss.style === 'class') {
            customCss.css = customCss.css.replace(/^\./, '');
        }
        // var obj: { property: string; } = { property: "foo" };
        const { userTextColor, userBackgroundColor, assistTextColor, assistBackgoundColor }: any =
            this.context;
        let style;
        if (sender === 'response' && customCss && customCss.style === 'class') {
            style = undefined;
        } else if (sender === 'response' && customCss && customCss.style) {
            let obj: { cssText: string } = { cssText: customCss.css }
            style = obj;
        } else if (sender === 'response') {
            style = { color: assistTextColor, backgroundColor: assistBackgoundColor };
        } else if (sender === 'client') {
            style = { color: userTextColor, backgroundColor: userBackgroundColor };
        }
        // let obj: { cssText: string } = { cssText: customCss.css }

        return (
            <div
                className={
                    sender === 'response' && customCss && customCss.style === 'class'
                        ? `rw-response ${customCss.css}`
                        : `rw-${sender}`
                }

            // style={style}
            >
                <div className="rw-message-text">
                    {sender === 'response' ? (
                        <ReactMarkdown
                            className={'rw-markdown'}
                            children={text}
                            linkTarget={(url) => {
                                if (!url.startsWith('mailto') && !url.startsWith('javascript'))
                                    return '_blank';
                                return undefined;
                            }}
                            transformLinkUri={null}
                            components={{
                                a: (props) =>
                                    docViewer ? (
                                        <DocViewer src={(props).href}>{props.children}</DocViewer>
                                    ) : (
                                        <a
                                            href={props.href}
                                            target={linkTarget || '_blank'}
                                            rel="noopener noreferrer"
                                            onMouseUp={(e) => e.stopPropagation()}
                                        >
                                            {props.children}
                                        </a>
                                    ),
                            }}
                        />
                    ) : (
                        text
                    )}
                </div>
            </div>
        );
    }
}

Message.contextType = ThemeContext;
Message.propTypes = {
    message: PROP_TYPES.MESSAGE,
    docViewer: PropTypes.bool,
    linkTarget: PropTypes.string,
};

Message.defaultTypes = {
    docViewer: false,
    linkTarget: '_blank',
};

const mapStateToProps = (state: any) => ({
    linkTarget: state.metadata.get('linkTarget'),
    docViewer: state.behavior.get('docViewer'),
});

export default connect(mapStateToProps)(Message as any);
 