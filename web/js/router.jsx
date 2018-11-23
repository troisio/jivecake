import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter } from 'react-router-dom';
import { application } from 'js/application';

export const router = ({ T }) => (
  <BrowserRouter>
    <application T={T} />
  </BrowserRouter>
);

router.propTypes = {
  T: PropTypes.object.isRequired,
};
