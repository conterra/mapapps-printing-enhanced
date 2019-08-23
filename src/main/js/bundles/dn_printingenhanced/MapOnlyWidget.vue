<!--

    Copyright (C) 2019 con terra GmbH (info@conterra.de)

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
                    :label="i18n.file"
                    :placeholder="i18n.filePlaceholder"
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
                md2>
                <v-btn
                    flat
                    icon
                    color="primary"
                    @click="rotate">
                    <v-icon>rotate_90_degrees_ccw</v-icon>
                </v-btn>
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
                                v-model="attributionEnabledValue"
                                :label="i18n.attributionEnabled"
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
            title: {
                type: String,
                default: ""
            },
            formatList: {
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
                advancedOptions: false,
                attributionEnabledValue: this.attributionEnabledValue,
                dpiValue: this.dpi,
                formatValue: this.format,
                widthValue: this.width,
                heightValue: this.height,
                scaleValue: this.scale,
                scaleEnabledValue: this.scaleEnabled,
                titleValue: this.title,
                showPrintPreviewValue: this.scaleEnabled
            }
        },
        watch: {
            attributionEnabledValue: function (attributionEnabled) {
                this.$emit('update:attribution-enabled', attributionEnabled);
            },
            dpiValue: function (dpi) {
                this.$emit('update:dpi', dpi);
            },
            formatValue: function (format) {
                this.$emit('update:format', format);
            },
            widthValue: function (width) {
                this.$emit('update:width', parseInt(width));
            },
            heightValue: function (height) {
                this.$emit('update:height', parseInt(height));
            },
            scaleValue: function (scale) {
                this.$emit('update:scale', scale);
            },
            scaleEnabledValue: function (scaleEnabled) {
                this.$emit('update:scale-enabled', scaleEnabled);
            },
            titleValue: function (title) {
                this.$emit('update:title', title);
            },
            showPrintPreviewValue: function (showPrintPreview) {
                this.$emit('update:show-print-preview', showPrintPreview);
            }
        },
        computed: {},
        methods: {
            rotate: function () {
                this.$emit('rotate');
            }
        }
    };
</script>
