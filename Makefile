.PHONY: dev-db dev migrate generate prod-build prod-up prod-down prod-logs prod-migrate lint format

# -- Dev --
dev-db:
	docker compose --profile dev up db-dev -d

dev:
	npm run dev

migrate:
	npx prisma migrate dev

generate:
	npx prisma generate

# -- Prod --
prod-deploy: prod-build prod-up

prod-build:
	docker compose --profile prod build

prod-up:
	docker compose --profile prod up -d

prod-down:
	docker compose --profile prod down

prod-logs:
	docker compose --profile prod logs -f

prod-migrate:
	docker compose --profile prod exec app npx prisma migrate deploy

# -- Quality --
lint:
	npm run lint

format:
	npm run format
