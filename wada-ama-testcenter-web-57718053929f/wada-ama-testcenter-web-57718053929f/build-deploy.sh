#!/bin/sh

# Warning: this script will build, zip and deploy the app to nexus
# Before running it, the version in package.json should be updated
# to the right version number and the translations located in
# src/i18n should be up to date.

# Echo on and -e cause the shell to exit immediately if a simple command exits with a nonzero exit value
set -e -x

# Install the angular dependencies
npm ci

# Generate the new translation keys if needed (here so the build won't fail)
npm run i18n:extract

# Convert proofed file to .en file
cd src/i18n
[ -f messages-proofed.xlf ] && xsltproc messages-conversion.xsl messages-proofed.xlf > messages.en.xlf

cd ../../

# Build the angular app for each language
environment=$1 npm run build

# Package everything into a single folder ready for zipping
npm run bundle

# Zip the server/testcenter-webserver folder - this step could be done via the jenkins job
npm run zip
