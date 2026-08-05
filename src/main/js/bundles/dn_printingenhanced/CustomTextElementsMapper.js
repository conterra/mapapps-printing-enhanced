
export default {
    mapToEsriCustomTextElements(ourCustomTextElements) {
        if (!ourCustomTextElements || ourCustomTextElements.length === 0) return [];
        const esriCustomTextElements = ourCustomTextElements.map((textElement) => {
            let esriTextElement = {};
            esriTextElement[textElement.elementFieldName] =  textElement.value
            return esriTextElement;
        })
        return esriCustomTextElements;
    },

    addValuePropertyToTextElements(ourCustomTextElements) {
        return ourCustomTextElements.length > 0 ? ourCustomTextElements.map((textElement) => {return {...textElement, value: ''}}) : [];
    }
}