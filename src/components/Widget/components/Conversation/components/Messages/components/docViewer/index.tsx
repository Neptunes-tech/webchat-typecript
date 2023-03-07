import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Portal from '../../../../../../../../utils/portal';
import './style.scss';

class DocViewer extends Component {
  static propTypes: { src: PropTypes.Validator<string>; };
  iframe: any;
  constructor() {
    super(null as any,null as any);
    this.iframeLoaded = this.iframeLoaded.bind(this);
    this.updateIframeSrc = this.updateIframeSrc.bind(this);
    this.handleOpenModal = this.handleOpenModal.bind(this);
    this.handleCloseModal = this.handleCloseModal.bind(this);
    this.state = {
      openedModal: false,
      iFrameLoading: true
    };
  }

  getIframeLink() {
    return `https://docs.google.com/viewer?url=${(this as any).props.src}&embedded=true`;
  }

  iframeLoaded() {
    clearInterval((this as any).iframeTimeoutId);
    this.setState({ iFrameLoading: false });
  }
  iframeTimeoutId(iframeTimeoutId: any) {
    throw new Error('Method not implemented.');
  }

  bindActions() {
    this.iframeLoaded = this.iframeLoaded.bind(this);
  }

  updateIframeSrc() {
    if (this.iframe) this.iframe.src = this.getIframeLink();
    else clearInterval((this as any).iframeTimeoutId);
  }

  handleOpenModal() {
    this.setState({ openedModal: true });
    (this as any).iframeTimeoutId = setInterval(this.updateIframeSrc, 1000 * 4);
  }

  handleCloseModal() {
    this.setState({ openedModal: false, iFrameLoading: true });
  }

  render() {
    const iframeSrc = this.getIframeLink();

    return (
      <span>
        <button onClick={this.handleOpenModal} className="rw-doc-viewer-open-modal-link">
          {(this as any).props.children}
        </button>
        {(this as any).state.openedModal && (
          <Portal>
            <div className="rw-doc-viewer-modal-fade" aria-hidden="true" onClick={this.handleCloseModal} />
            <div className="rw-doc-viewer-modal">
              <div className="rw-doc-viewer-modal-body">
                {(this as any).state.iFrameLoading && <div className="rw-doc-viewer-spinner" />}
                <iframe
                  src={iframeSrc}
                  title="viewer"
                  className="rw-doc-viewer-modal-iframe"
                  onLoad={this.iframeLoaded}
                  onError={this.updateIframeSrc}
                  ref={(iframe) => {
                    this.iframe = iframe;
                  }}
                />
              </div>
              <div className="rw-doc-viewer-modal-footer">
                <button type="button" className="rw-doc-viewer-close-modal" onClick={this.handleCloseModal}>
                  X
                </button>
              </div>
            </div>
          </Portal>
        )}
      </span>
    );
  }
}

DocViewer.propTypes = {
  src: PropTypes.string.isRequired
};

export default (DocViewer as any);
