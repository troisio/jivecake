import Compressor from 'compressorjs';
import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { toast } from 'react-toastify';

import { T } from 'common/i18n';
import { CURRENCY_AND_LABELS, getMinimumChargeAmount } from 'common/helpers';
import { ITEM_SCHEMA, MAXIMUM_IMAGE_UPLOAD_BYTES } from 'common/schema';
import {
  EVENT_PATH,
  ITEM_PATH,
  EVENT_ITEMS_PATH,
  ITEM_AVATAR_PATH
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
  const [ avatarBlob, setAvatarBlob ] = useState(null);
  const avatarImageUploadProps = fetchedItem && fetchedItem.avatar ? { src: fetchedItem.avatar } : {};

  const persistItemState = fetchState[PERSIST_ITEM];
  const updateAvatarState = fetchState[UPDATE_ITEM_AVATAR];

  const loading = safe(() => persistItemState.fetching);
  const updatingAvatar = safe(() => updateAvatarState.fetching);
  const isFetchingData = !fetchedEvent || ( !fetchedItem && itemId);
  const currencyLabel = CURRENCY_AND_LABELS.find(({ id }) => id === safe(() => fetchedEvent.currency));

  const onFileChange = e => {
    if (e.target.files.length !== 1) {
      return;
    }

    const file = e.target.files[0];

    if (file.size > MAXIMUM_IMAGE_UPLOAD_BYTES) {
      new Compressor(file, {
        quality: MAXIMUM_IMAGE_UPLOAD_BYTES / file.size,
        success(result) {
          setAvatarBlob(result);
        },
        error() {
          setAvatarBlob(null);
        },
      });
    } else if (file.type.startsWith('image')) {
      setAvatarBlob(file);
    }
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

    if (itemId && avatarBlob) {
      dispatchFetch([ITEM_AVATAR_PATH, itemId], {
        method: 'POST',
        body: avatarBlob
      }, UPDATE_ITEM_AVATAR);
    }

    const body = {
      name,
      maximumAvailable: null,
      amount: derivedAmount
    };

    if (!itemId) {
      body.published = false;
    }

    dispatchFetch(path, {
      method: 'POST',
      body
    }, PERSIST_ITEM);
  };

  useEffect(() => {
    return () => {
      dispatchFetchDelete([GET_EVENT, GET_ITEM, PERSIST_ITEM, UPDATE_ITEM_AVATAR]);
    };
  }, []);

  useEffect(() => {
    if (fetchedEvent && fetchedItem) {
      if (hasMinorUnits(fetchedEvent.currency) && fetchedItem.amount) {
        setAmountText(fetchedItem.amount / 100 + '');
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
      if (avatarBlob) {
        dispatchFetch([ITEM_AVATAR_PATH, itemId], {
          method: 'POST',
          body: avatarBlob
        }, UPDATE_ITEM_AVATAR);
      } else {
        toast(UPDATE_SUCCESS);
        history.push(routes.event(eventId));
      }
    }
  }, [ persistItemState ]);

  useEffect(() => {
    if (safe(() => updateAvatarState.response.ok)) {
      dispatchFetchDelete([UPDATE_SUCCESS]);
      toast(UPDATE_SUCCESS);
      history.push(routes.event(eventId));
    }
  }, [ updateAvatarState ]);

  useEffect(() => {
    if (fetchedItem) {
      setName(fetchedItem.name);
    }
  }, [ fetchedItem ]);

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
          onChange={onFileChange}
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
