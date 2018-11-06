import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { application } from 'js/application';

export const router = () => (
  <BrowserRouter>
    {application}
  </BrowserRouter>
);
