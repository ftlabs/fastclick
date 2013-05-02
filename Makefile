SHELL := /bin/bash

QS=compilation_level=SIMPLE_OPTIMIZATIONS&output_format=text
URL=http://closure-compiler.appspot.com/compile
CODE=js_code@lib/fastclick.js

CHECK=\033[32m✔\033[39m

build/fastclick.min.js: lib/fastclick.js
	@mkdir -p build
	@echo -n "Building build/fastclick.min.js...                  "
	@curl --silent --show-error --data-urlencode "${CODE}" --data "${QS}&output_info=compiled_code" ${URL} -o build/fastclick.min.js
	@echo -e "${CHECK} Done"
	@echo -n "Getting compression stats...                        "
	@echo -e "${CHECK} Done\n\n" "`curl --silent --show-error --data-urlencode "${CODE}" --data "${QS}&output_info=statistics" ${URL}`"
	@echo ${STATS}

clean:
	rm -rf build

.PHONY: clean
