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
        "defaultLayout": "a4-landscape",
        "defaultDpi": 96,
        "defaultScale": 1000000,
        "defaultScaleEnabled": true,
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
        "allowedFormats": [
            "pdf",
            "png32"
        ],
        "allowedLayouts": [
            "a3-landscape",
            "a3-portrait",
            "a4-landscape",
            "a4-portrait"
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

| Property                       | Type               | Possible Values                    | Default                              | Description                                                                                                                                                                                                                       |
|--------------------------------|--------------------|------------------------------------|--------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| showPrintPreview               | Boolean            | ```true``` &#124; ```false```      | ```true```                           | Enable the print preview.                                                                                                                                                                                                         |
| showAdvancedOptions            | Boolean            | ```true``` &#124; ```false```      | ```true```                           | Show advanced options.                                                                                                                                                                                                            |
| showDpiSelect                  | Boolean            | ```true``` &#124; ```false```      | ```true```                           | Show DPI select.                                                                                                                                                                                                                  |
| layoutTemplatesInfoTaskName    | String             |                                    | ```Get Layout Templates Info Task``` | Layout templates task name.                                                                                                                                                                                                       |
| defaultPageUnit                | String             | ```MILLIMETER, CENTIMETER, INCH``` | ```CENTIMETER```                     | Default template unit (ArcGIS Server < 10.6).                                                                                                                                                                                     |
| defaultFormat                  | String             |                                    | ```JPG```                            | Default print format.                                                                                                                                                                                                             |
| defaultLayout                  | String             |                                    | ```a4-landscape```                   | Default print template.                                                                                                                                                                                                           |
| defaultDpi                     | Number             |                                    | ```96```                             | Default dpi value.                                                                                                                                                                                                                |
| defaultScale                   | Number             |                                    | ```null```                           | Default scale value.                                                                                                                                                                                                              |
| defaultScaleEnabled            | Boolean            | ```true``` &#124; ```false```      | ```true```                           | Enables the fix scale checkbox on app start.                                                                                                                                                                                      |
| dpiValues                      | Array              |                                    | ```[]```                             | Available dpi values.                                                                                                                                                                                                             |
| scaleValues                    | Array              |                                    | ```[]```                             | Available scale values. If the array is filled, a select will be available in the UI instead of a text field.                                                                                                                     |
| allowedFormats                 | String or String[] |                                    | ```all```                            | Specify the print output file format(s) that the user can select based on the options available from the print service. See: https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Print.html#allowedFormats |
| allowedLayouts                 | String or String[] |                                    | ```all```                            | Specify the print output layout(s) that the user can select based on the options available from the print service. See: https://developers.arcgis.com/javascript/latest/api-reference/esri-widgets-Print.html#allowedLayouts      |
| printingPreviewSymbol          | Object             |                                    | see sample configuration             | Print preview symbol.                                                                                                                                                                                                             |
| useUsernameAsAuthor            | Boolean            | ```true``` &#124; ```false```      | ```true```                           | Use the currently logged in user to pre-enter the author.                                                                                                                                                                         |
| usernameAttributes             | Array              |                                    | ```["givenname","sn"]```             | Attributes of the user for determining the user name.                                                                                                                                                                             |
| customTextElements             | Array              |                                    | ```[]```                             | Define custom text elements that are available in the print template. You can use strings or replacer for values of the user object.                                                                                              |
