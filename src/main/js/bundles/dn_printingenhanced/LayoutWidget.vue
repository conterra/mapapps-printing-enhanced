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
    <v-container
        grid-list-md
        fluid
        class="pa-2"
    >
        <v-layout
            row
            wrap
        >
            <v-flex
                v-if="titleVisible"
                md12
            >
                <v-text-field
                    v-model="titleValue"
                    :label="i18n.title"
                    :placeholder="i18n.titlePlaceholder"
                    hide-details
                />
            </v-flex>
            <v-flex
                v-if="authorVisible"
                md12
            >
                <v-text-field
                    v-model="authorValue"
                    :label="i18n.author"
                    :placeholder="i18n.authorPlaceholder"
                    hide-details
                />
            </v-flex>
            <v-flex
                v-if="formatVisible"
                md6
                :class="{ md12: !dpiVisible }"
            >
                <v-select
                    v-model="formatValue"
                    :items="formatList"
                    :label="i18n.format"
                    hide-details
                />
            </v-flex>
            <v-flex
                v-if="dpiVisible"
                md6
                :class="{ md12: !formatVisible }"
            >
                <v-select
                    v-model="dpiValue"
                    :items="dpiValues"
                    :label="i18n.dpi"
                    hide-details
                />
            </v-flex>
            <v-flex
                v-if="layoutVisible"
                md12
            >
                <v-select
                    v-model="layoutValue"
                    :items="layoutList"
                    :label="i18n.layout"
                    hide-details
                />
            </v-flex>
            <v-flex
                v-if="printPreviewCheckboxVisible"
                md12
            >
                <div class="pa-0 ma-0 infoContainer">
                    <v-checkbox
                        v-model="enablePrintPreviewValue"
                        :label="i18n.showPrintPreview"
                        :disabled="!scaleEnabled"
                        color="primary"
                        hide-details
                        class="pa-0 ma-0"
                    />
                    <v-btn
                        v-if="!scaleEnabled"
                        icon
                        small
                        top
                        class="infoButton"
                        @click="showInfo=!showInfo"
                    >
                        <v-icon color="primary">
                            info
                        </v-icon>
                    </v-btn>
                </div>
                <div
                    v-if="showInfo && !scaleEnabled"
                    aria-live="polite"
                    class="ct-message ct-message--info mt-2"
                >
                    {{ i18n.helperTextScaleEnabled }}
                </div>
            </v-flex>
            <v-flex
                v-if="scaleEnabledVisible"
                md12
            >
                <div
                    v-if="!scaleEnabled && !printPreviewCheckboxVisible"
                    aria-live="polite"
                    class="ct-message ct-message--info mt-2"
                >
                    {{ i18n.helperTextScaleEnabled }}
                </div>
                <v-checkbox
                    v-model="scaleEnabledValue"
                    :label="i18n.scaleEnabled"
                    color="primary"
                    hide-details
                    class="pa-0 ma-0"
                />
            </v-flex>
            <v-flex
                v-if="scaleValues.length && scaleVisible"
                md12
            >
                <v-select
                    v-model.number="selectedScaleValue"
                    :items="scaleValuesIncludingCurrentScale"
                    :label="i18n.scale"
                    :disabled="!scaleEnabled"
                    hide-details
                />
            </v-flex>
            <v-flex
                v-if="!scaleValues.length && scaleVisible"
                md10
            >
                <v-text-field
                    v-model.number="scaleValue"
                    :label="i18n.scale"
                    :disabled="!scaleEnabled"
                    step="1"
                    type="number"
                    hide-details
                />
            </v-flex>
            <v-flex
                v-if="!scaleValues.length && scaleVisible"
                md2
            >
                <v-btn
                    flat
                    icon
                    color="primary"
                    :disabled="!scaleEnabled"
                    @click="$emit('resetScale')"
                >
                    <v-icon>replay</v-icon>
                </v-btn>
            </v-flex>
            <v-flex
                v-if="copyrightVisible"
                md12
            >
                <v-text-field
                    v-model="copyrightValue"
                    :label="i18n.copyright"
                    :placeholder="i18n.copyrightPlaceholder"
                    hide-details
                />
            </v-flex>
            <v-flex
                v-if="legendEnabledVisible"
                md12
            >
                <v-checkbox
                    v-model="legendEnabledValue"
                    :label="i18n.legendEnabled"
                    color="primary"
                    hide-details
                    class="pa-0 ma-0"
                />
            </v-flex>
            <v-flex
                md12
            >
                <custom-parameters-form
                    :i18n="i18n.customParametersForm"
                    :layout-template-name="layout"
                    @change="$emit('customTextElementsChanged', $event)"
                />
            </v-flex>
        </v-layout>
    </v-container>
</template>
<script>
    import Bindable from "apprt-vue/mixins/Bindable";
    import CustomParametersForm from "./CustomParametersForm.vue";

    export default {
        components: {CustomParametersForm},
        mixins: [Bindable],
        props: {
            i18n: {
                type: Object,
                default: function () {
                    return {};
                }
            },
            author: {
                type: String,
                default: ""
            },
            copyright: {
                type: String,
                default: ""
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
            format: {
                type: String,
                default: "pdf"
            },
            layout: {
                type: String,
                default: "a3-portrait"
            },
            legendEnabled: {
                type: Boolean,
                default: true
            },
            scale: {
                type: Number,
                default: 0
            },
            scaleEnabled: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ""
            },
            formatList: {
                type: Array,
                default: () => []
            },
            layoutList: {
                type: Array,
                default: () => []
            },
            enablePrintPreview: {
                type: Boolean,
                default: true
            },
            visibleUiElements: {
                type: Object,
                default: () => {
                }
            },
            currentMapScale: {
                type: Number,
                default: 0
            }
        },
        data() {
            return {
                advancedOptions: [0],
                showInfo: false,
                selectedScaleValue: 0
            };
        },
        computed: {
            authorValue: {
                get: function () {
                    return this.author;
                },
                set: function (author) {
                    this.$emit('update:author', author);
                }
            },
            copyrightValue: {
                get: function () {
                    return this.copyright;
                },
                set: function (copyright) {
                    this.$emit('update:copyright', copyright);
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
            layoutValue: {
                get: function () {
                    return this.layout;
                },
                set: function (layout) {
                    this.$emit('update:layout', layout);
                }
            },
            legendEnabledValue: {
                get: function () {
                    return this.legendEnabled;
                },
                set: function (legendEnabled) {
                    this.$emit('update:legend-enabled', legendEnabled);
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
            scaleValuesIncludingCurrentScale: {
                get() {
                    const predefinedScaleValues = this.scaleValues || [];
                    return predefinedScaleValues.map(entry => {
                        if (entry.value === -1) {
                            const localizedScale = new Intl.NumberFormat().format(this.currentMapScale);
                            return Object.assign({}, {
                                text: `${entry.text} (1:${localizedScale})`,
                                value: -1
                            });
                        } else {
                            return Object.assign({}, entry);
                        }
                    });

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
            titleValue: {
                get: function () {
                    return this.title;
                },
                set: function (title) {
                    this.$emit('update:title', title);
                }
            },
            titleVisible() {
                return this.visibleUiElements && this.visibleUiElements.title;
            },
            authorVisible() {
                return this.visibleUiElements && this.visibleUiElements.author;
            },
            formatVisible() {
                return this.visibleUiElements && this.visibleUiElements.format;
            },
            dpiVisible() {
                return this.visibleUiElements && this.visibleUiElements.dpi;
            },
            layoutVisible() {
                return this.visibleUiElements && this.visibleUiElements.layout;
            },
            printPreviewCheckboxVisible() {
                return this.visibleUiElements && this.visibleUiElements.printPreviewCheckbox;
            },
            scaleEnabledVisible() {
                return this.visibleUiElements && this.visibleUiElements.scaleEnabled;
            },
            copyrightVisible() {
                return this.visibleUiElements && this.visibleUiElements.copyright;
            },
            legendEnabledVisible() {
                return this.visibleUiElements && this.visibleUiElements.legendEnabled;
            },
            scaleVisible() {
                return this.visibleUiElements && this.visibleUiElements.scale;
            }
        },
        watch: {
            currentMapScale(currentMapScale) {
                if (this.selectedScaleValue === -1) {
                    this.scaleValue = currentMapScale;
                }
            },
            selectedScaleValue() {
                if (this.selectedScaleValue === -1) {
                    this.scaleValue = this.currentMapScale;
                } else {
                    this.scaleValue = this.selectedScaleValue;
                }
            }
        }
    };
</script>
