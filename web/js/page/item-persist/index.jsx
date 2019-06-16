import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { toast } from 'react-toastify';

import { T } from 'common/i18n';
import { ITEM_SCHEMA } from 'common/schema';
import {
  ITEM_PATH,
  EVENT_ITEMS_PATH
} from 'common/routes';

import { hasMinorUnits } from 'web/js/helper/currency';
import { UPDATE_SUCCESS } from 'web/js/helper/text';
import { routes } from 'web/js/routes';
import { safe } from 'web/js/helper';
import { Button } from 'web/js/component//button';
import { Input } from 'web/js/component//input';
import { CurrencySelector } from 'web/js/component//currency-selector';

import {
  FetchDispatchContext,
  FetchStateContext,
  ItemContext
} from 'web/js/context';
import {
  GET_ITEM,
  PERSIST_ITEM
} from 'web/js/reducer/useFetch';

import './style.scss';

export function ItemPersistComponent({ history, match: { params: { eventId, itemId }}}) {
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const fetchState = useContext(FetchStateContext);
  const itemsMap = useContext(ItemContext);

  const fetchedItem = itemsMap[itemId];
  const [ name, setName ] = useState(fetchedItem ? fetchedItem.name : '');
  const [ currency, setCurrency ] = useState(fetchedItem ? fetchedItem.currency : '');
  const [ amountText, setAmountText ] = useState(fetchedItem ? fetchedItem.amount.toString() : '');

  const persistItemState = fetchState[PERSIST_ITEM];
  const loading = safe(() => persistItemState.fetching);

  const onSubmit = (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    let derivedAmount;

    const withMinorUnitsFormat = new RegExp('^(\\d+((\\.|,)\\d{1,2})?)$');
    const withoutMinorUnits = new RegExp('^\\d+$');

    if (!hasMinorUnits(currency) && currency && withoutMinorUnits.test(amountText)) {
      derivedAmount = Number(amountText);
    } else if (hasMinorUnits(currency) && withMinorUnitsFormat.test(amountText)) {
      const [ major, minor ] = amountText.split(amountText.includes(',') ? ',' : '.');
      derivedAmount = Number(major) * 100;

      if (minor) {
        derivedAmount +=  Number(minor);
      }
    }

    if (derivedAmount < 1000) {
      return;
    }

    const path = itemId ?
      [ITEM_PATH, itemId] :
      [EVENT_ITEMS_PATH, eventId];

    dispatchFetch(path, {
      method: 'POST',
      body: {
        name,
        maximumAvailable: null,
        published: false,
        currency,
        amount: derivedAmount,
        sort: 0
      }
    }, PERSIST_ITEM);
  };

  useEffect(() => {
    if (itemId && !itemsMap.hasOwnProperty(itemId)) {
      dispatchFetch([ITEM_PATH, itemId], {}, GET_ITEM);
    }

    return () => {
      dispatchFetchDelete([GET_ITEM, PERSIST_ITEM]);
    };
  }, []);

  useEffect(() => {
    if (fetchedItem) {
      setName(fetchedItem.name);
      setAmountText(fetchedItem.amount + '');
      setCurrency(fetchedItem.currency);

      if (hasMinorUnits(fetchedItem.currency) && fetchedItem.amount) {
        setAmountText(fetchedItem.amount / 100 + '');
      } else {
        setAmountText(fetchedItem.amount ? fetchedItem.amount.toString() : '');
      }
    }
  }, [ fetchedItem ]);

  useEffect(() => {
    if (safe(() => persistItemState.response.ok)) {
      toast(UPDATE_SUCCESS);
      history.push(routes.event(eventId));
    }
  }, [ persistItemState ]);

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
        <CurrencySelector required autoComplete='transaction-currency' styleName='selector' value={currency || ''} onChange={e => setCurrency(e.target.value)} />
      </div>
      <div styleName='form-row'>
        <label styleName='label'>
          {T('Amount')}
        </label>
        <Input required min={0} step={hasMinorUnits(currency) ? 0.01 : 1} autoComplete='transaction-amount' type='number' value={amountText} onChange={e => setAmountText(e.target.value)} />
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
