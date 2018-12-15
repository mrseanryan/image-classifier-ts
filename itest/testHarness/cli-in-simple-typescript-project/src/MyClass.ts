namespace browser {
    export function debug(message: string) {
        // do nothing
    }
}

class MyClass {
    testBanReturnVoid(reject: () => void) {
        return void reject();
    }

    testBanReturnVoidResolve(resolve: () => void) {
        return void resolve();
    }

    testBanDebug() {
        browser.debug("A breakpoint");
        debugger;
    }
}
