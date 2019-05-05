#!/bin/bash

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
docker build -t luissaybe/jivecake .
docker push luissaybe/jivecake:latest
