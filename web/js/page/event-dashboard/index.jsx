import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Link, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faToggleOn, faToggleOff } from '@fortawesome/free-solid-svg-icons';

import { T } from 'common/i18n';
import {
  EVENT_PATH,
  EVENT_ITEMS_PATH,
  ITEM_PATH
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
  GET_EVENT_ITEMS,
  PERSIST_ITEM
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
  const persistItemState = fetchState[PERSIST_ITEM];

  const isFetchingMore = safe(() => getEventFetchState.fetching);
  const itemUpdating = safe(() => persistItemState.fetching);

  const event = eventState[eventId];
  const eventItemsPagination = eventItemState[eventId];
  const persistItemOk = safe(() => persistItemState.response.ok);

  const moveItem = (itemId, decrease) => {
    const items = _.flatten(eventItemsPagination.pages).map(id => itemsMap[id]);
    const index = items.findIndex(({ _id }) => _id === itemId);
    const targetItem = items[index];
    const before = items[index - 1];
    const after = items[index + 1];

    if (decrease && before) {
      items[index - 1] = targetItem;
      items[index] = before;
    } else if (after) {
      items[index + 1] = targetItem;
      items[index] = after;
    }

    items.forEach((item, order) => {
      if (item.order === order) {
        return;
      }

      dispatchFetch(
        [ITEM_PATH, item._id],
        {
          method: 'POST',
          body: {
            order
          }
        },
        PERSIST_ITEM
      );
    });
  };
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
          order: 1
        }
      },
      GET_EVENT_ITEMS
    );
  };
  const toggleItemPublished = (item) => {
    dispatchFetch(
      [ITEM_PATH, item._id],
      {
        method: 'POST',
        body: {
          published: !item.published
        }
      },
      PERSIST_ITEM
    );
  };

  const renderItem = (id, index, array) => {
    const item = itemsMap[id];
    const moving = safe(() => persistItemState.params.itemId) === id;
    const publishedButtonProps = item.published ? {} : { error: true };
    const publishButtonIcon = item.published ? faToggleOff : faToggleOn;

    return (
      <div styleName='item-row'>
        <Link to={routes.itemPersist(eventId, id)} key={id} styleName='item-name'>{item.name}</Link>
        <Button { ...publishedButtonProps } disabled={itemUpdating} type='button' onClick={() => toggleItemPublished(item)}>
          <FontAwesomeIcon icon={publishButtonIcon} />
        </Button>
        <Button disabled={moving || itemUpdating || index === 0} loading={moving} type='button' onClick={() => moveItem(id, true)}>
          {!moving && <FontAwesomeIcon icon={faArrowUp} /> }
        </Button>
        <Button disabled={moving || itemUpdating || index >= array.length - 1} loading={moving} type='button' onClick={() => moveItem(id, false)}>
          {!moving && <FontAwesomeIcon icon={faArrowDown} />}
        </Button>
      </div>
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
      dispatchFetchDelete([ GET_EVENT, GET_EVENT_ITEMS, PERSIST_ITEM ]);
    };
  }, []);

  useEffect(() => {
    if (persistItemOk) {
      dispatchFetchDelete([ PERSIST_ITEM ]);
      getNextPage(0);
    }
  }, [persistItemOk]);

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
