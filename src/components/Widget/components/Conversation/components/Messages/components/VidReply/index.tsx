// import React, { PureComponent } from 'react';
// import { PROP_TYPES } from '../../../../../../../../constants';

// import './styles.scss';

// class VidReply extends PureComponent {
//   render() {
//     return (
//       <div className="rw-video">
//         <b className="rw-video-title">
//           { this.props.message.get('title') }
//         </b>
//         <div className="rw-video-details">
//           <iframe src={this.props.message.get('video')} className="rw-videoFrame" />
//         </div>
//       </div>
//     );
//   }
// }

// VidReply.propTypes = {
//   message: PROP_TYPES.VIDREPLY
// };

// export default VidReply;


import React from 'react';

import './styles.scss';

const VidReply = (props: any) => {
  const { message }: any = props

  return (
    <div className="rw-video">
      <b className="rw-video-title">
        {message.get('title')}
      </b>
      <div className="rw-video-details">
        <iframe src={message.get('video')} className="rw-videoFrame" />
      </div>
    </div>
  );
}

export default VidReply;
