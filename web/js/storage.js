import Ajv from 'ajv';

const key = 'jivecakestorage';

const DEFAULT_LOCAL_STORAGE = {
  userId: null,
  token: null
};

export const writeLocalStorage = (item) => {
  localStorage.setItem(key, JSON.stringify(item));
};

export const getLocalStorage = () => {
  let item;

  try {
    item = JSON.parse(localStorage.getItem(key));
  } catch (e) {
    item = null;
  }

  const ajv = new Ajv();
  const validate = ajv.compile({
    type: 'object',
    required: ['user', 'token'],
    properties: {
      userId: {
        type: 'string',
      },
      token: {
        type: 'string'
      }
    }
  });

  let result;

  if (validate(item)) {
    result = item;
  } else {
    result = { ...DEFAULT_LOCAL_STORAGE };
  }

  return result;
}
