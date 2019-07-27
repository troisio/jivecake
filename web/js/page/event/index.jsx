import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { T } from 'common/i18n';
import {
  EVENT_STRIPE_CHECKOUT_SESSION_PATH,
  EVENT_INFORMATION_PATH,
  ORGANIZATION_PATH
} from 'common/routes';

import settings from 'web/settings';

import {
  EventContext,
  ItemContext,
  FetchStateContext,
  FetchDispatchContext,
  OrganizationContext
} from 'web/js/context';

import {
  GET_EVENT_PURCHASE_DATA,
  CREATE_STRIPE_CHECKOUT_SESSION,
  GET_ORGANIZATION
} from 'web/js/reducer/useFetch';

import { safe } from 'web/js/helper';
import { Button } from 'web/js/component/button';
import { NaturalSpinner } from 'web/js/component//natural-spinner';

import './style.scss';

const stripe = Stripe(settings.stripe.publishable_api_key);

export function EventComponent({ match: { params: { hash } } }) {
  const eventMap = useContext(EventContext);
  const itemMap = useContext(ItemContext);
  const organizationMap = useContext(OrganizationContext);
  const fetchState = useContext(FetchStateContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const [ itemData, setItemData ] = useState({});

  const getEventInformation = fetchState[GET_EVENT_PURCHASE_DATA];
  const stripeCheckoutSessionState = fetchState[CREATE_STRIPE_CHECKOUT_SESSION];

  const fetchedEvent = _.values(eventMap).find(event => event.hash === hash);
  const organization = fetchedEvent && organizationMap[fetchedEvent.organizationId];
  const organizationHasStripe = safe(() => organization.stripe);
  const items = fetchedEvent ? _.values(itemMap).filter(item => fetchedEvent._id === item.eventId && item.published) : [];
  const loading = safe(() => getEventInformation.fetching);

  const onSubmit = (e) => {
    e.preventDefault();

    if (!organizationHasStripe) {
      return;
    }

    const items = Object.values(itemData).filter(({ quantity }) => quantity > 0);

    dispatchFetch(
      [ EVENT_STRIPE_CHECKOUT_SESSION_PATH, fetchedEvent._id ],
      { method: 'POST', body: { items } },
      CREATE_STRIPE_CHECKOUT_SESSION
    );
  };
  const onSelectChange = (item, event) => {
    const itemDataCopy = { ...itemData, [item._id]: { _id: item._id, quantity: Number(event.target.value) } };
    setItemData(itemDataCopy);
  };

  useEffect(() => {
    return () => {
      dispatchFetchDelete([ GET_EVENT_PURCHASE_DATA, CREATE_STRIPE_CHECKOUT_SESSION ]);
    };
  }, []);

  useEffect(() => {
    if (fetchedEvent) {
      dispatchFetch([ORGANIZATION_PATH, fetchedEvent.organizationId], {}, GET_ORGANIZATION);
    }
  }, [ fetchedEvent ]);

  useEffect(() => {
    dispatchFetch([EVENT_INFORMATION_PATH, hash], {}, GET_EVENT_PURCHASE_DATA);
  }, [ hash ]);

  useEffect(() => {
    if (safe(() => stripeCheckoutSessionState.response.ok)) {
      dispatchFetchDelete([ CREATE_STRIPE_CHECKOUT_SESSION ]);

      stripe.redirectToCheckout({ sessionId: stripeCheckoutSessionState.body.id });
    }
  }, [ stripeCheckoutSessionState ]);

  return (
    <form styleName='root' onSubmit={onSubmit}>
      <h2>{fetchedEvent && fetchedEvent.name}</h2>
      <div styleName='items'>
        {
          items.map(item => {
            return (
              <React.Fragment key={item._id}>
                <span styleName='item-name'>
                  {item.name}
                </span>
                <select onBlur={e => onSelectChange(item, e)}>
                  {Array.from(new Array(31)).map((_, index) => <option key={index} value={index}>{index}</option>)}
                </select>
              </React.Fragment>
            );
          })
        }
      </div>
      {loading && <NaturalSpinner />}
      {!organizationHasStripe && (
        <div styleName='note'>
          {T('This event is currently published, but not yet available for checkout.')}
        </div>
      )}
      {organizationHasStripe && (
        <Button styleName='checkout-button'>
          {'Checkout'}
        </Button>
      )}
    </form>
  );
}

EventComponent.propTypes = {
  match: PropTypes.object.isRequired
};

export const Event = withRouter(EventComponent);
