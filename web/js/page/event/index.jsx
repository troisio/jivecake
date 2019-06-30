import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { EVENT_PURCHASE_PATH } from 'common/routes';

import {
  EventContext,
  ItemContext,
  FetchStateContext,
  FetchDispatchContext
} from 'web/js/context';

import {
  GET_EVENT_PURCHASE_DATA
} from 'web/js/reducer/useFetch';

import { safe } from 'web/js/helper';
import { NaturalSpinner } from 'web/js/component//natural-spinner';

import './style.scss';

export function EventComponent({ match: { params: { hash } } }) {
  const eventMap = useContext(EventContext);
  const itemMap = useContext(ItemContext);
  const fetchState = useContext(FetchStateContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);

  const getEventInformation = fetchState[GET_EVENT_PURCHASE_DATA];

  const fetchedEvent = _.values(eventMap).find(event => event.hash === hash);
  const items = fetchedEvent ? _.values(itemMap).filter(item => fetchedEvent._id === item.eventId) : [];
  const loading = safe(() => getEventInformation.fetching);

  console.log('items', items);

  useEffect(() => {
    return () => {
      dispatchFetchDelete([ GET_EVENT_PURCHASE_DATA ]);
    };
  }, []);

  useEffect(() => {
    dispatchFetch([EVENT_PURCHASE_PATH, hash], {}, GET_EVENT_PURCHASE_DATA);
  }, [ hash ]);

  return (
    <div styleName='root'>
      <h2>{fetchedEvent && fetchedEvent.name}</h2>
      <div styleName='items'>
        {
          items.map(item => {
            return (
              <React.Fragment key={item._id}>
                <span styleName='item-name'>
                  {item.name}
                </span>
                <select>
                  {Array.from(new Array(31)).map((_, index) => <option key={index} value={index}>{index}</option>)}
                </select>
              </React.Fragment>
            );
          })
        }
      </div>
      {}
      {loading && <NaturalSpinner />}
    </div>
  );
}

EventComponent.propTypes = {
  match: PropTypes.object.isRequired
};

export const Event = withRouter(EventComponent);
