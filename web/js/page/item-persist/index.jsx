import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { T } from 'common/i18n';
import { ITEM_SCHEMA } from 'common/schema';
import { Currency } from 'common/models';

import { routes } from 'js/routes';
import { safe } from 'js/helper';
import { Button } from 'js/component/button';
import { Input } from 'js/component/input';
import { CurrencySelector } from 'js/component/currency-selector';

import {
  FetchDispatchContext,
  FetchStateContext,
  ItemContext
} from 'js/context';
import {
  GET_ITEM,
  CREATE_ITEM
} from 'js/reducer/useFetch';

import './style.scss';

export function ItemPersistComponent({ history, match: { params: { eventId, itemId }}}) {
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const fetchState = useContext(FetchStateContext);
  const itemsMap = useContext(ItemContext);

  const fetchItem = itemsMap[itemId];
  const [ name, setName ] = useState(fetchItem ? fetchItem.name : '');
  const [ amount, setAmount ] = useState(fetchItem ? fetchItem.amount : '');
  const [ currency, setCurrency ] = useState(fetchItem ? fetchItem.currency : '');

  const createItemState = fetchState[CREATE_ITEM];
  const loading = safe(() => createItemState.fetching);

  const onSubmit = (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    let derivedAmount = amount;

    if (currency === Currency.USD || currency === Currency.EUR) {
      derivedAmount = Math.floor(amount * 100);
    }

    const path = itemId ?
      ['event/:eventId/item/:itemId', eventId, itemId] :
      ['event/:eventId/item', eventId];

    dispatchFetch(path, {
      method: 'POST',
      body: {
        name,
        maximumAvailable: null,
        published: false,
        currency: null,
        amount: derivedAmount,
        sort: 0
      }
    }, CREATE_ITEM);
  };

  useEffect(() => {
    if (itemId && !itemsMap.hasOwnProperty(itemId)) {
      dispatchFetch(['item/:itemId', itemId], {}, GET_ITEM);
    }

    return () => {
      dispatchFetchDelete([GET_ITEM, CREATE_ITEM]);
    };
  }, []);

  useEffect(() => {
    if (safe(() => createItemState.response.ok)) {
      history.push(routes.event(eventId));
    }
  }, [ createItemState ]);

  return (
    <form onSubmit={onSubmit} styleName='root'>
      <div styleName='form-row'>
        <label styleName='label'>
          {T('Item Name')}
        </label>
        <Input
          required
          value={name}
          onChange={e => setName(e.target.value)}
          minLength={ITEM_SCHEMA.properties.name.minLength}
          maxLength={ITEM_SCHEMA.properties.name.maxLength}
        />
      </div>
      <div styleName='form-row'>
        <label styleName='label'>
          {T('Currency')}
        </label>
        <CurrencySelector required autoComplete='transaction-currency' styleName='selector' value={currency} onChange={e => setCurrency(e.target.value)} />
      </div>
      <div styleName='form-row'>
        <label styleName='label'>
          {T('Amount')}
        </label>
        <Input required min={0} autoComplete='transaction-currency' type='number' value={amount} onChange={e => setAmount(Number(e.target.value))} />
      </div>
      <Button loading={loading}>
        {itemId ? T('Update') : T('Create')}
      </Button>
    </form>
  );
}


ItemPersistComponent.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export const ItemPersist = withRouter(ItemPersistComponent);
