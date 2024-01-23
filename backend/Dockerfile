FROM node:16

# TODO : changer pour la production à la fin
ENV NODE_ENV=development

RUN mkdir -p /backend
WORKDIR /backend

EXPOSE 3333

COPY ./backend.sh /backend.sh
RUN chmod 755 /backend.sh
ENTRYPOINT ["/backend.sh"]