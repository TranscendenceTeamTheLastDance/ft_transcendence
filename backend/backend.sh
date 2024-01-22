#!/bin/sh

npm install
npm i --save class-validator class-transformer
npm add argon2

npx prisma reset --force

npx prisma migrate deploy

echo "-----Migrating database-----"


sleep 10
# npx prisma db push
# npx prisma migrate dev --name sheesh

echo "-----Starting Prisma Studio on port 5555-----"

npx prisma studio --port 5555 &

echo "-----Starting backend-----"

npm run start:dev
