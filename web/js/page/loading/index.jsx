import React from 'react';

import { NaturalSpinner } from 'component/natural-spinner';
import './style.scss';

export function Loading() {
  return (
    <div styleName='root'>
      <NaturalSpinner styleName='spinner' />
    </div>
  );
}
