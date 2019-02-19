import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import './style.scss';

import { Spinner, Color } from 'js/component/spinner';

export function Button(props) {
  let content;
  let styleName = 'root';

  if (props.loading) {
    content = (
      <>
        <div styleName='children'>
          {props.children}
        </div>
        <Spinner color={Color.white} />
      </>
    );
    styleName += ' loading';
  } else {
    content = props.children;
  }

  const propsCopy = _.omit(props, ['loading']);

  return (
    <button styleName={styleName} { ...propsCopy }>
      {content}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  loading: PropTypes.bool
};
