import React from 'react';
import PropTypes from 'prop-types';

import { Button } from 'component/button';
import { T } from 'common/i18n';
import './style.scss';

export class ErrorPage extends React.Component {
  static propTypes = {
    onRetry: PropTypes.func
  };


  render() {
    let retry = null;

    if (this.props.hasOwnProperty('onRetry')) {
      retry = (
        <Button onClick={this.props.onRetry}>
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
}
