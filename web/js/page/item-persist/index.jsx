import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { toast } from 'react-toastify';

import { T } from 'common/i18n';
import { CURRENCY_AND_LABELS, getMinimumChargeAmount } from 'common/helpers';
import { ITEM_SCHEMA } from 'common/schema';
import {
  EVENT_PATH,
  ITEM_PATH,
  EVENT_ITEMS_PATH
} from 'common/routes';

import { hasMinorUnits } from 'web/js/helper/currency';
import { UPDATE_SUCCESS } from 'web/js/helper/text';
import { routes } from 'web/js/routes';
import { safe } from 'web/js/helper';
import { Button } from 'web/js/component//button';
import { AvatarImageUpload } from 'web/js/component/avatar-image-upload';
import { Input } from 'web/js/component//input';
import { Loading } from 'web/js/page/loading';

import {
  FetchDispatchContext,
  FetchStateContext,
  ItemContext,
  EventContext
} from 'web/js/context';
import {
  GET_EVENT,
  GET_ITEM,
  PERSIST_ITEM,
  UPDATE_ITEM_AVATAR
} from 'web/js/reducer/useFetch';

import './style.scss';

export function ItemPersistComponent({ history, match: { params: { eventId, itemId }}}) {
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const fetchState = useContext(FetchStateContext);
  const itemsMap = useContext(ItemContext);
  const eventsMap = useContext(EventContext);

  const fetchedItem = itemsMap[itemId];
  const fetchedEvent = eventsMap[eventId];
  const [ name, setName ] = useState(fetchedItem ? fetchedItem.name : '');
  const [ amountText, setAmountText ] = useState(fetchedItem ? fetchedItem.amount.toString() : '');
  const avatarImageUploadProps = fetchedItem ? { src: fetchedItem.src } : {};

  const persistItemState = fetchState[PERSIST_ITEM];
  const updateAvatarState = fetchState[UPDATE_ITEM_AVATAR];

  const loading = safe(() => persistItemState.fetching);
  const updatingAvatar = safe(() => updateAvatarState.fetching);
  const isFetchingData = !fetchedEvent || ( !fetchedItem && itemId);
  const currencyLabel = CURRENCY_AND_LABELS.find(({ id }) => id === safe(() => fetchedEvent.currency));

  const onFile = () => {

  };
  const onSubmit = (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    let derivedAmount;

    const withMinorUnitsFormat = new RegExp('^(\\d+((\\.|,)\\d{1,2})?)$');
    const withoutMinorUnits = new RegExp('^\\d+$');
    const { currency } = fetchedEvent;

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
        amount: derivedAmount,
        order: 0
      }
    }, PERSIST_ITEM);
  };

  useEffect(() => {
    return () => {
      dispatchFetchDelete([GET_EVENT, GET_ITEM, PERSIST_ITEM]);
    };
  }, []);

  useEffect(() => {
    if (fetchedEvent && fetchedItem) {
      if (hasMinorUnits(fetchedEvent.currency) && fetchedEvent.amount) {
        setAmountText(fetchedEvent.amount / 100 + '');
      } else {
        setAmountText(fetchedItem.amount ? fetchedItem.amount.toString() : '');
      }
    }
  }, [ fetchedEvent, fetchedItem ]);

  useEffect(() => {
    if (eventId) {
      dispatchFetch([EVENT_PATH, eventId], {}, GET_EVENT);
    }
  }, [ eventId ]);

  useEffect(() => {
    if (itemId) {
      dispatchFetch([ITEM_PATH, itemId], {}, GET_ITEM);
    }
  }, [ itemId ]);

  useEffect(() => {
    if (safe(() => persistItemState.response.ok)) {
      toast(UPDATE_SUCCESS);
      history.push(routes.event(eventId));
    }
  }, [ persistItemState ]);

  if (isFetchingData) {
    return <Loading />;
  }

  return (
    <form onSubmit={onSubmit} styleName='root'>
      <div styleName='form-row'>
        <label styleName='label' htmlFor='avatar'>
          {T('Avatar')}
        </label>
        <AvatarImageUpload
          { ...avatarImageUploadProps }
          loading={updatingAvatar}
          id='avatar'
          onFile={onFile}
        />
        <label styleName='label'>
          {T('Name')}
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
          {T('Amount')}
          &nbsp;
          {currencyLabel && <span>({currencyLabel.label})</span>}
        </label>
        <Input
          disabled={!fetchedEvent.currency}
          required
          min={getMinimumChargeAmount(fetchedEvent.currency)}
          step={hasMinorUnits(fetchedEvent.currency) ? 0.01 : 1}
          autoComplete='transaction-amount'
          type='number'
          value={amountText}
          onChange={e => setAmountText(e.target.value)}
        />
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
