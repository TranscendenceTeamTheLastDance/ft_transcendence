FROM node:16

# TODO : changer pour la production à la fin
ENV NODE_ENV=development

RUN mkdir -p /frontend
WORKDIR /frontend

EXPOSE 3000

COPY ./frontend.sh /frontend.sh
RUN chmod 755 /frontend.sh
ENTRYPOINT ["/frontend.sh"]