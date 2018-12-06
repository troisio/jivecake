import Ajv from 'ajv';

const key = 'jivecakestorage';

const DEFAULT_LOCAL_STORAGE = {
  userId: null,
  token: null
};

export const writeLocalStorage = (item = DEFAULT_LOCAL_STORAGE) => {
  localStorage.setItem(key, JSON.stringify(item));
  return JSON.parse(localStorage.getItem(key));
};

export const getLocalStorage = () => {
  let item;

  try {
    item = JSON.parse(localStorage.getItem(key));
  } catch (e) {
    item = null;
    writeLocalStorage(DEFAULT_LOCAL_STORAGE);
    item = { ...DEFAULT_LOCAL_STORAGE };
  }

  const ajv = new Ajv();
  const validate = ajv.compile({
    type: 'object',
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
    writeLocalStorage(result);
  }

  return result;
}
