// import React, { PureComponent } from 'react';
// import { PROP_TYPES } from '../../../../../../../../constants';

// import './styles.scss';

// class Snippet extends PureComponent {
//   render() {
//     return (
//       <div className="rw-snippet">
//         <b className="rw-snippet-title">
//           { this.props.message.get('title') }
//         </b>
//         <div className="rw-snippet-details">
//           <a href={this.props.message.get('link')} target={this.props.message.get('target')} className="rw-link">
//             { this.props.message.get('content') }
//           </a>
//         </div>
//       </div>
//     );
//   }
// }

// Snippet.propTypes = {
//   message: PROP_TYPES.SNIPPET
// };

// export default Snippet;


import React, { PureComponent } from 'react';
import { PROP_TYPES } from '../../../../../../../../constants';

import './styles.scss';

const Snippet = (props: any) => {
  const { message }: any = props
  return (
    <div className="rw-snippet" >
      <b className="rw-snippet-title">
        {message.get('title')}
      </b>
      <div className="rw-snippet-details">
        <a href={message.get('link')} target={message.get('target')} className="rw-link">
          {message.get('content')}
        </a>
      </div>
    </div>
  );
}

export default Snippet;



