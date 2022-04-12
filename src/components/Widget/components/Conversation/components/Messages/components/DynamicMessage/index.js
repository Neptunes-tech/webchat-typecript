import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import TypeAnimation from 'react-type-animation';

import { PROP_TYPES } from 'constants';
import './styles.scss';
import ThemeContext from '../../../../../../ThemeContext';

class DynamicMessage extends PureComponent {
    render() {
        const { docViewer, linkTarget } = this.props;
        const sender = this.props.message.get('sender');
        const text = this.props.message.get('text');
        const dynamicText = this.props.message.get('dynamicText');
        const customCss =
            this.props.message.get('customCss') && this.props.message.get('customCss').toJS();

        if (customCss && customCss.style === 'class') {
            customCss.css = customCss.css.replace(/^\./, '');
        }

        return (
            <div>
                <p className="rw-message-text">
                    <br></br>
                    {text}
                </p>
                <p className="rw-message-dynamic">
                    {dynamicText}
                    {/* <TypeAnimation
                        cursor={false}
                        sequence={[dynamicText, 3500, '', 500]}
                        wrapper="h3"
                        repeat={Infinity}
                    /> */}
                    {/* <br></br> */}
                </p>
            </div>
        );
    }
}

DynamicMessage.contextType = ThemeContext;
DynamicMessage.propTypes = {
    message: PROP_TYPES.MESSAGE,
    docViewer: PropTypes.bool,
    linkTarget: PropTypes.string,
};

DynamicMessage.defaultTypes = {
    docViewer: false,
    linkTarget: '_blank',
};

const mapStateToProps = (state) => ({
    linkTarget: state.metadata.get('linkTarget'),
    docViewer: state.behavior.get('docViewer'),
});

export default connect(mapStateToProps)(DynamicMessage);
