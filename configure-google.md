# Configure the Google Geocoding and Vision APIs

Setup a Google Cloud project

-   enable the [Google Geo coding API](https://developers.google.com/maps/documentation/geocoding/start)

-   enable the [Google Vision API](https://cloud.google.com/vision/docs/before-you-begin)

-   take a note of the cloud project id.

## Options

### Option 1 (Recommended) - BILLED Google Vision API and Geocoding API

-  setup billing - since the free quota is tiny ...

-   Visit the [Google Developers Console][dev-console].
-   Create a new project or click on an existing project.
-   Navigate to **APIs & auth** > **APIs section** and make sure the following APIs are enabled (you may need to enable billing in order to use these services):
    -   Google Geocoding API
    -   Google Cloud Vision API

#### Get an API key (text) for the Geocoding API

-   Navigate to Google Maps -> APIs -> Geocoding API
-   create an API key and copy it to a text editor

-   set the environment variable for your OS user:

    IMAGE_CLASSIFIER_TS_API_KEY={your Google Cloud key that has Geocoding API enabled}

#### Get an API JSON file for the Vision API

-   Navigate to **APIs & auth** > **Credentials**

    -   If you want to use a new service account, click on **Create new Client ID** and select **Service account**. After the account is created, you will be prompted to download the JSON key file that the library uses to authenticate your requests.
    -   If you want to generate a new key for an existing service account, click on **Generate new JSON key** and download the JSON key file.
    -   Note: for each machine you wish to use, you will need to either copy the JSON file to the new machine OR create a new key and JSON file. It's probably more secure to create a new JSON file for each machine.

-   set the environment variable for your OS user:
    
    GOOGLE_APPLICATION_CREDENTIALS={path to the JSON file}

-   restart any command prompts

___ 

### Option 2 (NOT Recommended) - FREE Google Vision API - but no Geocoding

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

This gives you default (anonymous?) credentials, with a (small) free quota.

This does NOT give you access to the Geocoding API.

___

# Troubleshooting

If you have difficulties configuring the Google Cloud APIs, please consult the official documentation:

-   [Google Geo coding API](https://developers.google.com/maps/documentation/geocoding/start)

-   [Google Vision API](https://cloud.google.com/vision/docs/before-you-begin)

You can always drop me a mail at **Mr.Sean.Ryan{at}gmail.com**
