#!/bin/sh

export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public"

npm install
npx prisma generate

echo "-----Migrating database-----"

while true; do
	echo "-----Migrating database try-----"
	npx prisma migrate dev --name init
	EXIT_CODE=$?
	echo "PRISMA EXIT CODE: $EXIT_CODE"
	if [ $EXIT_CODE -eq 0 ]; then
		break
	fi
done

echo "-----Starting backend-----"

npm run start:dev