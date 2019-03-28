import React from 'react';
import ReactDOM from 'react-dom';
import URLSearchParams from '@ungap/url-search-params';
import 'js/Sentry';

import { Application } from 'js/page/application';

if (!window.URLSearchParams) {
  window.URLSearchParams = URLSearchParams;
}

ReactDOM.render(
  <Application />,
  document.querySelector('.jivecakeroot'),
);
