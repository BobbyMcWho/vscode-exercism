#!/bin/bash

jq -cr 'keys[] as $k | "\($k)\n\(.[$k])"' '../tracks.json' | while read -r key; do
  fname=$(jq --raw-output ".[$key].id" '../tracks.json').json
  read -r item
  printf '%s\n' "$item" > "./$fname"
done