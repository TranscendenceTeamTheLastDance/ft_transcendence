#!/bin/sh

npm install -g pnpm

npx prisma migrate reset --force

echo "-----Migrating database-----"

npx prisma migrate dev --name sheesh

echo "-----Seeding database-----"

npx prisma db seed --preview-feature

# echo "--- Installing dependencies ----"
# pnpm install

# echo "--- Argon being installed / rebuilded ----"
# pnpm add class-validator class-transformer argon2
# # pnpm rebuild argon2

# while true; do
#     echo "-----Migrating database try-----"
#     # uncomment to reset database if error when using migrate dev (especially if columns have been deleted with values still in the db)
#     # npx prisma migrate reset --force 
#     npx prisma migrate dev --name init
#     EXIT_CODE=$?
#     echo "PRISMA EXIT CODE: $EXIT_CODE"
#     if [ $EXIT_CODE -eq 0 ]; then
#         break
#     fi
# done

echo "-----Database stuff-----"
npx prisma generate

echo "-----Starting Prisma Studio on port 5555-----"
npx prisma studio --port 5555 &

echo "-----Starting backend-----"
pnpm run start:dev
