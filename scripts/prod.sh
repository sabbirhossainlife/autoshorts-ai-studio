#!/bin/sh
set -e
cd apps/web && npm run build
cd ../api && npm run prisma:deploy && npm start
