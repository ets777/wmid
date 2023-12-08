#! /bin/bash

export PATH="$HOME/.nvm/versions/node/v16.18.1/bin:$PATH"

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

cd $SCRIPT_DIR

npm run front-build-prod
npm run back-build-prod
npm run back-start-prod