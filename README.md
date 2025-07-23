# Printing Enhanced

The Printing Enhanced Bundle extends the Printing bundle by further capabilities.

![Screenshot App](https://github.com/conterra/mapapps-printing-enhanced/blob/main/screenshot.png)

## Build Status
[![devnet-bundle-snapshot](https://github.com/conterra/mapapps-printing-enhanced/actions/workflows/devnet-bundle-snapshot.yml/badge.svg)](https://github.com/conterra/mapapps-printing-enhanced/actions/workflows/devnet-bundle-snapshot.yml)

## Sample App
https://demos.conterra.de/mapapps/resources/apps/public_demo_printingenhanced/index.html

## Installation Guide
**Requirements:**
- map.apps 4.12.0 or later
- A print service that supports the _Get Layout Templates Info Task_ (https://developers.arcgis.com/rest/services-reference/get-layout-templates-info-task.htm)
- ArcGIS Server 10.4 or later (pageUnits property is supported since 10.6)

Simply add the bundle "dn_printingenhanced" to your app.

[dn_printingenhanced Documentation](https://github.com/conterra/mapapps-printing-enhanced/tree/master/src/main/js/bundles/dn_printingenhanced)

## Quick start

Clone this project and ensure that you have all required dependencies installed correctly (see [Documentation](https://docs.conterra.de/en/mapapps/latest/developersguide/getting-started/set-up-development-environment.html)).

Then run the following commands from the project root directory to start a local development server:

```bash
# install all required node modules
$ mvn initialize

# start dev server
$ mvn compile -Denv=dev -Pinclude-mapapps-deps

# run unit tests
$ mvn test -P run-js-tests,include-mapapps-deps
```
