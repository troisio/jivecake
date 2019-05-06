import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import _ from 'lodash';

import { T } from 'common/i18n';
import { MAXIMUM_IMAGE_UPLOAD_BYTES } from 'common/schema';

import { routes } from 'js/routes';
import {
  ApplicationContext,
  EventContext,
  FetchStateContext,
  FetchDispatchContext,
  OrganizationContext
} from 'js/context';
import {
  CREATE_ORGANIZATION,
  CREATE_EVENT,
  UPDATE_EVENT,
  GET_USER_ORGANIZATIONS,
  UPDATE_EVENT_AVATAR,
  GET_ORGANIZATION,
  UPDATE_ORGANIZATION_AVATAR,
  GET_EVENT,
  UPDATE_USER
} from 'js/reducer/useFetch';

import { safe } from 'js/helper';
import { Input } from 'component/input';
import { Button } from 'component/button';
import { MessageBlock } from 'component/message-block';
import { AvatarImageUpload } from 'component/avatar-image-upload';
import { Loading } from 'page/loading';

import './style.scss';

export function EventPersistComponent({ history, match: { params: { eventId } } }) {
  const fetchState = useContext(FetchStateContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const applicationState = useContext(ApplicationContext);
  const organizationMap = useContext(OrganizationContext);
  const eventMap = useContext(EventContext);

  const organization = organizationMap[applicationState.organizationId];

  const createEventState = fetchState[CREATE_EVENT];
  const getEventState = fetchState[GET_EVENT];
  const updateEventState = fetchState[UPDATE_EVENT];
  const createOrganizationState = fetchState[CREATE_ORGANIZATION];
  const updateEventAvatarState = fetchState[UPDATE_EVENT_AVATAR];

  const fetchedEvent = eventMap[eventId];
  const [ name, setName ] = useState(fetchedEvent ? fetchedEvent.name : '');
  const [ organizationId, setOrganizationId ] = useState(organization ? organization._id : null);
  const [ organizationName, setOrganizationName ] = useState('');
  const [ organizationEmail, setOrganizationEmail ] = useState('');
  const [ eventAvatar, setEventAvatar ] = useState(null);
  const [ eventAvatarFile, setEventAvatarFile ] = useState(null);

  const isFetchingEvent = safe(() => getEventState.fetching) &&
    eventId === safe(() => getEventState.params.eventId);

  const avatarImageUploadProps = eventAvatar ? { src: eventAvatar } : {};
  const submitText = eventId ? T('Update') : T('Create');
  const organizations = _.values(organizationMap)
    .filter(organization => organization.write.includes(applicationState.userId));
  const loading = safe(() => createEventState.fetching) ||
    safe(() => createOrganizationState.fetching) ||
    safe(() => updateEventAvatarState.fetching) ||
    safe(() => updateEventState.fetching);
  const onOrganizationChange = (e) => {
    setOrganizationId(e.target.value);
  };
  const onEventAvatar = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setEventAvatar(reader.result);
      setEventAvatarFile(file);
    };
    reader.readAsDataURL(file);
  };
  const onSubmit = e => {
    e.preventDefault();

    const canSubmit = !loading &&
      name.length > 0 &&
      ( eventId || organizationId || organizationName.length > 0);

    if (!canSubmit) {
      return;
    }

    if (eventId) {
      dispatchFetch(['event/:eventId', eventId], {
        method: 'POST',
        body: {
          name
        }
      }, UPDATE_EVENT);

      if (eventAvatarFile) {
        dispatchFetch(['event/:eventId/avatar', eventId], {
          method: 'POST',
          body: eventAvatarFile,
          headers: new Headers({'content-type': eventAvatarFile.type}),
        }, UPDATE_EVENT_AVATAR);
      }
    } else if (organizationId) {
      dispatchFetch(['organization/:organizationId/event', organizationId], {
        body: {
          name,
          published: false
        }
      }, CREATE_EVENT);
    } else {
      dispatchFetch('organization', {
        method: 'POST',
        body: {
          name: organizationName,
          email: organizationEmail
        }
      }, CREATE_ORGANIZATION);
    }
  };

  useEffect(() => {
    if (safe(() => updateEventState.response.ok)) {
      dispatchFetch(['event/:eventId', eventId], {}, GET_EVENT);
    }
  }, [ updateEventState ]);

  useEffect(() => {
    if (eventId) {
      dispatchFetch(['event/:eventId', eventId], {}, GET_EVENT);
    }
  }, [ eventId ]);

  useEffect(() => {
    if (fetchedEvent) {
      setName(fetchedEvent.name);
    }
  }, [ fetchedEvent ]);

  useEffect(() => {
    dispatchFetch(
      ['user/:userId/organization', applicationState.userId],
      {
        query: {
          page: 0
        }
      },
      GET_USER_ORGANIZATIONS
    );

    return () => {
      dispatchFetchDelete([
        CREATE_EVENT,
        GET_USER_ORGANIZATIONS,
        GET_ORGANIZATION,
        CREATE_ORGANIZATION,
        UPDATE_EVENT_AVATAR,
        UPDATE_ORGANIZATION_AVATAR,
        GET_EVENT,
        UPDATE_USER
      ]);
    };
  }, []);

  useEffect(() => {
    if (safe(() => createEventState.response.ok)) {
      if (eventAvatarFile) {
        console.log('eventAvatarFile', eventAvatarFile);

        dispatchFetch(['event/:eventId/avatar', eventId], {
          method: 'POST',
          body: eventAvatarFile,
          headers: new Headers({'content-type': eventAvatarFile.type}),
        }, UPDATE_EVENT_AVATAR);
      }

      dispatchFetch(['event/:eventId', createEventState.body._id], {}, GET_EVENT);
      history.push(routes.eventDashboard(createEventState.body._id));
    }
  }, [ createEventState ]);

  useEffect(() => {
    if (safe(() => createOrganizationState.response.ok)) {
      const organizationId = createOrganizationState.body._id;

      dispatchFetch(['user/:userId', applicationState.userId], {
        method: 'POST',
        body: {
          lastOrganizationId: organizationId
        }
      }, UPDATE_USER);

      dispatchFetch(['organization/:organizationId', organizationId], {}, GET_ORGANIZATION);

      dispatchFetch(['organization/:organizationId/event', organizationId], {
        method: 'POST',
        body: {
          name,
          published: false
        }
      }, CREATE_EVENT);
    }
  }, [ createOrganizationState, name ]);

  let organizationFields;
  let eventAvatarTooLargeMessage;

  if (organization) {
    organizationFields = (
      <div styleName='form-row'>
        <label styleName='label'>
          {T('Organization')}
        </label>
        <Input
          disabled
          value={organization.name}
        />
      </div>
    );
  } else if (organizations.length === 0)  {
    organizationFields = (
      <>
        <div styleName='form-row'>
          <label styleName='label'>
            {T('Organization Name')}
          </label>
          <Input
            required
            value={organizationName}
            onChange={e => setOrganizationName(e.target.value)}
          />
        </div>
        <div styleName='form-row'>
          <label htmlFor='create-event-organization-email' styleName='label'>
            {T('Organization Email')}
          </label>
          <Input
            required
            id='create-event-organization-email'
            type='email'
            value={organizationEmail}
            onChange={e => setOrganizationEmail(e.target.value)}
          />
        </div>
      </>
    );
  } else {
    organizationFields = (
      <select onBlur={onOrganizationChange}>
        {
          organizations.map(organization => {
            return (
              <option key={organization._id}>
                {organization.name}
              </option>
            );
          })
        }
      </select>
    );
  }

  if (eventId) {
    organizationFields = null;
  }

  if (eventAvatarFile && eventAvatarFile.size > MAXIMUM_IMAGE_UPLOAD_BYTES) {
    eventAvatarTooLargeMessage = (
      <MessageBlock>
        {T('Event avatar too large')}
      </MessageBlock>
    );
  }

  if (isFetchingEvent) {
    return <Loading />;
  }

  return (
    <form onSubmit={onSubmit} styleName='root'>
      <div styleName='form-row'>
        <label styleName='label' htmlFor='event-avatar'>
          {T('Event Avatar')}
        </label>
        <AvatarImageUpload { ...avatarImageUploadProps } id='event-avatar' onFile={onEventAvatar} />
      </div>
      <div styleName='form-row'>
        <label styleName='label'>
          {T('Event Name')}
        </label>
        <Input
          required
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </div>
      {eventAvatarTooLargeMessage}
      {organizationFields}
      <Button loading={loading}>
        {submitText}
      </Button>
    </form>
  );
}

EventPersistComponent.propTypes = {
  event: PropTypes.object,
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export const EventPersist = withRouter(EventPersistComponent);
