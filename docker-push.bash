#!/bin/bash

if [ $TRAVIS_BRANCH == "master" ]
then
  envsubst < server/settings-production.js >  server/settings.js
fi

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t luissaybe/jivecake .
docker push luissaybe/jivecake:latest
docker logout
