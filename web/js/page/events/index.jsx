import React, { useEffect, useContext } from 'react';
import _ from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit } from '@fortawesome/free-solid-svg-icons';

import { Anchor } from 'component/anchor';
import { Avatar } from 'component/avatar';
import './style.scss';

import {
  ApplicationContext,
  FetchDispatchContext,
  EventContext
} from 'js/context';
import {
  GET_ORGANIZATION_EVENTS
} from 'js/reducer/useFetch';
import { routes } from 'js/routes';

export function Events() {
  const eventsMap = useContext(EventContext);
  const { organizationId } = useContext(ApplicationContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const events = _.values(eventsMap)
    .filter(event => event.organizationId === organizationId)
    .sort(
      (firstEvent, secondEvent) =>
      new Date(secondEvent.lastUserActivity) - new Date(firstEvent.lastUserActivity)
    );

  useEffect(() => {
    return () => {
      dispatchFetchDelete([
        GET_ORGANIZATION_EVENTS
      ]);
    };
  }, []);

  useEffect(() => {
    if (organizationId) {
      dispatchFetch(
        ['organization/:organizationId/event', organizationId],
        {
          query: {
            page: 0
          }
        },
        GET_ORGANIZATION_EVENTS
      );
    }
  }, [ organizationId ]);

  return (
    <div styleName='root'>
      {
        events.map(event => {
          return (
            <div styleName='row' key={event._id}>
              {(event.avatar && <Avatar styleName='event-avatar' src={event.avatar} />) || <div styleName='event-avatar'></div>}
              <span styleName='event-name'>
                {event.name}
              </span>
              <Anchor button to={routes.eventPersist(event._id)}>
                <FontAwesomeIcon icon={faEdit} />
              </Anchor>
            </div>
          );
        })
      }
    </div>
  );
}
