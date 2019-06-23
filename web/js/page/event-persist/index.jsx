import React, { useContext, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import Compressor from 'compressorjs';
import { toast } from 'react-toastify';

import { T } from 'common/i18n';
import { MAXIMUM_IMAGE_UPLOAD_BYTES, ORGANIZATION_SCHEMA } from 'common/schema';
import {
  ORGANIZATIONS_PATH,
  ORGANIZATION_EVENTS_PATH,
  EVENT_AVATAR_PATH,
  EVENT_PATH,
  USER_ORGANIZATIONS_PATH
} from 'common/routes';

import { routes } from 'web/js/routes';
import {
  ApplicationContext,
  SetApplicationStateContext,
  EventContext,
  FetchStateContext,
  FetchDispatchContext,
  UserContext
} from 'web/js/context';
import {
  CREATE_ORGANIZATION,
  CREATE_EVENT,
  UPDATE_EVENT,
  GET_USER_ORGANIZATIONS,
  UPDATE_EVENT_AVATAR,
  GET_ORGANIZATION,
  UPDATE_ORGANIZATION_AVATAR,
  GET_EVENT
} from 'web/js/reducer/useFetch';
import { safe } from 'web/js/helper';
import { UPDATE_SUCCESS } from 'web/js/helper/text';
import { Input } from 'web/js/component/input';
import { OrganizationEmailNotice } from 'web/js/component/organization-email-notice';
import { Button } from 'web/js/component/button';
import { MessageBlock } from 'web/js/component/message-block';
import { AvatarImageUpload } from 'web/js/component/avatar-image-upload';
import { CurrencySelector } from 'web/js/component//currency-selector';
import { Loading } from 'web/js/page/loading';

import './style.scss';

export function EventPersistComponent({ history, match: { params: { eventId } } }) {
  const fetchState = useContext(FetchStateContext);
  const [ dispatchFetch, dispatchFetchDelete ] = useContext(FetchDispatchContext);
  const applicationState = useContext(ApplicationContext);
  const eventMap = useContext(EventContext);
  const usersMap = useContext(UserContext);
  const setApplicationState = useContext(SetApplicationStateContext);

  const createEventState = fetchState[CREATE_EVENT];
  const getEventState = fetchState[GET_EVENT];
  const updateEventState = fetchState[UPDATE_EVENT];
  const createOrganizationState = fetchState[CREATE_ORGANIZATION];
  const updateEventAvatarState = fetchState[UPDATE_EVENT_AVATAR];

  const user = usersMap[applicationState.userId];
  const fetchedEvent = eventMap[eventId];
  const [ name, setName ] = useState(fetchedEvent ? fetchedEvent.name : '');
  const [ currency, setCurrency ] = useState(fetchedEvent ? fetchedEvent.currency : null);
  const [ eventAvatarLoading, setEventAvatarLoading ] = useState(false);
  const [ organizationName, setOrganizationName ] = useState('');
  const [ organizationEmail, setOrganizationEmail ] = useState(user.email);
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
        quality: MAXIMUM_IMAGE_UPLOAD_BYTES / file.size,
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

    const eventBody = {
      name,
      published: false,
      currency: currency || null
    };

    if (eventId) {
      const doNotContinue = fetchedEvent.currency !== null && eventBody.currency !== fetchedEvent.currency &&
        !window.confirm(T('You are changing currencies. Are you sure you want to update?'));

      if (doNotContinue) {
        return;
      }

      dispatchFetch([EVENT_PATH, eventId], {
        method: 'POST',
        body: eventBody
      }, UPDATE_EVENT);

      if (eventAvatarBlob) {
        dispatchFetch([EVENT_AVATAR_PATH, eventId], {
          method: 'POST',
          body: eventAvatarBlob
        }, UPDATE_EVENT_AVATAR);
      }
    } else if (applicationState.organizationId) {
      dispatchFetch([ORGANIZATION_EVENTS_PATH, applicationState.organizationId], {
        method: 'POST',
        body: eventBody
      }, CREATE_EVENT);
    } else {
      dispatchFetch(ORGANIZATIONS_PATH, {
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
      [USER_ORGANIZATIONS_PATH, applicationState.userId],
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
        GET_EVENT
      ]);
    };
  }, []);

  useEffect(() => {
    if (safe(() => updateEventState.response.ok)) {
      dispatchFetchDelete([ UPDATE_EVENT ]);

      if (!loading) {
        toast(UPDATE_SUCCESS);
      }
    }
  }, [ updateEventState, eventId ]);

  useEffect(() => {
    if (safe(() => updateEventAvatarState.response.ok)) {
      dispatchFetchDelete([ UPDATE_EVENT_AVATAR ]);
      setEventAvatarBlob(null);
      toast(UPDATE_SUCCESS);
    }
  }, [ updateEventAvatarState, eventId ]);

  useEffect(() => {
    if (eventId) {
      dispatchFetch([EVENT_PATH, eventId], {}, GET_EVENT);
    }
  }, [ eventId ]);

  useEffect(() => {
    if (safe(() => createEventState.response.ok)) {
      dispatchFetchDelete([ CREATE_EVENT ]);
      history.push(routes.event(createEventState.body._id));
    }
  }, [ createEventState ]);

  useEffect(() => {
    if (fetchedEvent) {
      setName(fetchedEvent.name);
      setEventAvatar(fetchedEvent.avatar);
      setCurrency(fetchedEvent.currency);
    }
  }, [ fetchedEvent ]);

  useEffect(() => {
    if (!safe(() => createEventState.response.ok)) {
      return;
    }

    if (eventAvatarBlob) {
      dispatchFetch([EVENT_AVATAR_PATH, createEventState.body._id], {
        method: 'POST',
        body: eventAvatarBlob
      }, UPDATE_EVENT_AVATAR);
    } else {
      history.push(routes.event(createEventState.body._id));
    }
  }, [ createEventState ]);

  useEffect(() => {
    if (!safe(() => createOrganizationState.response.ok)) {
      return;
    }

    const eventBody = {
      name,
      published: false,
      currency: currency || null
    };

    const organizationId = createOrganizationState.body._id;
    dispatchFetchDelete([ CREATE_ORGANIZATION ]);
    dispatchFetch([ORGANIZATION_EVENTS_PATH, organizationId], {
      method: 'POST',
      body: eventBody
    }, CREATE_EVENT);

    if (applicationState.organizationId !== organizationId) {
      setApplicationState({ ...applicationState, organizationId });
    }
  }, [ createOrganizationState, name, applicationState ]);

  let organizationFields;

  if (!applicationState.organizationId && !eventId) {
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
            maxLength={ORGANIZATION_SCHEMA.properties.name.maxLength}
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
            maxLength={ORGANIZATION_SCHEMA.properties.name.email}
          />
          <OrganizationEmailNotice />
        </div>
      </>
    );
  }

  const messages = [];

  if (eventAvatarBlob && !eventAvatarBlob.type.startsWith('image')) {
    messages.push(T('Please choose an image'));
  }

  if (unableToCompressFile) {
    messages.push(T('Unable to compress image file'));
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
      <div styleName='form-row'>
        <label styleName='label'>
          {T('Currency')}
        </label>
        <CurrencySelector
          autoComplete='transaction-currency'
          styleName='selector'
          value={currency || ''}
          onChange={e => setCurrency(e.target.value)}
        />
        {eventId && (
          <div styleName='note'>
            {T('Careful, changing your currency will change the price of your items.')}
          </div>
        )}
      </div>
      {organizationFields}
      {messages.map(message => <MessageBlock key={message}>{message}</MessageBlock>)}
      <Button loading={loading}>
        {submitText}
      </Button>
    </form>
  );
}

EventPersistComponent.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export const EventPersist = withRouter(EventPersistComponent);
