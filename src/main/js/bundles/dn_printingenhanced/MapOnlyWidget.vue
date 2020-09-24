<!--

    Copyright (C) 2020 con terra GmbH (info@conterra.de)

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
    <v-container
        grid-list-md
        fluid
        class="pa-2">
        <v-layout
            row
            wrap>
            <v-flex
                v-if="visibleUiElements.fileName"
                md12>
                <v-text-field
                    v-model="fileNameValue"
                    :label="i18n.file"
                    :placeholder="i18n.filePlaceholder"
                    hide-details
                ></v-text-field>
            </v-flex>
            <v-flex
                v-if="visibleUiElements.format"
                md12>
                <v-select
                    v-model="formatValue"
                    :items="formatList"
                    :label="i18n.format"
                    hide-details
                ></v-select>
            </v-flex>
            <v-flex
                v-if="visibleUiElements.dpi"
                md12>
                <v-select
                    v-model="dpiValue"
                    :items="dpiValues"
                    :label="i18n.dpi"
                    hide-details
                ></v-select>
            </v-flex>
            <v-flex
                v-if="visibleUiElements.widthAndHeight"
                md5>
                <v-text-field
                    v-model="widthValue"
                    :label="i18n.width"
                    step="1"
                    type="number"
                    suffix="px"
                    hide-details
                />
            </v-flex>
            <v-flex
                v-if="visibleUiElements.widthAndHeight"
                md5>
                <v-text-field
                    v-model="heightValue"
                    :label="i18n.height"
                    step="1"
                    type="number"
                    suffix="px"
                    hide-details
                />
            </v-flex>
            <v-flex
                v-if="visibleUiElements.widthAndHeight"
                md2>
                <v-btn
                    flat
                    icon
                    color="primary"
                    @click="rotate">
                    <v-icon>rotate_90_degrees_ccw</v-icon>
                </v-btn>
            </v-flex>
            <v-flex
                v-if="visibleUiElements.printPreviewCheckbox"
                md12>
                <v-checkbox
                    v-model="enablePrintPreviewValue"
                    :label="i18n.showPrintPreview"
                    color="primary"
                    hide-details
                    class="pa-0 ma-0"
                ></v-checkbox>
            </v-flex>
            <v-flex
                v-if="visibleUiElements.scaleEnabled"
                md12>
                <v-checkbox
                    v-model="scaleEnabledValue"
                    :label="i18n.scaleEnabled"
                    color="primary"
                    hide-details
                    class="pa-0 ma-0"
                ></v-checkbox>
            </v-flex>
            <v-flex
                v-if="scaleValues.length && visibleUiElements.scale"
                md12>
                <v-select
                    v-model="scaleValue"
                    :items="scaleValues"
                    :label="i18n.scale"
                    :disabled="!scaleEnabled"
                    hide-details
                ></v-select>
            </v-flex>
            <v-flex
                v-if="!scaleValues.length && visibleUiElements.scale"
                md10>
                <v-text-field
                    v-model="scaleValue"
                    :label="i18n.scale"
                    :disabled="!scaleEnabled"
                    step="1"
                    type="number"
                    hide-details
                />
            </v-flex>
            <v-flex
                v-if="!scaleValues.length && visibleUiElements.scale"
                md2>
                <v-btn
                    flat
                    icon
                    color="primary"
                    :disabled="!scaleEnabled"
                    @click="$emit('resetScale')">
                    <v-icon>replay</v-icon>
                </v-btn>
            </v-flex>
            <v-flex
                v-if="visibleUiElements.attributionEnabled"
                md12>
                <v-checkbox
                    v-model="attributionEnabledValue"
                    :label="i18n.attributionEnabled"
                    color="primary"
                    hide-details
                    class="pa-0 ma-0"
                ></v-checkbox>
            </v-flex>
        </v-layout>
    </v-container>
</template>
<script>
    import Bindable from "apprt-vue/mixins/Bindable";

    export default {
        components: {},
        mixins: [Bindable],
        props: {
            i18n: {
                type: Object,
                default: function () {
                    return {}
                }
            },
            attributionEnabled: {
                type: Boolean,
                default: true
            },
            dpi: {
                type: Number,
                default: 96
            },
            dpiValues: {
                type: Array,
                default: () => []
            },
            scaleValues: {
                type: Array,
                default: () => []
            },
            fileName: {
                type: String,
                default: ""
            },
            format: {
                type: String,
                default: "pdf"
            },
            width: {
                type: Number,
                default: 800
            },
            height: {
                type: Number,
                default: 1100
            },
            scale: {
                type: Number,
                default: 0
            },
            scaleEnabled: {
                type: Boolean,
                default: false
            },
            formatList: {
                type: Array,
                default: () => []
            },
            enablePrintPreview: {
                type: Boolean,
                default: true
            },
            visibleUiElements: {
                type: Object,
                default: () => {}
            }
        },
        data() {
            return {
                advancedOptions: [0]
            }
        },
        computed: {
            attributionEnabledValue: {
                get: function () {
                    return this.attributionEnabled;
                },
                set: function (attributionEnabled) {
                    this.$emit('update:attribution-enabled', attributionEnabled);
                }
            },
            dpiValue: {
                get: function () {
                    return this.dpi;
                },
                set: function (dpi) {
                    this.$emit('update:dpi', dpi);
                }
            },
            formatValue: {
                get: function () {
                    return this.format;
                },
                set: function (format) {
                    this.$emit('update:format', format);
                }
            },
            widthValue: {
                get: function () {
                    return this.width;
                },
                set: function (width) {
                    this.$emit('update:width', width);
                }
            },
            heightValue: {
                get: function () {
                    return this.height;
                },
                set: function (height) {
                    this.$emit('update:height', height);
                }
            },
            scaleValue: {
                get: function () {
                    return this.scale;
                },
                set: function (scale) {
                    this.$emit('update:scale', scale);
                }
            },
            scaleEnabledValue: {
                get: function () {
                    return this.scaleEnabled;
                },
                set: function (scaleEnabled) {
                    this.$emit('update:scale-enabled', scaleEnabled);
                }
            },
            enablePrintPreviewValue: {
                get: function () {
                    return this.enablePrintPreview;
                },
                set: function (enablePrintPreview) {
                    this.$emit('update:enable-print-preview', enablePrintPreview);
                }
            },
            fileNameValue: {
                get: function () {
                    return this.fileName;
                },
                set: function (fileName) {
                    this.$emit('update:file-name', fileName);
                }
            }
        },
        methods: {
            rotate: function () {
                this.$emit('rotate');
            }
        }
    };
</script>
