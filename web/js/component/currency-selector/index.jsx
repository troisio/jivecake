import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import './style.scss';

import { Currency } from 'common/models';
import { T } from 'common/i18n';

const CURRENCY_AND_LABELS = [
  [ T('US Dollar'), Currency.USD ],
  [ T('Canadian Dollar'), Currency.CAD ],
  [ T('British Pounds'), Currency.GBP ],
  [ T('Euro'), Currency.EUR ],
  [ T('Japanese Yen'), Currency.JPY ],
  [ T('Korean Won'), Currency.KRW ]
];

export function CurrencySelector(props) {
  return (
    <select { ..._.omit(props, ['className']) } className={props.className} styleName='root'>
      <option></option>
      {
        CURRENCY_AND_LABELS.map(([ label, currency ]) => <option key={currency} value={currency}>{label}</option>)
      }
    </select>
  );
}

CurrencySelector.propTypes = {
  className: PropTypes.string
};
