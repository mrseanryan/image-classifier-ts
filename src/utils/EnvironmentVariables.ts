const API_KEY_ENV_VAR = "IMAGE_CLASSIFIER_TS_API_KEY";
const GOOGLE_CRED_LOCATION_ENV_VAR = "GOOGLE_APPLICATION_CREDENTIALS";

export namespace EnvironmentVariables {
    export function validateOrThrow() {
        if (!getGoogleCredentialsLocation()) {
            throw new Error(getErrorMessage(GOOGLE_CRED_LOCATION_ENV_VAR));
        }

        getApiKeyOrThrow();

        // note: Google's code seems to kick in as part of the process running,
        // so an exception is also thrown from their code.
    }

    function getErrorMessage(envVar: string): string {
        return `You need to set the environment variable '${envVar}' - please see the 'configure-google.md' readme.`;
    }

    export function getApiKeyOrThrow(): string {
        const key = getApiKey();
        if (key) {
            return key;
        }

        throw new Error(getErrorMessage(API_KEY_ENV_VAR));
    }

    function getGoogleCredentialsLocation(): string | undefined {
        return process.env[GOOGLE_CRED_LOCATION_ENV_VAR];
    }

    function getApiKey(): string | undefined {
        return process.env[API_KEY_ENV_VAR];
    }
}
