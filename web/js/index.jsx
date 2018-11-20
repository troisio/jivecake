import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/browser';

import settings from 'settings';
import { router } from 'js/router';

Sentry.init({
  dsn: settings.dsn
});

ReactDOM.render(
  document.querySelector('body > div:first-child'),
  router
);
