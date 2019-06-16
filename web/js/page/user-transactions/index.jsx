import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { USER_TRANSACTIONS_PATH } from 'common/routes';

import { SEE_MORE  } from 'web/js/helper/text';
import { Button } from 'web/js/component/button';
import { Pagination } from 'web/js/component/pagination';
import './style.scss';

import { safe } from 'web/js/helper';
import {
  FetchDispatchContext,
  FetchStateContext,
  TransactionContext
} from 'web/js/context';
import {
  GET_USER_TRANSACTIONS
} from 'web/js/reducer/useFetch';

export function UserTransactionsComponent({ match: { params: { userId } } }) {
  const transactionsMap = useContext(TransactionContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const fetchState = useContext(FetchStateContext);

  const getUserTransactionsState = fetchState[GET_USER_TRANSACTIONS];

  const organizationEventsPagination = getUserTransactionsState[userId];
  const isFetchingMore = safe(() => getUserTransactionsState.fetching);
  const getNextPage = (page) => {
    if (isFetchingMore) {
      return;
    }

    const nextPage = typeof page === 'undefined' ? organizationEventsPagination.pages.length : page;

    dispatchFetch(
      [USER_TRANSACTIONS_PATH, userId],
      {
        query: {
          page: nextPage,
        }
      },
      GET_USER_TRANSACTIONS
    );
  };

  const renderEvent = id => {
    const user = transactionsMap[id];

    return (
      <div styleName='row' key={id}>
        <span styleName='email'>{user.email}</span>
      </div>
    );
  };

  useEffect(() => {
    return () => {
      dispatchFetchDelete([
        GET_USER_TRANSACTIONS
      ]);
    };
  }, []);

  useEffect(() => {
    if (userId) {
      getNextPage(0);
    }
  }, [ userId ]);

  return (
    <div styleName='root'>
      {
        organizationEventsPagination &&
        <div styleName='pagination'>
          <Pagination
            value={organizationEventsPagination}
            render={renderEvent}
            more={
              <Button loading={isFetchingMore} styleName='see-more' onClick={() => getNextPage()} type='button'>
                {SEE_MORE}
              </Button>
            }
          />
        </div>
      }
    </div>
  );
}

UserTransactionsComponent.propTypes = {
  match: PropTypes.object.isRequired
};

export const UserTransactions = withRouter(UserTransactionsComponent);
