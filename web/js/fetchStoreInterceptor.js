import _ from 'lodash';

import { OBJECT_ID_REGEX_PORTION } from 'common/helpers';

const GET_USER_ORGANIZATIONS = new RegExp('/user/.+/organization');
const POST_ORGANIZATION = new RegExp('/organization');
const GET_ORGANIZATION = new RegExp('/organization/.{24}');
const POST_AVATAR = new RegExp('/organization/.{24}/avatar');
const ORGANIZATION_EVENTS = new RegExp('/organization/.{24}/event');

const ORGANIZATION_IN_BODY = [POST_ORGANIZATION, POST_AVATAR, GET_ORGANIZATION];

export function fetchStoreInterceptor(
  url,
  options,
  response,
  body,
  operations
) {
  if (!response.ok) {
    return;
  }

  const method = _.get(options, 'method', 'GET');

  if (method === 'GET') {
    if (GET_ORGANIZATION.test(url)) {
      operations.updateOrganizations([body]);
    }

    if (ORGANIZATION_EVENTS.test(url)) {
      const [ organizationId ] = url.match(OBJECT_ID_REGEX_PORTION);
      operations.updateEvents(body.entity);
      operations.updateOrganizationEvents(organizationId, options.query.page, body.count, body.entity);
    }
  }

  if (method === 'POST') {
    const isOrganizationBody = ORGANIZATION_IN_BODY.some(regex => regex.test(url));

    if (url === '/token/password') {
      operations.updateUsers([ body.user ]);
      operations.updateCredentials({
        userId: body.user._id,
        token: body.token
      });
    }

    if (url === '/account') {
      operations.updateUsers([ body ]);
    }

    if (isOrganizationBody) {
      operations.updateOrganizations([body]);
    }
  }

  if (method === 'GET') {
    if (GET_USER_ORGANIZATIONS.test(url)) {
      const [ userId ] = url.match(OBJECT_ID_REGEX_PORTION);
      operations.updateOrganizations(body.entity);
      operations.updateUserOrganizations(userId, options.query.page, body.count, body.entity);
    }
  }
}
