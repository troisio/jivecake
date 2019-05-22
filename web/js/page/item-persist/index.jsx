import React, { useState, useEffect, useContext } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';

import { T } from 'common/i18n';
import { ITEM_SCHEMA } from 'common/schema';

import { routes } from 'js/routes';
import { safe } from 'js/helper';
import { Button } from 'js/component/button';
import { Input } from 'js/component/input';

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

  const createItemState = fetchState[CREATE_ITEM];
  const loading = safe(() => createItemState.fetching);

  const onSubmit = (e) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    const path = itemId ?
      ['event/:eventId/item/:itemId', eventId, itemId] :
      ['event/:eventId/item', eventId];

    dispatchFetch(path, {
      method: 'POST',
      body: {
        name
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
          minLength={ITEM_SCHEMA.name.minLength}
          maxLength={ITEM_SCHEMA.name.maxLength}
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
