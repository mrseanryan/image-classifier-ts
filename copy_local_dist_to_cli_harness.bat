SETLOCAL

REM For local testing without having to re-publish
REM but testing *global* install is trickier.

ECHO === Updating the cli-harness ===

SET DEST_DIR=itest\testHarness\cli-harness\cli-in-simple-typescript-project\node_modules\image-classifier-ts\dist

IF EXIST %DEST_DIR% (rmdir /q/s %DEST_DIR%)

xcopy dist %DEST_DIR% /E/I/Y/Q

ECHO === Updating the library-harness ===

SET DEST_DIR=itest\testHarness\library-harness\find-images-by-label-cli\node_modules\image-classifier-ts\dist
IF EXIST %DEST_DIR% (rmdir /q/s %DEST_DIR%)

xcopy dist %DEST_DIR% /E/I/Y/Q
