# dn_printingenhanced

The Printing Enhanced Bundle extends the Printing bundle by further capabilities.

## Usage
Simply add the bundle "dn_printingenhanced" to your app.

## Configuration Reference

```json
"dn_printingenhanced": {
    "Config": {
        "showPrintPreview": true,
        "showAdvancedOptions": true,
        "showDpiSelect": true,
        "layoutTemplatesInfoTaskName": "Get Layout Templates Info Task",
        "defaultPageUnit": "CENTIMETER",
        "defaultFormat": "JPG",
        "defaultTemplate": "A4 Portrait",
        "defaultDpi": 96,
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
        },
        "useUsernameAsAuthor": true,
        "usernameAttributes": [
            "givenname",
            "sn"
        ],
        "customTextElements": [
            {
                "email": "${mail}"
            },
            {
                "city": "${city}"
            },
            {
                "country": "${country}"
            },
            {
                "phonenumber": "${phonenumber}"
            },
            {
                "sn": "${sn}"
            },
            {
                "street": "${street}"
            },
            {
                "testString": "testString"
            }
        ]
    }
}
```

| Property                       | Type    | Possible Values                    | Default                              | Description                                                                                                                          |
|--------------------------------|---------|------------------------------------|--------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| showPrintPreview               | Boolean | ```true``` &#124; ```false```      | ```true```                           | Enable the print preview.                                                                                                            |
| showAdvancedOptions            | Boolean | ```true``` &#124; ```false```      | ```true```                           | Show advanced options.                                                                                                               |
| showDpiSelect                  | Boolean | ```true``` &#124; ```false```      | ```true```                           | Show DPI select.                                                                                                                     |
| layoutTemplatesInfoTaskName    | String  |                                    | ```Get Layout Templates Info Task``` | Layout templates task name.                                                                                                          |
| defaultPageUnit                | String  | ```MILLIMETER, CENTIMETER, INCH``` | ```CENTIMETER```                     | Default template unit (ArcGIS Server < 10.6).                                                                                        |
| defaultFormat                  | String  |                                    | ```JPG```                            | Default print format.                                                                                                                |
| defaultTemplate                | String  |                                    | ```A4 Portrait```                    | Default print template.                                                                                                              |
| defaultDpi                     | Number  |                                    | ```96```                             | Default DPI value.                                                                                                                   |
| dpiValues                      | Array   |                                    | ```[]```                             | Available DPI values.                                                                                                                |
| hideFormats                    | Array   |                                    | ```[]```                             | Hided print formats.                                                                                                                 |
| hideTemplates                  | Array   |                                    | ```[]```                             | Hided print templates.                                                                                                               |
| printingPreviewSymbol          | Object  |                                    |                                      | Print preview symbol.                                                                                                                |
| useUsernameAsAuthor            | Boolean | ```true``` &#124; ```false```      | ```true```                           | Use the currently logged in user to pre-enter the author.                                                                            |
| usernameAttributes             | Array   |                                    | ```["givenname","sn"]```             | Attributes of the user for determining the user name.                                                                                |
| customTextElements             | Array   |                                    | ```[]```                             | Define custom text elements that are available in the print template. You can use strings or replacer for values of the user object. |
