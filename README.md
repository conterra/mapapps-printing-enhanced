# Printing Enhanced
The Printing Enhanced Bundle extends the Printing bundle by further capabilities.
Printing documentation: https://developernetwork.conterra.de/en/documentation/mapapps/39/developers-documentation/ags-printing

## Sample App
https://demos.conterra.de/mapapps/resources/apps/downloads_agsprinting_enhanced4/index.html

## Installation Guide
**Requirements:**
- map.apps 4.6.0 or later
- ArcGIS Server 10.4 or later (pageUnits property is supported since 10.6)

Simply add the bundle "dn_printingenhanced" to your app.

### Configurable Components of dn_printingenhanced:
```
"dn_printingenhanced": {
    "Config": {
        "hidePrintPreview": false,
        "showAdvancedOptions": true,
        "layoutTemplatesInfoTaskName": "Get Layout Templates Info Task",
        "defaultPageUnit": "CENTIMETERS",
        "defaultFormat": "JPG",
        "defaultTemplate": "A4 Portrait", 
        "defaultDPI": 96,
        "dpiValues": [
            {
                "value": 96,
                "text": "96"
            },
            {
                "value": 150,
                "text": "150"
            },
            {
                "value": 300,
                "text": "300"
            }
        ],
        "hideFormats": [
            "GIF",
            "EPS",
            "SVG",
            "SVGZ"
        ],
        "hideTemplates": [
            "Letter ANSI A Landscape",
            "Letter ANSI A Portrait",
            "Tabloid ANSI B Landscape",
            "Tabloid ANSI B Portrait"
        ],
        "printingPreviewSymbol": {
            "type": "simple-fill",
            "color": [
                255,
                0,
                0,
                0.25
            ],
            "style": "solid",
            "outline": {
                "color": [
                    255,
                    0,
                    0,
                    1
                ],
                "width": "2px"
            }
        }
    }
}
```

##### Properties
| Property                       | Type    | Possible Values                 | Default                              | Description                                  |
|--------------------------------|---------|---------------------------------|--------------------------------------|----------------------------------------------|
| hidePrintPreview               | Boolean | ```true``` &#124; ```false```   | ```false```                          | Hide the print preview                       |
| showAdvancedOptions            | Boolean | ```true``` &#124; ```false```   | ```true```                           | Show advanced options                        |
| layoutTemplatesInfoTaskName    | String  |                                 | ```Get Layout Templates Info Task``` | Layout templates task name                   |
| defaultPageUnit                | String  |                                 | ```CENTIMETERS```                    | Default template unit (ArcGIS Server < 10.6) |
| defaultFormat                  | String  |                                 | ```JPG```                            | Default print format                         |
| defaultTemplate                | String  |                                 | ```A4 Portrait```                    | Default print template                       |
| defaultDPI                     | Number  |                                 | ```96```                             | Default DPI value                            |
| dpiValues                      | Array   |                                 | ```[]```                             | Available DPI values                         |
| hideFormats                    | Array   |                                 | ```[]```                             | Hided print formats                          |
| hideTemplates                  | Array   |                                 | ```[]```                             | Hided print templates                        |
| printingPreviewSymbol          | Object  |                                 |                                      | Print preview symbol                         |

## Development Guide
### Define the mapapps remote base
Before you can run the project you have to define the mapapps.remote.base property in the pom.xml-file:
`<mapapps.remote.base>http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%</mapapps.remote.base>`

### Other methods to to define the mapapps.remote.base property.
1. Goal parameters
`mvn install -Dmapapps.remote.base=http://%YOURSERVER%/ct-mapapps-webapp-%VERSION%`

2. Build properties
Change the mapapps.remote.base in the build.properties file and run:
`mvn install -Denv=dev -Dlocal.configfile=%ABSOLUTEPATHTOPROJECTROOT%/build.properties`
