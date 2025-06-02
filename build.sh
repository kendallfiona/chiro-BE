#!/bin/bash

sam build

mkdir -p .aws-sam/build/AuthFunction

cp src/auth/users.json .aws-sam/build/AuthFunction/

echo "Build completed and users.json copied to AuthFunction"