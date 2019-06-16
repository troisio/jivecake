import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';

import { T } from 'common/i18n';
import {
  EVENT_PATH,
  EVENT_ITEMS_PATH
} from 'common/routes';

import {
  EventContext,
  ItemContext,
  FetchStateContext,
  FetchDispatchContext,
  EventItemsContext
} from 'web/js/context';

import {
  GET_EVENT,
  GET_EVENT_ITEMS
} from 'web/js/reducer/useFetch';
import { safe } from 'web/js/helper';
import { routes } from 'web/js/routes';
import { SEE_MORE } from 'web/js/helper/text';

import { NotFound } from 'web/js/page/not-found';
import { Error } from 'web/js/page/error';
import { Button } from 'web/js/component/button';
import { Pagination } from 'web/js/component/pagination';
import { NaturalSpinner } from 'web/js/component/natural-spinner';
import { Anchor } from 'web/js/component/anchor';
import { Avatar } from 'web/js/component/avatar';

import './style.scss';

export function EventDashboardComponent({ match: { params: { eventId } } }) {
  const fetchState = useContext(FetchStateContext);
  const eventState = useContext(EventContext);
  const itemsMap = useContext(ItemContext);
  const eventItemState = useContext(EventItemsContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);

  const getEventFetchState = fetchState[GET_EVENT];
  const isFetchingMore = safe(() => getEventFetchState.fetching);

  const event = eventState[eventId];
  const eventItemsPagination = eventItemState[eventId];
  const getNextPage = (page) => {
    if (isFetchingMore) {
      return;
    }

    const nextPage = typeof page === 'undefined' ? eventItemsPagination.pages.length : page;

    dispatchFetch(
      [EVENT_ITEMS_PATH, eventId],
      {
        query: {
          page: nextPage,
          lastUserActivity: -1
        }
      },
      GET_EVENT_ITEMS
    );
  };

  const renderItem = id => {
    const item = itemsMap[id];

    return (
      <Link to={routes.itemPersist(eventId, id)} key={id} styleName='item-name'>{item.name}</Link>
    );
  };
  const seeMoreButton = (
    <Button loading={isFetchingMore} styleName='see-more' onClick={() => getNextPage()} type='button'>
      {SEE_MORE}
    </Button>
  );

  useEffect(() => {
    dispatchFetch([EVENT_PATH, eventId], {}, GET_EVENT);
    getNextPage(0);

    return () => {
      dispatchFetchDelete([ GET_EVENT, GET_EVENT_ITEMS ]);
    };
  }, []);

  if (safe(() => getEventFetchState.fetching)) {
    return (
      <div styleName='root'>
        <NaturalSpinner />
      </div>
    );
  }

  if (safe(() => getEventFetchState.response.status) === 404) {
    return <NotFound />;
  }

  if (!event) {
    return <Error />;
  }

  return (
    <div styleName='root'>
      <span styleName='page-title'>
        {event.avatar && <Avatar styleName='avatar' src={event.avatar} /> }
        <span styleName='event-name'>
          {event.name}
        </span>
      </span>
      <div styleName='items'>
        <Anchor styleName='create-item' to={routes.itemPersist(eventId)} button>
          {T('Create item')}
        </Anchor>
        {
          eventItemsPagination && (
            <div styleName='pagination'>
              <Pagination
                value={eventItemsPagination}
                render={renderItem}
                more={seeMoreButton}
              />
            </div>
          )
        }
      </div>
    </div>
  );
}

EventDashboardComponent.propTypes = {
  match: PropTypes.object.isRequired
};

export const EventDashboard = withRouter(EventDashboardComponent);
