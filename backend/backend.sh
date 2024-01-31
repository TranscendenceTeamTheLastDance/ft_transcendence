#!/bin/sh

npm install
npm i --save class-validator class-transformer
npm add argon2

npx prisma migrate reset --force

echo "-----Migrating database-----"

npx prisma migrate dev --name sheesh

echo "-----Seeding database-----"

npx prisma db seed --preview-feature

echo "-----Starting Prisma Studio on port 5555-----"

npx prisma studio --port 5555 &

echo "-----Starting backend-----"

npm run start:dev
