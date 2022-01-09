
function upgrade()
{
    echo "."
    echo "=============="
    echo "yarn upgrade..."
    pwd
    echo "."

    ./update-and-test.sh
    echo "."
    echo "."
}

pushd itest/testHarness

pushd cli-harness
pushd cli-in-simple-typescript-project
upgrade
popd
pushd global-cli-test
upgrade
popd

popd

pushd library-harness/find-images-by-label-cli
upgrade
popd
popd
