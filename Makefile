SRC_DIR = ${PWD}/src
DIST_DIR = ${PWD}/dist

interactive:
	@@echo "Building interactive"
	
	@@mkdir -p ${DIST_DIR}
	@@cp ${SRC_DIR}/* ${DIST_DIR}
	
	@@echo "interactive built"
	
	@@echo "Adding 4query.js to dist"
	@@cd ../../jquery; make clean
	@@cd ../../jquery; make DIST_DIR=${DIST_DIR} 4query
	@@echo

clean:
	@@echo "Removing Distribution directory:" ${DIST_DIR}
	@@rm -rf ${DIST_DIR}
