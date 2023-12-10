COMPOSE := docker compose
COMPOSE_FILE := docker-compose.yml

all:
	$(COMPOSE) -f $(COMPOSE_FILE) up --build

ps:
	$(COMPOSE) -f $(COMPOSE_FILE) ps

stop:
	$(COMPOSE) -f $(COMPOSE_FILE) stop

down:
	$(COMPOSE) -f $(COMPOSE_FILE) down -v

clean: down
	docker system prune -f -a --volumes

re: clean all