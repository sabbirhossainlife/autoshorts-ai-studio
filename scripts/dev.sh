#!/bin/sh
set -e
cd apps/api && (npm run dev &) 
cd ../web && npm run dev
