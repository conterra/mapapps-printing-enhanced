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
        class="pa-1">
        <v-layout
            row
            wrap>
            <v-flex
                md12>
                <v-text-field
                    v-model="titleValue"
                    :label="i18n.title"
                    :placeholder="i18n.titlePlaceholder"
                    hide-details
                ></v-text-field>
            </v-flex>
            <v-flex
                md12>
                <v-select
                    v-model="formatValue"
                    :items="formatList"
                    :label="i18n.format"
                    hide-details
                ></v-select>
            </v-flex>
            <v-flex
                md12>
                <v-select
                    v-model="layoutValue"
                    :items="layoutList"
                    :label="i18n.layout"
                    hide-details
                ></v-select>
            </v-flex>
        </v-layout>
        <v-checkbox
            v-model="showPrintPreviewValue"
            :label="i18n.showPrintPreview"
            color="primary"
            hide-details
            class="mb-2"
        ></v-checkbox>
        <v-expansion-panel
            v-if="showAdvancedOptions"
            v-model="advancedOptions">
            <v-expansion-panel-content>
                <template v-slot:header>
                    <div>{{ i18n.advancedOptions }}</div>
                </template>
                <v-card
                    class="pa-2">
                    <v-layout
                        row
                        wrap>
                        <v-flex
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
                            v-if="scaleValues.length"
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
                            v-if="!scaleValues.length"
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
                            v-if="!scaleValues.length"
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
                            md12>
                            <v-text-field
                                v-model="authorValue"
                                :label="i18n.author"
                                :placeholder="i18n.authorPlaceholder"
                                hide-details
                            ></v-text-field>
                        </v-flex>
                        <v-flex
                            md12>
                            <v-text-field
                                v-model="copyrightValue"
                                :label="i18n.copyright"
                                :placeholder="i18n.copyrightPlaceholder"
                                hide-details
                            ></v-text-field>
                        </v-flex>
                        <v-flex
                            v-if="showDpiSelect"
                            md12>
                            <v-select
                                v-model="dpiValue"
                                :items="dpiValues"
                                :label="i18n.dpi"
                                hide-details
                            ></v-select>
                        </v-flex>
                        <v-flex
                            md12>
                            <v-checkbox
                                v-model="legendEnabledValue"
                                :label="i18n.legendEnabled"
                                color="primary"
                                hide-details
                                class="pa-0 ma-0"
                            ></v-checkbox>
                        </v-flex>
                    </v-layout>
                </v-card>
            </v-expansion-panel-content>
        </v-expansion-panel>
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
            showPrintPreview: {
                type: Boolean,
                default: true
            },
            showAdvancedOptions: {
                type: Boolean,
                default: true
            },
            showDpiSelect: {
                type: Boolean,
                default: true
            }
        },
        data() {
            return {
                advancedOptions: [0]
            }
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
            scaleEnabledValue: {
                get: function () {
                    return this.scaleEnabled;
                },
                set: function (scaleEnabled) {
                    this.$emit('update:scale-enabled', scaleEnabled);
                }
            },
            showPrintPreviewValue: {
                get: function () {
                    return this.showPrintPreview;
                },
                set: function (showPrintPreview) {
                    this.$emit('update:show-print-preview', showPrintPreview);
                }
            },
            titleValue: {
                get: function () {
                    return this.title;
                },
                set: function (title) {
                    this.$emit('update:title', title);
                }
            }
        }
    };
</script>
