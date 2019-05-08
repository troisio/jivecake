import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import Compressor from 'compressorjs';

import { T } from 'common/i18n';
import { MAXIMUM_IMAGE_UPLOAD_BYTES, ORGANIZATION_SCHEMA } from 'common/schema';

import { routes } from 'js/routes';
import {
  ApplicationContext,
  EventContext,
  FetchStateContext,
  FetchDispatchContext
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
  const eventMap = useContext(EventContext);

  const createEventState = fetchState[CREATE_EVENT];
  const getEventState = fetchState[GET_EVENT];
  const updateEventState = fetchState[UPDATE_EVENT];
  const createOrganizationState = fetchState[CREATE_ORGANIZATION];
  const updateEventAvatarState = fetchState[UPDATE_EVENT_AVATAR];

  const fetchedEvent = eventMap[eventId];
  const [ name, setName ] = useState(fetchedEvent ? fetchedEvent.name : '');
  const [ eventAvatarLoading, setEventAvatarLoading ] = useState(false);
  const [ organizationName, setOrganizationName ] = useState('');
  const [ organizationEmail, setOrganizationEmail ] = useState('');
  const [ eventAvatar, setEventAvatar ] = useState(fetchedEvent ? fetchedEvent.avatar : null);
  const [ eventAvatarBlob, setEventAvatarBlob ] = useState(null);
  const [ unableToCompressFile, setUnableToCompressFile ] = useState(false);

  const isFetchingEvent = safe(() => getEventState.fetching) &&
    eventId === safe(() => getEventState.params.eventId);

  const avatarImageUploadProps = eventAvatar ? { src: eventAvatar } : {};
  const submitText = eventId ? T('Update') : T('Create');
  const loading = safe(() => createEventState.fetching) ||
    safe(() => createOrganizationState.fetching) ||
    safe(() => updateEventAvatarState.fetching) ||
    safe(() => updateEventState.fetching);
  const onEventAvatar = (file) => {
    setEventAvatarLoading(true);

    if (file.size > MAXIMUM_IMAGE_UPLOAD_BYTES) {
      new Compressor(file, {
        convertSize: MAXIMUM_IMAGE_UPLOAD_BYTES,
        success(result) {
          const reader = new FileReader();
          reader.onload = () => {
            setEventAvatar(reader.result);
            setEventAvatarBlob(result);
            setEventAvatarLoading(false);
          };
          reader.readAsDataURL(result);
        },
        error() {
          setEventAvatarLoading(false);
          setUnableToCompressFile(true);
        },
      });
    } else if (file.type.startsWith('image')) {
      setEventAvatarBlob(file);

      const reader = new FileReader();
      reader.onload = () => {
        setEventAvatar(reader.result);
        setEventAvatarLoading(false);
      };
      reader.readAsDataURL(file);
    } else {
      setEventAvatarLoading(false);
    }
  };
  const onSubmit = e => {
    e.preventDefault();

    const canSubmit = !loading &&
      name.length > 0 &&
      ( eventId || applicationState.organizationId || organizationName.length > 0);

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

      if (eventAvatarBlob) {
        dispatchFetch(['event/:eventId/avatar', eventId], {
          method: 'POST',
          body: eventAvatarBlob
        }, UPDATE_EVENT_AVATAR);
      }
    } else if (applicationState.organizationId) {
      dispatchFetch(['organization/:organizationId/event', applicationState.organizationId], {
        method: 'POST',
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
        CREATE_ORGANIZATION,
        CREATE_EVENT,
        UPDATE_EVENT,
        GET_USER_ORGANIZATIONS,
        UPDATE_EVENT_AVATAR,
        GET_ORGANIZATION,
        UPDATE_ORGANIZATION_AVATAR,
        GET_EVENT,
        UPDATE_USER
      ]);
    };
  }, []);

  useEffect(() => {
    if (safe(() => updateEventState.response.ok)) {
      dispatchFetch(['event/:eventId', eventId], {}, GET_EVENT);
    }
  }, [ updateEventState, eventId ]);

  useEffect(() => {
    if (eventId) {
      dispatchFetch(['event/:eventId', eventId], {}, GET_EVENT);
    }
  }, [ eventId ]);

  useEffect(() => {
    if (safe(() => updateEventAvatarState.response.ok)) {
      if (eventId) {
        dispatchFetch(['event/:eventId', eventId], {}, GET_EVENT);
      } else {
        history.push(routes.eventDashboard(createEventState.body._id));
      }
    }
  }, [ updateEventAvatarState, eventId, createEventState ]);

  useEffect(() => {
    if (fetchedEvent) {
      setName(fetchedEvent.name);
      setEventAvatar(fetchedEvent.avatar);
    }
  }, [ fetchedEvent ]);

  useEffect(() => {
    if (safe(() => createEventState.response.ok)) {
      dispatchFetch(['event/:eventId', createEventState.body._id], {}, GET_EVENT);

      if (eventAvatarBlob) {
        dispatchFetch(['event/:eventId/avatar', createEventState.body._id], {
          method: 'POST',
          body: eventAvatarBlob
        }, UPDATE_EVENT_AVATAR);
      } else {
        history.push(routes.eventDashboard(createEventState.body._id));
      }
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

  if (!applicationState.organizationId) {
    organizationFields = (
      <>
        <div styleName='form-row'>
          <label styleName='label'>
            {T('Organization Name')}
          </label>
          <Input
            required
            autoComplete='organization'
            value={organizationName}
            onChange={e => setOrganizationName(e.target.value)}
            maxLength={ORGANIZATION_SCHEMA.name.maxLength}
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
            autoComplete='email'
            value={organizationEmail}
            onChange={e => setOrganizationEmail(e.target.value)}
            maxLength={ORGANIZATION_SCHEMA.name.email}
          />
        </div>
      </>
    );
  }

  if (eventId) {
    organizationFields = null;
  }

  const messages = [];

  if (eventAvatarBlob && !eventAvatarBlob.type.startsWith('image')) {
    messages.push(
      <MessageBlock key='invalid-file-type'>
        {T('Please choose an image')}
      </MessageBlock>
    );
  }

  if (unableToCompressFile) {
    messages.push(
      <MessageBlock key='compress'>
        {T('Unable to compress image file')}
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
        <AvatarImageUpload
          { ...avatarImageUploadProps }
          loading={eventAvatarLoading}
          id='event-avatar'
          onFile={onEventAvatar}
        />
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
      {organizationFields}
      {messages}
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
