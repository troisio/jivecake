#!/bin/bash

if [ -d $SOURCE_DIRECTORY ]; then
  cd $SOURCE_DIRECTORY
  nginx -c /root/nginx.conf
  node server.js
fi
