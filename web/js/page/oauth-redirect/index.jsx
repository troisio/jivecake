import React from 'react';
import { NaturalSpinner } from 'component/natural-spinner';

import './style.scss';


export function OAuthRedirectPage() {
  const params = new URLSearchParams(location.search);

  return (
    <div styleName='root'>
      <NaturalSpinner />
      code: {params.get('code')}
    </div>
  );
}
