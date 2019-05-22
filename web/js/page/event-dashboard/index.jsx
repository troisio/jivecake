import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import {
  EventContext,
  FetchStateContext,
  FetchDispatchContext
} from 'js/context';

import {
  GET_EVENT
} from 'js/reducer/useFetch';
import { safe } from 'js/helper';
import { NotFound } from 'page/not-found';
import { Error } from 'page/error';
import { NaturalSpinner } from 'component/natural-spinner';
import { Avatar } from 'component/avatar';
import './style.scss';

export function EventDashboardComponent({ match: { params: { eventId } } }) {
  const fetchState = useContext(FetchStateContext);
  const eventState = useContext(EventContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const getEventFetchState = fetchState[GET_EVENT];
  const event = eventState[eventId];

  useEffect(() => {
    dispatchFetch(['event/:eventId', eventId], {}, GET_EVENT);
    return () => {
      dispatchFetchDelete([ GET_EVENT ]);
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
    </div>
  );
}

EventDashboardComponent.propTypes = {
  match: PropTypes.object.isRequired
};

export const EventDashboard = withRouter(EventDashboardComponent);
