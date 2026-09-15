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
        <!-- Map Series Jobs -->
        <v-list
            v-if="reverseMapSeriesJobs.length"
            dense
        >
            <v-subheader>
                {{ i18n.mapSeriesSubHeader }}
            </v-subheader>
            <v-list-tile
                v-for="(mapSeriesJob, index) in reverseMapSeriesJobs"
                :key="mapSeriesJob.mapSeriesTitle + mapSeriesJob.fileFormat + index"
                @click="saveJobAgain(mapSeriesJob)"
            >
                <v-list-tile-action>
                    <v-progress-circular
                        v-if="!isMapSeriesJobFinished(mapSeriesJob)"
                        rotate="-90"
                        size="32"
                        :value="getPercentageCompleted(mapSeriesJob)"
                        color="primary"
                    >
                        {{ getPercentageCompleted(mapSeriesJob) }}
                    </v-progress-circular>
                    <v-progress-circular
                        v-else-if="
                            isMapSeriesJobFinished(mapSeriesJob) &&
                            !isMapSeriesJobDownloaded(mapSeriesJob)
                        "
                        size="22"
                        indeterminate
                        color="primary"
                    />
                    <v-icon v-else> cloud_download </v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
                    <v-list-tile-title v-text="mapSeriesJob.mapSeriesTitle" />
                </v-list-tile-content>
            </v-list-tile>
            <v-divider v-if="reverseExportedLinks.length > 0" />
        </v-list>
        <!-- Single Print Results -->
        <v-list
            v-if="reverseExportedLinks.length"
            dense
        >
            <v-subheader v-if="reverseMapSeriesJobs.length">
                {{ i18n.singlePrintSubHeader }}
            </v-subheader>
            <v-list-tile
                v-for="exportedLink in reverseExportedLinks"
                :key="exportedLink.id"
                :href="exportedLink.url"
                target="_blank"
            >
                <v-list-tile-action>
                    <v-progress-circular
                        v-if="exportedLink.loading"
                        indeterminate
                        size="22"
                        color="primary"
                        role="alert"
                        aria-busy="true"
                        :aria-label="i18n.printResultLoading"
                    />
                    <v-icon
                        v-else-if="exportedLink.error"
                        color="red"
                        role="alert"
                        :aria-label="i18n.printError"
                    >
                        error
                    </v-icon>
                    <v-icon
                        v-else
                        role="alert"
                        :aria-label="`${exportedLink.name} ${i18n.printResultAvailable}`"
                    >
                        cloud_download
                    </v-icon>
                </v-list-tile-action>
                <v-list-tile-content>
                    <!-- eslint-disable-next-line vue/no-v-text-v-html-on-component -->
                    <v-list-tile-title v-text="exportedLink.name" />
                </v-list-tile-content>
            </v-list-tile>
        </v-list>
        <v-alert
            v-if="!reverseExportedLinks.length && !reverseMapSeriesJobs.length"
            :value="true"
            type="warning"
            outline
            class="ma-0"
        >
            {{ i18n.noPrintResults }}
        </v-alert>
    </v-container>
</template>
<script>
    export default {
        props: {
            i18n: {
                type: Object,
                default: function () {
                    return {};
                }
            },
            exportedLinks: {
                type: Array,
                default: () => []
            },
            mapSeriesJobs: {
                type: Array,
                default: () => []
            }
        },
        methods: {
            isMapSeriesJobFinished(mapSeriesJob) {
                return (
                    mapSeriesJob.completedSinglePrintJobCount ===
                    mapSeriesJob.totalSinglePrintJobCount
                );
            },
            isMapSeriesJobDownloaded(mapSeriesJob) {
                return mapSeriesJob.downloadFinished;
            },
            getPercentageCompleted(mapSeriesJob) {
                return Math.floor(
                    (mapSeriesJob.completedSinglePrintJobCount * 100) /
                        mapSeriesJob.totalSinglePrintJobCount
                );
            },
            saveJobAgain(mapSeriesJob) {
                if (this.isMapSeriesJobDownloaded(mapSeriesJob)) {
                    this.$emit("save-job-again", mapSeriesJob);
                }
            }
        },
        computed: {
            reverseExportedLinks() {
                return this.exportedLinks.slice().reverse();
            },
            reverseMapSeriesJobs() {
                return this.mapSeriesJobs.slice().reverse();
            }
        }
    };
</script>
