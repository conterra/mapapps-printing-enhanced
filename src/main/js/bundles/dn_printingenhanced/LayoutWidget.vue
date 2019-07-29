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
                    v-model="title"
                    :label="i18n.title"
                    :placeholder="i18n.titlePlaceholder"
                    hide-details
                ></v-text-field>
            </v-flex>
            <v-flex
                md12>
                <v-select
                    v-model="format"
                    :items="formatList"
                    :label="i18n.format"
                    hide-details
                ></v-select>
            </v-flex>
            <v-flex
                md12>
                <v-select
                    v-model="layout"
                    :items="layoutList"
                    :label="i18n.layout"
                    hide-details
                ></v-select>
            </v-flex>
        </v-layout>
        <v-checkbox
            v-model="showPrintPreview"
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
                                v-model="scaleEnabled"
                                :label="i18n.scaleEnabled"
                                color="primary"
                                hide-details
                                class="pa-0 ma-0"
                            ></v-checkbox>
                        </v-flex>
                        <v-flex
                            md10>
                            <v-text-field
                                v-model="scale"
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
                            md12>
                            <v-text-field
                                v-model="author"
                                :label="i18n.author"
                                :placeholder="i18n.authorPlaceholder"
                                hide-details
                            ></v-text-field>
                        </v-flex>
                        <v-flex
                            md12>
                            <v-text-field
                                v-model="copyright"
                                :label="i18n.copyright"
                                :placeholder="i18n.copyrightPlaceholder"
                                hide-details
                            ></v-text-field>
                        </v-flex>
                        <v-flex
                            v-if="showDpiSelect"
                            md12>
                            <v-select
                                v-model="dpi"
                                :items="dpiValues"
                                :label="i18n.dpi"
                                hide-details
                            ></v-select>
                        </v-flex>
                        <v-flex
                            md12>
                            <v-checkbox
                                v-model="legendEnabled"
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
                advancedOptions: false
            }
        },
        watch: {
            author: function () {
                this.$emit('update:author', this.author);
            },
            copyright: function () {
                this.$emit('update:copyright', this.copyright);
            },
            dpi: function () {
                this.$emit('update:dpi', this.dpi);
            },
            format: function () {
                this.$emit('update:format', this.format);
            },
            layout: function () {
                this.$emit('update:layout', this.layout);
            },
            legendEnabled: function () {
                this.$emit('update:legend-enabled', this.legendEnabled);
            },
            scale: function () {
                this.$emit('update:scale', this.scale);
            },
            scaleEnabled: function () {
                this.$emit('update:scale-enabled', this.scaleEnabled);
            },
            title: function () {
                this.$emit('update:title', this.title);
            },
            showPrintPreview: function () {
                this.$emit('update:show-print-preview', this.showPrintPreview);
            }
        }
    };
</script>
