import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import './style.scss';

import { Spinner, Color } from 'js/component/spinner';

export class Button extends React.Component {
  static propTypes = {
    loading: PropTypes.bool
  };

  static defaultProps = {
    loading: false
  };

  render() {
    let content;
    let styleName = 'root';

    if (this.props.loading) {
      content = (
        <>
          <div styleName='children'>
            {this.props.children}
          </div>
          <Spinner color={Color.white} />
        </>
      );
      styleName += ' loading';
    } else {
      content = this.props.children;
    }

    const props = _.omit(this.props, ['loading']);

    return (
      <button styleName={styleName} { ...props }>
        {content}
      </button>
    );
  }
}
