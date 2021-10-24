import React from 'react';
import ReactDOM from 'react-dom';
import Modal from 'react-modal';
import './styles/index.css';
import App from './App';

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById('root')
// );

const el = document.getElementById('root');
Modal.setAppElement(el);

ReactDOM.render(<App />, el);
