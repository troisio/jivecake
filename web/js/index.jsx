import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/browser';

import settings from 'settings';
import { router } from 'js/router';
import { getT } from 'common/i18n';

Sentry.init({
  dsn: settings.dsn
});

getT().then(T => {
  ReactDOM.render(
    document.querySelector('body > div:first-child'),
    <router T={T} />
  );
})

ReactDOM.render(
  document.querySelector('body > div:first-child'),
  router
);
