import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import './style.scss';

export function DefaultLayout(props) {
  return (
    <div { ..._.omit(props, ['children', 'className']) } className={props.className} styleName='root'>
      {props.children}
    </div>
  );
}

DefaultLayout.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};
