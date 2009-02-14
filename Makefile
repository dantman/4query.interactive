FQ_DIR = ${PWD}/4query
SRC_DIR = ${PWD}/src
DIST_DIR = ${PWD}/dist
CP=cp # You can run `make all CP="ln -s"` to create symbolic links to the src/ directory for continual development

all: interactive
interactive:
	@@echo "Building interactive"
	
	@@mkdir -p ${DIST_DIR}
	@@${CP} ${SRC_DIR}/* ${DIST_DIR}
	
	@@echo "interactive built"
	
	@@echo "Adding 4query.js to dist"
	@@cd ${FQ_DIR}; make DIST_DIR=${DIST_DIR} 4query
	@@echo

clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}
	@@cd ${FQ_DIR}; make clean

