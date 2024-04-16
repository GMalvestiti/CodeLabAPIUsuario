#!/bin/bash

echo "Container started"

# tail -f /dev/null

npm cache clean --force
npm dedupe
npm run start:debug