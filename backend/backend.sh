#!/bin/sh

npm install -g pnpm

echo "--- Installing dependencies ----"
pnpm install

echo "--- Argon being installed / rebuilded ----"
pnpm add class-validator class-transformer argon2
# pnpm rebuild argon2

echo "-----Database stuff-----"
npx prisma reset --force
npx prisma generate

echo "-----Migrating database-----"
npx prisma migrate dev --name chat_model

echo "-----Starting Prisma Studio on port 5555-----"
npx prisma studio --port 5555 &

echo "-----Starting backend-----"
pnpm run start:dev
