import React, { useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import {
  USER_TRANSACTIONS_PATH,
  ITEM_PATH
} from 'common/routes';

import './style.scss';

import { NaturalSpinner } from 'web/js/component/natural-spinner';
import { Button } from 'web/js/component/button';
import { Pagination } from 'web/js/component/pagination';
import { safe } from 'web/js/helper';
import { SEE_MORE } from 'web/js/helper/text';
import {
  FetchDispatchContext,
  FetchStateContext,
  UserTransactionsContext,
  TransactionContext,
  ItemContext
} from 'web/js/context';
import {
  GET_USER_TRANSACTIONS,
  GET_ITEM
} from 'web/js/reducer/useFetch';

export function UserTransactionsComponent({ match: { params: { userId } } }) {
  const transactionsMap = useContext(TransactionContext);
  const itemsMap = useContext(ItemContext);
  const userTransactionsMap = useContext(UserTransactionsContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const fetchState = useContext(FetchStateContext);

  const getUserTransactionsState = fetchState[GET_USER_TRANSACTIONS];
  const userTransactionsPagination = userTransactionsMap[userId];
  const loading = safe(() => getUserTransactionsState.fetching);

  const renderTransaction = (id) => {
    const transaction = transactionsMap[id];

    const items = transaction.items
      .filter(({ _id }) => itemsMap[_id])
      .map(({ _id }) => {
        const item = itemsMap[_id];
        return item.name;
      });

    return (
      <div>
        {items.join(', ')}
      </div>
    );
  };
  const getNextPage = (page) => {
    if (loading) {
      return;
    }

    const nextPage = typeof page === 'undefined' ? userTransactionsPagination.pages.length : page;

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

  useEffect(() => {
    getNextPage(0);

    return () => {
      dispatchFetchDelete([
        GET_USER_TRANSACTIONS,
        GET_ITEM
      ]);
    };
  }, []);

  useEffect(() => {
    if (userTransactionsPagination) {
      const itemIdsNotInStore = userTransactionsPagination.pages
        .flat()
        .filter(id => transactionsMap[id])
        .map(id => transactionsMap[id].items)
        .flat()
        .filter(({ _id }) => !itemsMap[_id])
        .map(({ _id }) => _id);

      for (const itemId of new Set(itemIdsNotInStore)) {
        dispatchFetch([ITEM_PATH, itemId], {}, GET_ITEM);
      }
    }
  }, [ userTransactionsPagination ]);

  return (
    <div styleName='root'>
      {
        userTransactionsPagination &&
          <Pagination
            value={userTransactionsPagination}
            render={renderTransaction}
            more={
              <Button loading={loading} styleName='see-more' onClick={() => getNextPage()} type='button'>
                {SEE_MORE}
              </Button>
            }
          />
      }
      {loading && !userTransactionsPagination && <NaturalSpinner />}
    </div>
  );
}

UserTransactionsComponent.propTypes = {
  match: PropTypes.object.isRequired
};

export const UserTransactions = withRouter(UserTransactionsComponent);
