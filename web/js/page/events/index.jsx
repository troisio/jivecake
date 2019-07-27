import React, { useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faToggleOn, faToggleOff  } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';

import { T } from 'common/i18n';
import {
  ORGANIZATION_EVENTS_PATH,
  EVENT_PATH
} from 'common/routes';

import { SEE_MORE  } from 'web/js/helper/text';
import { OrganizationEventsContext } from 'web/js/context';
import { Anchor } from 'web/js/component/anchor';
import { Avatar } from 'web/js/component/avatar';
import { Button } from 'web/js/component/button';
import { Pagination } from 'web/js/component/pagination';
import { UPDATE_SUCCESS } from 'web/js/helper/text';
import './style.scss';

import { safe } from 'web/js/helper';
import {
  ApplicationContext,
  FetchDispatchContext,
  FetchStateContext,
  EventContext
} from 'web/js/context';
import {
  GET_ORGANIZATION_EVENTS,
  UPDATE_EVENT,
  GET_EVENT
} from 'web/js/reducer/useFetch';
import { routes } from 'web/js/routes';

export function Events() {
  const eventsMap = useContext(EventContext);
  const { organizationId } = useContext(ApplicationContext);
  const organizationEventsMap = useContext(OrganizationEventsContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const fetchState = useContext(FetchStateContext);

  const getOrganizationEventsState = fetchState[GET_ORGANIZATION_EVENTS];
  const updateEventState = fetchState[UPDATE_EVENT];

  const organizationEventsPagination = organizationEventsMap[organizationId];
  const isFetchingMoreEvents = safe(() => getOrganizationEventsState.fetching);
  const getNextPage = (page) => {
    if (isFetchingMoreEvents) {
      return;
    }

    const nextPage = typeof page === 'undefined' ? organizationEventsPagination.pages.length : page;

    dispatchFetch(
      [ORGANIZATION_EVENTS_PATH, organizationId],
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
  const togglePublished = (event) => {
    dispatchFetch(
      [EVENT_PATH, event._id],
      { body: { published: !event.published }, method: 'POST' },
      UPDATE_EVENT
    );
  };

  const renderEvent = id => {
    const event = eventsMap[id];
    const isUpdating = event._id === safe(() => updateEventState.params.eventId);

    return (
      <React.Fragment key={event._id}>
        {
          event.avatar ?
          <Anchor to={routes.event(event._id)}>
            <Avatar styleName='avatar' src={event.avatar} />
          </Anchor>
          : <div></div>
        }
        <div styleName='information'>
          <Anchor to={routes.event(event._id)}>
            <span styleName='event-name'>
              {event.name}
            </span>
          </Anchor>
          <Anchor to={routes.eventPublic(event.hash)}>
            {T('public page')}
          </Anchor>
        </div>
        <Button error={!event.published} disabled={isUpdating} type='button' onClick={() => togglePublished(event)}>
          <FontAwesomeIcon icon={event.published ? faToggleOff : faToggleOn} />
        </Button>
        <Anchor button to={routes.eventPersist(event._id)}>
          <FontAwesomeIcon icon={faEdit} />
        </Anchor>
      </React.Fragment>
    );
  };

  useEffect(() => {
    return () => {
      dispatchFetchDelete([
        GET_ORGANIZATION_EVENTS,
        UPDATE_EVENT,
        GET_EVENT
      ]);
    };
  }, []);

  useEffect(() => {
    if (safe(() => updateEventState.response.ok)) {
      toast(UPDATE_SUCCESS);
      dispatchFetchDelete([UPDATE_EVENT]);
    }
  }, [ updateEventState ]);

  useEffect(() => {
    if (organizationId) {
      getNextPage(0);
    }
  }, [ organizationId ]);

  return (
    <div styleName='root'>
      {
        organizationEventsPagination &&
          <Pagination
            value={organizationEventsPagination}
            render={renderEvent}
            more={seeMoreButton}
          />
      }
    </div>
  );
}
