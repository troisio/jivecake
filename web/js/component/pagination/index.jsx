import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

export function Pagination({ value, render, more }) {
  const ids = _.flatMap(value.pages);

  return (
    <React.Fragment>
      {
        ids.map(id => <React.Fragment key={id}>{render(id)}</React.Fragment>)
      }
      {ids.length < value.count ? more : null}
    </React.Fragment>
  );
}

Pagination.propTypes = {
  value: PropTypes.object.isRequired,
  render: PropTypes.func.isRequired,
  more: PropTypes.node.isRequired
};
