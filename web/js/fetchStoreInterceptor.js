import _ from 'lodash';

import { OBJECT_ID_REGEX_PORTION } from 'common/helpers';

const GET_USER_ORGANIZATIONS = new RegExp('/user/.+/organization');
const POST_ORGANIZATION = new RegExp('/organization');
const GET_ORGANIZATION = new RegExp('/organization/.{24}');
const POST_AVATAR = new RegExp('/organization/.{24}/avatar');

const ORGANIZATION_IN_BODY = [POST_ORGANIZATION, POST_AVATAR, GET_ORGANIZATION];

export function fetchStoreInterceptor(
  url,
  options,
  response,
  body,
  updateOperations
) {
  const method = _.get(options, 'method', 'GET');

  if (!response.ok) {
    return;
  }

  if (method === 'GET') {
    if (GET_ORGANIZATION.test(url)) {
      updateOperations.updateOrganizations([body]);
    }
  }

  if (method === 'POST') {
    const isOrganizationBody = ORGANIZATION_IN_BODY.some(regex => regex.test(url));

    if (isOrganizationBody) {
      updateOperations.updateOrganizations([body]);
    }
  }

  if (method === 'GET') {
    if (GET_USER_ORGANIZATIONS.test(url)) {
      const [ userId ] = url.match(OBJECT_ID_REGEX_PORTION);
      updateOperations.updateOrganizations(body.entity);
      updateOperations.updateUserOrganizations(userId, options.query.page, body.count, body.entity);
    }
  }
}
