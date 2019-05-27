import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import _ from 'lodash';

import { T } from 'common/i18n';

import {
  EventContext,
  ItemContext,
  FetchStateContext,
  FetchDispatchContext
} from 'js/context';

import {
  GET_EVENT,
  GET_EVENT_ITEMS
} from 'js/reducer/useFetch';
import { safe } from 'js/helper';
import { routes } from 'js/routes';

import { NotFound } from 'page/not-found';
import { Error } from 'page/error';
import { NaturalSpinner } from 'component/natural-spinner';
import { Anchor } from 'component/anchor';
import { Avatar } from 'component/avatar';

import './style.scss';

export function EventDashboardComponent({ match: { params: { eventId } } }) {
  const fetchState = useContext(FetchStateContext);
  const eventState = useContext(EventContext);
  const itemState = useContext(ItemContext);

  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const getEventFetchState = fetchState[GET_EVENT];
  const event = eventState[eventId];

  const items = _.values(itemState)
    .filter(item => item.eventId === eventId);

  useEffect(() => {
    dispatchFetch(['event/:eventId', eventId], {}, GET_EVENT);
    dispatchFetch(['event/:eventId/item', eventId], {
      query: {
        page: 0
      }
    }, GET_EVENT_ITEMS);

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
        <div styleName='items-table'>
          {
            items.map(item => (
              <React.Fragment key={item._id}>
                <span styleName='item-name'>{item.name}</span>
              </React.Fragment>
            ))
          }
        </div>
      </div>
    </div>
  );
}

EventDashboardComponent.propTypes = {
  match: PropTypes.object.isRequired
};

export const EventDashboard = withRouter(EventDashboardComponent);
