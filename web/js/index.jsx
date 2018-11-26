import React from 'react';
import ReactDOM from 'react-dom';
import { fetch as fetchPolyfill } from 'whatwg-fetch'
import 'js/Sentry';

import { Application } from 'js/component/application';

if (!window.fetch) {
  window.fetch = fetchPolyfill;
}

ReactDOM.render(
  <Application />,
  document.querySelector('.jivecakeroot'),
);
