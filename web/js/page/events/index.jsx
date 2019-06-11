import React, { useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

import { SEE_MORE  } from 'js/helper/text';
import { OrganizationEventsContext } from 'js/context';
import { Anchor } from 'component/anchor';
import { Avatar } from 'component/avatar';
import { Button } from 'component/button';
import { Pagination } from 'component/pagination';
import './style.scss';

import { safe } from 'js/helper';
import {
  ApplicationContext,
  FetchDispatchContext,
  FetchStateContext,
  EventContext
} from 'js/context';
import {
  GET_ORGANIZATION_EVENTS
} from 'js/reducer/useFetch';
import { routes } from 'js/routes';

export function Events() {
  const eventsMap = useContext(EventContext);
  const { organizationId } = useContext(ApplicationContext);
  const organizationEventsMap = useContext(OrganizationEventsContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const fetchState = useContext(FetchStateContext);

  const getOrganizationEventsState = fetchState[GET_ORGANIZATION_EVENTS];
  const organizationEventsPagination = organizationEventsMap[organizationId];
  const isFetchingMoreEvents = safe(() => getOrganizationEventsState.fetching);
  const getNextPage = (page) => {
    if (isFetchingMoreEvents) {
      return;
    }

    const nextPage = typeof page === 'undefined' ? organizationEventsPagination.pages.length : page;

    dispatchFetch(
      ['organization/:organizationId/event', organizationId],
      {
        query: {
          page: nextPage,
        }
      },
      GET_ORGANIZATION_EVENTS
    );
  };
  const seeMoreButton = (
    <Button loading={isFetchingMoreEvents} styleName='see-more' onClick={() => getNextPage()} type='button'>
      {SEE_MORE}
    </Button>
  );

  const renderEvent = id => {
    const event = eventsMap[id];

    return (
      <div styleName='row' key={event._id}>
        <Anchor styleName='event-link' to={routes.event(event._id)}>
          {(event.avatar && <Avatar styleName='event-avatar' src={event.avatar} />) || <div styleName='event-avatar'></div>}
          <span styleName='event-name'>
            {event.name}
          </span>
        </Anchor>
        <Anchor button to={routes.eventPersist(event._id)}>
          <FontAwesomeIcon icon={faEdit} />
        </Anchor>
      </div>
    );
  };

  useEffect(() => {
    return () => {
      dispatchFetchDelete([
        GET_ORGANIZATION_EVENTS
      ]);
    };
  }, []);

  useEffect(() => {
    if (organizationId) {
      getNextPage(0);
    }
  }, [ organizationId ]);

  return (
    <div styleName='root'>
      {
        organizationEventsPagination &&
        <div styleName='pagination'>
          <Pagination
            value={organizationEventsPagination}
            render={renderEvent}
            more={seeMoreButton}
          />
        </div>
      }
    </div>
  );
}
