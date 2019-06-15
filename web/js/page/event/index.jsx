import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { EVENT_INFORMATION_PATH } from 'common/routes';

import {
  EventContext,
  FetchStateContext,
  FetchDispatchContext
} from 'js/context';

import {
  GET_EVENT_INFORMATION
} from 'js/reducer/useFetch';

import { safe } from 'js/helper';
import { NaturalSpinner } from 'js/component/natural-spinner';

import './style.scss';

export function EventComponent({ match: { params: { hash } } }) {
  const eventMap = useContext(EventContext);
  const fetchState = useContext(FetchStateContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);

  const getEventInformation = fetchState[GET_EVENT_INFORMATION];

  const fetchedEvent = _.values(eventMap).find(event => event.hash === hash);
  const loading = safe(() => getEventInformation.fetching);

  useEffect(() => {
    return () => {
      dispatchFetchDelete([ GET_EVENT_INFORMATION ]);
    };
  }, []);

  useEffect(() => {
    if (hash) {
      dispatchFetch([EVENT_INFORMATION_PATH, hash], {}, GET_EVENT_INFORMATION);
    }
  }, [ hash ]);

  return (
    <div styleName='root'>
      <h2>{fetchedEvent && fetchedEvent.name}</h2>
      {loading && <NaturalSpinner />}
    </div>
  );
}

EventComponent.propTypes = {
  match: PropTypes.object.isRequired
};

export const Event = withRouter(EventComponent);
