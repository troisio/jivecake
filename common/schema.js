/*
https://ajv.js.org/keywords.html
*/

import passwords from 'common/passwords.json';
import { Currency } from 'common/models';

export const DEFAULT_MAX_LENGTH = 250;
export const MAXIMUM_IMAGE_UPLOAD_BYTES = 500000;

const DEFAULT_TEXT_FIELD = {
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
  type: 'object',
  required: ['name', 'maximumAvailable', 'published', 'amount', 'currency'],
  additionalProperties: false,
  properties: {
    name: DEFAULT_TEXT_FIELD,
    amount: {
      if: { type: 'integer' },
      then: { minimum: 0 },
      else: { type: 'null' }
    },
    currency: {
      enum: [Currency.USD, Currency.EUR, Currency.CAD, Currency.JPY, Currency.KRW, null]
    },
    maximumAvailable: {
      if: { type: 'integer' },
      then: { minimum: 0 },
      else: { type: 'null' }
    },
    published: {
      type: 'boolean'
    }
  }
};

export const EVENT_SCHEMA = {
  name: DEFAULT_TEXT_FIELD,
  published: {
    type: 'boolean'
  }
};

export const ORGANIZATION_SCHEMA = {
  name: DEFAULT_TEXT_FIELD,
  email: {
    type: 'string',
    format: 'email',
    maxLength: DEFAULT_MAX_LENGTH
  }
};
