import React from 'react';
import PropTypes from 'prop-types';

import { Button } from 'component/button';
import { T } from 'common/i18n';
import './style.scss';

export function ErrorPage(props) {
  let retry;

  if (props.hasOwnProperty('onRetry')) {
    retry = (
      <Button onClick={props.onRetry}>
        {T('Try again')}
      </Button>
    );
  }

  return (
    <div styleName='root'>
      <div>
        {T('Sorry we are not able to load your data')}
      </div>
      {retry}
    </div>
  );
}

ErrorPage.propTypes = {
  onRetry: PropTypes.func
};
