#!/bin/bash

cd $SOURCE_DIRECTORY

nginx -c /root/nginx.conf
node server.js
