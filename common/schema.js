/*
https://ajv.js.org/keywords.html
*/

import passwords from 'common/passwords.json';

export const DEFAULT_MAX_LENGTH = 250;
export const MAXIMUM_IMAGE_UPLOAD_BYTES = 500000;

const DEFAULT_NAME_FIELD = {
  type: 'string',
  minLength: 1,
  maxLength: DEFAULT_MAX_LENGTH
};

export const USER_SCHEMA = {
  email: {
    type: 'string',
    format: 'email',
    maxLength: DEFAULT_MAX_LENGTH
  },
  password: {
    type: 'string',
    minLength: 8,
    maxLength: DEFAULT_MAX_LENGTH,
    not: {
      enum: passwords
    }
  }
};

export const ITEM_SCHEMA = {
  name: DEFAULT_NAME_FIELD
};

export const EVENT_SCHEMA = {
  name: DEFAULT_NAME_FIELD,
  published: {
    type: 'boolean'
  }
};

export const ORGANIZATION_SCHEMA = {
  name: DEFAULT_NAME_FIELD,
  email: {
    type: 'string',
    format: 'email',
    maxLength: DEFAULT_MAX_LENGTH
  }
};
