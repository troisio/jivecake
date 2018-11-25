import * as Sentry from '@sentry/browser';
import settings from 'settings';

Sentry.init({ dsn: settings.dsn });

export Sentry;
