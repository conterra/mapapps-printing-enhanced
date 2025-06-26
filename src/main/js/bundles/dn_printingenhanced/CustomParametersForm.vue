<!--

    Copyright (C) 2025 con terra GmbH (info@conterra.de)

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

            http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.

-->
<template>
    <div v-if="parameters.length > 0">
        <h3>
            {{ i18n.heading }}
        </h3>
        <div
            v-for="(parameter, index) in parameters"
            :key="index"
        >
            <v-text-field
                v-model="inputs[index]"
                :value="parameter.value"
                :label="parameter.name"
            />
        </div>
    </div>
</template>
<script>
    export default {
        components: {},
        inject: ["getCustomTextElements"],
        props: {
            i18n: {
                type: Object,
                default: function () {
                    return {
                        heading: "Custom text elements"
                    };
                }
            },
            layoutTemplateName: {
                type: String,
                default: ""
            }
        },
        data() {
            return {
                inputs: []
            };
        },
        computed: {
            parameters() {
                const parametersForTemplate = this.getCustomTextElements()[this.layoutTemplateName];
                if (!parametersForTemplate) {
                    console.debug(`No custom text elements for template "${this.layoutTemplateName}" available.`);
                    return [];
                }
                return parametersForTemplate.map((param) => {
                    return {
                        name: Object.keys(param)[0],
                        value: Object.values(param)[0]
                    };
                });
            }
        },
        watch: {
            parameters(parameters) {
                // Set the initial values of the text boxes
                parameters.forEach((p, index) => {
                    this.inputs[index] = p.value;
                });
            },
            inputs(values) {
                const outputMap = this.getFilledCustomTextElementsConfig(values);
                this.$emit("change", outputMap);
            }
        },
        methods: {
            getMapWithLayoutsAsKeys() {
                const map = {};
                const textElements = this.getCustomTextElements();
                const templateLayoutNames = Object.keys(textElements);

                templateLayoutNames.forEach(layoutName => {
                    map[layoutName] = [];
                });
                return map;
            },
            getFieldNames(template) {
                const fields = this.getCustomTextElements()[template];
                return fields.map(field => Object.keys(field)[0]);
            },
            getFilledCustomTextElementsConfig(inputValues) {
                const fieldNames = this.getFieldNames(this.layoutTemplateName);
                const fieldList = [];
                const outputMap = this.getMapWithLayoutsAsKeys();
                outputMap[this.layoutTemplateName] = fieldList;
                inputValues.forEach((input, index) => {
                    fieldList.push({
                        [fieldNames[index]]: input
                    });
                });
                return outputMap;
            }
        }
    };
</script>
