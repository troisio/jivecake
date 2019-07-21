import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import {
  STRIPE_SESSION_PATH
} from 'common/routes';

import './style.scss';

import { NaturalSpinner } from 'web/js/component/natural-spinner';
import { safe } from 'web/js/helper';
import {
  FetchDispatchContext,
  FetchStateContext,
  UserContext,
  StripeSessionContext
} from 'web/js/context';
import {
  GET_STRIPE_SESSION
} from 'web/js/reducer/useFetch';

export function UserTransactionsComponent({ match: { params: { userId } } }) {
  const usersMap = useContext(UserContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const fetchState = useContext(FetchStateContext);
  const stripeSessionsMap = useContext(StripeSessionContext);

  const getStripeSession = fetchState[GET_STRIPE_SESSION];
  const loading = safe(() => getStripeSession.fetching);

  const fetchedUser = usersMap[userId];
  const stripeSessionIds = fetchedUser ? fetchedUser.stripeSessions : [];
  const stripeSessions = stripeSessionIds
    .filter(id => stripeSessionsMap[id])
    .map(id => stripeSessionsMap[id]);

  useEffect(() => {
    return () => {
      dispatchFetchDelete([
        GET_STRIPE_SESSION
      ]);
    };
  }, []);

  useEffect(() => {
    if (!fetchedUser) {
      return;
    }

    for (const sessionId of fetchedUser.stripeSessions) {
      dispatchFetch(
        [STRIPE_SESSION_PATH, sessionId],
        {},
        GET_STRIPE_SESSION
      );
    }
  }, [ fetchedUser ]);

  // need to associate stripe line items to internal item collection

  return (
    <div styleName='root'>
      {loading && <NaturalSpinner />}
      {
        stripeSessions.map(({ session, paymentIntent }) => (
          <div key={session.id}>
            {paymentIntent.status}
          </div>
        ))
      }
    </div>
  );
}

UserTransactionsComponent.propTypes = {
  match: PropTypes.object.isRequired
};

export const UserTransactions = withRouter(UserTransactionsComponent);
