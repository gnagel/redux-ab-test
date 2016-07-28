
.PHONY: all clean bootstrap test lint flow publish

all: clean bootstrap test lint flow

clean:
	rm -rf ./node_modules ./dist

bootstrap:
	npm cache clear || true
	npm install --silent
	npm prune

test: bootstrap
	npm run test

lint: bootstrap
	npm run lint

flow: bootstrap
	npm run flow

build: clean bootstrap
	npm run build
