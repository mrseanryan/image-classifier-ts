# Configure Google Vision API

Setup a Google Cloud project

-   enable the [Google Geo coding API](https://developers.google.com/maps/documentation/geocoding/start)

-   enable the [Google Vision API](https://cloud.google.com/vision/docs/before-you-begin)

-   take a note of the cloud project id.

## installation

1. install the google cloud SDK

https://cloud.google.com/sdk/docs/

2. install python 2.7.9 (is bundled with the above)

3. Open a command prompt and run this:

```
gcloud auth application-default login
```

This generates a JSON file with default credentials:

```
C:\Users\{username}\AppData\Roaming\gcloud\application_default_credentials.json
```

Rename the file to something like `image-classifier-ts-credentials.json`

4.  setup billing - since the free quota is tiny ...

-   note: the free option: application_default_credentials seems to be 'anonymous' and has very limited quotas!

-   Visit the [Google Developers Console][dev-console].
-   Create a new project or click on an existing project.
-   Navigate to **APIs & auth** > **APIs section** and turn on the following APIs (you may need to enable billing in order to use these services):
    -   Google Cloud Vision API
-   Navigate to **APIs & auth** > **Credentials** and then:

    -   If you want to use a new service account, click on **Create new Client ID** and select **Service account**. After the account is created, you will be prompted to download the JSON key file that the library uses to authenticate your requests.
    -   If you want to generate a new key for an existing service account, click on **Generate new JSON key** and download the JSON key file.

-   set environment variable for your OS user:
    GOOGLE_APPLICATION_CREDENTIALS=<path to the JSON file>
    IMAGE_CLASSIFIER_TS_API_KEY=<your Google Cloud key that has Geocoding + Vision APIs enabled>

-   restart any command prompts
