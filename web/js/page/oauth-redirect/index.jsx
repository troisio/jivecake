import React, { useContext, useEffect } from 'react';
import { NaturalSpinner } from 'web/js/component/natural-spinner';

import { T } from 'common/i18n';
import {
  ORGANIZATION_STRIPE_CONNECT,
  GET_ORGANIZATION
} from 'web/js/reducer/useFetch';

import {
  ORGANIZATION_STRIPE_CONNECT_PATH,
  ORGANIZATION_PATH
} from 'common/routes';

import {
  FetchDispatchContext,
  FetchStateContext,
  ApplicationContext
} from 'web/js/context';
import { safe } from 'web/js/helper';
import { routes } from 'web/js/routes';
import { MessageBlock, MessageBlockType } from 'web/js/component/message-block';
import { Anchor } from 'web/js/component/anchor';

import './style.scss';


export function OAuthRedirectPage() {
  const { organizationId } = useContext(ApplicationContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const fetchState = useContext(FetchStateContext);

  const organizationStripeConnectState = fetchState[ORGANIZATION_STRIPE_CONNECT];

  const loading = safe(() => organizationStripeConnectState.fetching);
  const succesfullyConnected = safe(() => organizationStripeConnectState.response.ok);
  const connectionFailure = safe(() => !organizationStripeConnectState.response.ok);

  useEffect(() => {
    return () => {
      dispatchFetchDelete([ORGANIZATION_STRIPE_CONNECT, GET_ORGANIZATION]);
    };
  }, []);

  useEffect(() => {
    if (!organizationId) {
      return;
    }

    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    if (code) {
      dispatchFetch([ORGANIZATION_STRIPE_CONNECT_PATH, organizationId, code], {}, ORGANIZATION_STRIPE_CONNECT);
    }
  }, [ organizationId ]);

  useEffect(() => {
    if (succesfullyConnected) {
      dispatchFetch([ORGANIZATION_PATH, organizationId], {}, GET_ORGANIZATION);
    }
  }, [ organizationStripeConnectState, succesfullyConnected ]);

  return (
    <div styleName='root'>
      {loading && <NaturalSpinner />}
      {
        succesfullyConnected &&
          <MessageBlock type={MessageBlockType.success}>
            {T('Your Stripe account is connected')}
          </MessageBlock>
      }
      { connectionFailure &&
        <MessageBlock type={MessageBlockType.error}>
          {T('Sorry, we are not able to connect to your Stripe account')}
        </MessageBlock>
      }
      {
        !loading && <Anchor button to={routes.organizationPersist(organizationId)}>
          {T('Back to my organization')}
        </Anchor>
      }
    </div>
  );
}
