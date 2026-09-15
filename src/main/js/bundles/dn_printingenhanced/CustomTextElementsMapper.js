/*
 * Copyright (C) 2025 con terra GmbH (info@conterra.de)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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