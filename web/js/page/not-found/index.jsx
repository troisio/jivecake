import React from 'react';

import { T } from 'common/i18n';

import './style.scss';

export class NotFound extends React.Component {
  render() {
    return (
      <div styleName='root'>
        {T('Sorry, we can not find the page you are looking for')}
      </div>
    );
  }
}
