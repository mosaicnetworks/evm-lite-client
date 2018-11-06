up: build link
clean: clean-cli clean-lib unlink

build: build-lib build-cli
link:
	bash -c "cd cli && npm link && cd .."
unlink:
	bash -c "cd cli && npm unlink && cd .."

# Build CLI dependencies
build-cli:
	bash -c "npm run build:cli"

# Build Client dependencies
build-lib:
	bash -c "npm run build:lib"

clean-lib:
	bash -c "npm run clean:lib"

clean-cli:
	bash -c "npm run clean:cli"

.PHONY: up link clean clean-lib clean-cli build build-cli build-lib