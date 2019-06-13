import React, { useContext } from 'react';

import { T } from 'common/i18n';

import { safe } from 'js/helper';

import {
  ApplicationContext,
  UserContext
} from 'js/context';
import settings from 'settings';

import { Anchor } from 'component/anchor';

import './style.scss';

export function ConnectWithStripeAnchor(props) {
  const { userId } = useContext(ApplicationContext);
  const email = safe(() => UserContext[userId].email, '');
  const href = `https://connect.stripe.com/express/oauth/authorize?redirect_uri=${window.location.href}/oauth/redirect&client_id=${settings.stripe.clientId}&state=${new Date().getTime()}&stripe_user[email]=${email}`;

  return (
    <Anchor styleName='stripe-connect' href={href} { ...props }>
      <span>
        {T('Connect with Stripe')}
      </span>
    </Anchor>
  );
}
