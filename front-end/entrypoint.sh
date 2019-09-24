#!/bin/bash

sed -i 's/localhost/'"$BACKEND_HOSTNAME"'/g' /usr/src/app/dist/index.html
sed -i 's/registrationSecret/'"$REGISTRATION_SECRET"'/g' /usr/src/app/dist/index.html

http-server dist