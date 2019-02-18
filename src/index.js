import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import "bootstrap/js/src/tooltip.js";
import "bootstrap/dist/css/bootstrap.css";
import * as serviceWorker from './serviceWorker';
import Accueil from "./accueil.js";

ReactDOM.render(<Accueil />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
