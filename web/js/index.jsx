import React from 'react';
import ReactDOM from 'react-dom';
import URLSearchParams from '@ungap/url-search-params';
import 'js/Sentry';

import { Root } from 'js/page/root';

if (!window.URLSearchParams) {
  window.URLSearchParams = URLSearchParams;
}

ReactDOM.render(
  <Root />,
  document.querySelector('.jivecakeroot'),
);
