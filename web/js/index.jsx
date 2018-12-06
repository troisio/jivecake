import React from 'react';
import ReactDOM from 'react-dom';
import { fetch as fetchPolyfill } from 'whatwg-fetch'
import URLSearchParams from 'url-search-params';
import 'js/Sentry';

import { Application } from 'js/page/application';

if (!window.fetch) {
  window.fetch = fetchPolyfill;
}

if (!window.URLSearchParams) {
  window.URLSearchParams = URLSearchParams;
}

ReactDOM.render(
  <Application />,
  document.querySelector('.jivecakeroot'),
);
