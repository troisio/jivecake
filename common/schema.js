export const DEFAULT_MAX_LENGTH = 250;

export const USER_SCHEMA = {
  email: {
    type: 'string',
    format: 'email',
    maxLength: DEFAULT_MAX_LENGTH
  },
  password: {
    type: 'string',
    minLength: 8,
    maxLength: DEFAULT_MAX_LENGTH
  }
};
