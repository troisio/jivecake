import _ from 'lodash';

import { getEntityStoreHook } from 'js/helper/reducer';

import {
  GET_EVENT,
  GET_ORGANIZATION_EVENTS
} from 'js/reducer/useFetch';

function reducer(state, action) {
  switch (action.type) {
    case GET_EVENT: {
      return _.merge({}, state, {
        [action.body._id]: action.body
      });
    }

    case GET_ORGANIZATION_EVENTS: {
      const events = _.keyBy(action.body.entity, '_id');
      return _.merge({}, state, events);
    }

    default:
      return state;
  }
}

export const useEvents = getEntityStoreHook(
  [GET_EVENT, GET_ORGANIZATION_EVENTS],
  reducer
);
