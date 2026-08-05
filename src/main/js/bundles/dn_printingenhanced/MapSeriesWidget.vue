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
            <v-flex class="mapSeriesToolRow">
                <v-btn-toggle class="mapSeriesBtnToggle" v-model="selectGeometryActive">
                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-btn class="mapSeriesToolBtn" small v-on="on">
                                <v-icon class="pr-1">icon-selection-freehand-polygon</v-icon>
                                {{i18n.label_selectGeometry1}} <br> {{i18n.label_selectGeometry2}}
                            </v-btn>
                        </template>
                        <span> {{ i18n.selectGeometryToolToolTip }} </span>
                    </v-tooltip>
                </v-btn-toggle>
                <!-- use two different toggle groups to avoid optical highlight -->
                <v-btn-toggle class="mapSeriesBtnToggle" v-model="selectRectangleActive">
                    <v-tooltip top>
                        <template v-slot:activator="{ on }">
                            <v-btn class="mapSeriesToolBtn" small v-on="on">
                                <v-icon class="pr-1">icon-selection-extent</v-icon>
                                {{ i18n.label_drawRectangle1 }} <br> {{ i18n.label_drawRectangle2 }}
                            </v-btn>
                        </template>
                        <span> {{ i18n.drawRectangleToolToolTip }} </span>
                    </v-tooltip>
                </v-btn-toggle>
                <v-tooltip top>
                    <template v-slot:activator="{ on }">
                        <v-btn class="mapSeriesToolBtn" value="extent" small @click="useMapViewExtent" v-on="on">
                            <v-icon class="pr-1">icon-extent</v-icon>
                            {{i18n.label_currentExtent1}} <br> {{i18n.label_currentExtent2}}
                        </v-btn>
                    </template>
                    <span> {{ i18n.extentToolToolTip }} </span>
                </v-tooltip>
            </v-flex>
            <v-flex
                v-if="visibleUiElements.title"
                md12>
                <v-text-field
                    v-model="titleValue"
                    :label="i18n.title"
                    :placeholder="i18n.titlePlaceholder"
                    hide-details
                ></v-text-field>
            </v-flex>
            <v-flex
                v-if="visibleUiElements.author"
                md12>
                <v-text-field
                    v-model="authorValue"
                    :label="i18n.author"
                    :placeholder="i18n.authorPlaceholder"
                    hide-details
                ></v-text-field>
            </v-flex>
            <v-flex
                v-if="visibleUiElements.format"
                md6
                :class="{ md12: !visibleUiElements.dpi }">
                <v-select
                    v-model="formatValue"
                    :items="formatList"
                    :label="i18n.format"
                    hide-details
                ></v-select>
            </v-flex>
            <v-flex
                v-if="visibleUiElements.dpi"
                md6
                :class="{ md12: !visibleUiElements.format }">
                <v-select
                    v-model="dpiValue"
                    :items="dpiValues"
                    :label="i18n.dpi"
                    hide-details
                ></v-select>
            </v-flex>
            <v-flex
                    md12>
                <v-radio-group class="printSizeRadionGroup" v-model="pagePrintSizeValue" row hide-details>
                    <v-radio v-for="printSize in pagePrintSizeValues" :key="printSize.value" :name="printSize.value"
                             :label="printSize.text" :value="printSize.value"
                             class="primary--text"
                    />
                </v-radio-group>
            </v-flex>
            <v-flex
                    md12>
                <v-radio-group class="printOrientationRadionGroup" v-model="pagePrintOrientationValue" row hide-details>
                    <v-radio v-for="printOrientation in pagePrintOrientationValues" :key="printOrientation.value"
                             :name="printOrientation.value" :label="printOrientation.text" :value="printOrientation.value"/>
                </v-radio-group>
            </v-flex>
            <v-flex
                v-if="visibleUiElements.legendEnabled"
                md12>
                <v-checkbox
                    v-model="legendEnabledValue"
                    :label="i18n.legendEnabled"
                    color="primary"
                    hide-details
                    class="pa-0 ma-0"
                ></v-checkbox>
            </v-flex>
            <v-flex
                v-if="visibleUiElements.doNotPrintEmptyTiles"
                md12>
                <v-checkbox
                    v-model="doNotPrintEmptyTilesValue"
                    :label="i18n.doNotPrintEmptyTilesLabel"
                    color="primary"
                    hide-details
                    :disabled="mapSeriesExtentType!=='object-geometry'"
                    class="pa-0 ma-0"
                ></v-checkbox>
            </v-flex>
            <v-flex
                v-if="visibleUiElements.layout"
                md12>
                <v-select
                    v-model="layoutValue"
                    :items="layoutList"
                    :label="i18n.layout"
                    hide-details
                ></v-select>
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
                    v-model.number="scaleValue"
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
                    v-model.number="scaleValue"
                    :label="i18n.scale"
                    :disabled="!scaleEnabled"
                    :error="!scaleValueIsValidForPreview"
                    step="1"
                    type="number"
                    hide-details>
                  <template v-slot:append>
                    <v-tooltip
                        v-if="!scaleValueIsValidForPreview"
                        top
                    >
                      <template v-slot:activator="{ on }">
                        <v-icon color="error" v-on="on">error</v-icon>
                      </template>
                      {{ i18n.errors.mapSeriesScaleToLow + minScaleForSeries}}
                    </v-tooltip>
                  </template>
                </v-text-field>
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
                v-if="visibleUiElements.copyright"
                md12>
                <v-text-field
                    v-model="copyrightValue"
                    :label="i18n.copyright"
                    :placeholder="i18n.copyrightPlaceholder"
                    hide-details
                ></v-text-field>
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
            pagePrintSize: {
                type: String,
                default: "a4"
            },
            pagePrintSizeValues: {
                type: Array,
                default: () => []
            },
            pagePrintOrientation: {
                type: String,
                default: "portrait"
            },
            pagePrintOrientationValues: {
                type: Array,
                default: () => []
            },
            mapOnlyLayoutName: {
                type: String,
                default: () => ""
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
            minScaleForSeries: {
              type: Number,
              default: 1000
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
                default: () => {}
            },
            mapSeriesExtentType: {
                type: String,
                default: undefined
            },
            doNotPrintEmptyTiles: false,
            mapSeriesJobs: {
              type: Array,
              default: () => []
            }
        },
        data() {
            return {
                advancedOptions: [0],
                selectRectangleActive: undefined,
                selectGeometryActive: undefined
            }
        },
        methods: {
            useGeometrySelection() {
                this.$emit('use-geometry-selection');
            },
            cancelGeometrySelection() {
                this.$emit('cancel-geometry-selection');
            },
            useRectangleDraw() {
              this.$emit('use-rectangle-draw');
            },
            cancelRectangleDraw() {
              this.$emit('cancel-rectangle-draw');
            },
            useMapViewExtent() {
              this.$emit('cancel-geometry-selection');
              this.$emit('cancel-rectangle-draw');
              this.$emit('use-map-view-extent');
            },
            deactivateAllTools() {
              this.selectRectangleActive = undefined;
              this.selectGeometryActive = undefined;
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
            pagePrintSizeValue: {
                get: function () {
                    return this.pagePrintSize;
                },
                set: function (pagePrintSizeValue) {
                    this.$emit('update:page-print-size', pagePrintSizeValue);
                }
            },
            pagePrintOrientationValue: {
                get: function () {
                    return this.pagePrintOrientation;
                },
                set: function (pagePrintOrientationValue) {
                    this.$emit('update:page-print-orientation', pagePrintOrientationValue);
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
            titleValue: {
                get: function () {
                    return this.title;
                },
                set: function (title) {
                    this.$emit('update:title', title);
                }
            },
            doNotPrintEmptyTilesValue: {
                get: function () {
                    return this.doNotPrintEmptyTiles
                },
                set: function (value) {
                    this.$emit('update:doNotPrintEmptyTiles', value);
                }
            },
            scaleValueIsValidForPreview: function() {
              const isValid = this.scaleValue && (this.scaleValue >= this.minScaleForSeries);
              this.$emit('set-scale-value-is-valid', isValid);
              return isValid;
            }
        },
        watch: {
            selectGeometryActive: function (isActive) {
                if(isActive === undefined){
                    this.cancelGeometrySelection()
                } else {
                    if(this.selectRectangleActive !== undefined)
                        this.selectRectangleActive = undefined;
                    this.useGeometrySelection();
                }
            },
            selectRectangleActive: function (isActive) {
                if(isActive === undefined){
                    this.cancelRectangleDraw()
                } else {
                    if(this.selectGeometryActive !== undefined)
                        this.selectGeometryActive = undefined;
                    this.useRectangleDraw();
                }
            }
        }
    };
</script>
