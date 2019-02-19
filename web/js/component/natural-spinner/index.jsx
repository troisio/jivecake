import React from 'react';
import _ from 'lodash';

import { Spinner } from 'component/spinner';

import './style.scss';

export function NaturalSpinner(props) {
  const propsCopy = _.omit(props, ['className']);

  return (
    <div styleName='root-natural-spinner' {...propsCopy}>
      <Spinner />
    </div>
  );
}
