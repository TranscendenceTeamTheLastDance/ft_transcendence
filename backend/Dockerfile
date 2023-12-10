FROM node:18-alpine

# TODO : changer pour la production à la fin
ENV NODE_ENV=development

RUN mkdir -p /backend
WORKDIR /backend

# À ce stade, nous devons uniquement copier le package.json et le package-lock.json
# ainsi que le dossier prisma pour installer les dépendances via npm install
# nous profitons des couches mises en cache de Docker pour ne pas réinstaller les dépendances
# chaque fois que nous modifions le code, mais seulement lors de modifications dans les fichiers package.json ou prisma
COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# Les modules Node sont ignorés grâce au fichier .gitgnore pour éviter
# de réécrire les dépendances téléchargées
COPY . .

RUN npx prisma generate

# Ne fonctionne pas car il ne peut pas accéder à la base de données
# RUN npx prisma migrate dev --name init

EXPOSE 3333

# TODO : changer de start:dev à start:prod à la fin
CMD ["npm", "run", "start:dev"]
