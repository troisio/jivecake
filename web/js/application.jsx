import React from 'react';
import PropTypes from 'prop-types';

export const application = ({ T }) => (
  <div>
    {T('Hello')}
  </div>
);

application.propTypes = {
  T: PropTypes.object.isRequired,
};
