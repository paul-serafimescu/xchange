import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Redux from 'react-redux';
import store from './app/store';
import App from './App';


ReactDOM.render(
  <Redux.Provider store={store}>
    <App />
  </Redux.Provider>,
  document.getElementById('root')
);
