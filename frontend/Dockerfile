FROM node:18-alpine

# TODO : changer pour la production à la fin
ENV NODE_ENV=development

RUN mkdir -p /frontend
WORKDIR /frontend

# meme logique que pour le backend
# COPY package*.json ./

RUN npm install


COPY . .


EXPOSE 3000

# TODO besoin de changer pour la production à la fin 
CMD ["npm", "start"]