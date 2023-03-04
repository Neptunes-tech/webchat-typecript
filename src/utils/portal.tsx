import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

// This should be deleted when using React 16.x,
// Use ReactDOM.createPortal() instead

const Portal = (props: any) => {
  const [portalElement, setPortalElement] = useState<any>()
  useEffect(() => {
    document.body.removeChild(portalElement)
  }, [])


  // ComponentDidMount
  useEffect(() => {
    const p = document.createElement('div');
    document.body.appendChild(p);
    setPortalElement(p);
  })

  useEffect(() => {
    ReactDOM.render(<div>{props.children}</div>, portalElement);
  })

  useEffect(() => {
    document.body.removeChild(portalElement);
  }, [])

  return null
}

export default Portal;


// class Portal extends React.Component {
//   constructor() {
//     super();
//     this.portalElement= null;
//   }

// componentDidMount() {
//   const p = document.createElement('div');
//   document.body.appendChild(p);
//   this.portalElement = p;
//   this.componentDidUpdate();
// }

//   componentDidUpdate() {
//     ReactDOM.render(<div>{this.props.children}</div>, this.portalElement);
//   }

//   componentWillUnmount() {
//     document.body.removeChild(this.portalElement);
//   }

//   render() {
//     return null;
//   }
// }

