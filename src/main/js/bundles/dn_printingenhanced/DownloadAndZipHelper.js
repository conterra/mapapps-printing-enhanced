import * as Promise from "bluebird";
import jszip from "jszip";

export default function () {
    return {

        /**
         * @param infos: Object with .url and .fileName property
         * @param files_per_group
         */
        async downloadAsBlobs(infos, files_per_group = 2, vm) {
            return Promise.map(
                infos,
                async info => {
                    return {
                        blob: await fetch(info.url)
                            .then(resp => resp.blob())
                            .catch(err => {
                                    console.error("Fehler bei der Funktion downloadAsBlobs: " + err);
                                }
                            ),
                        fileName: info.fileName
                    }
                },
                {concurrency: files_per_group}
            );
        },

        /**
         * @param blobsWrappers: Array with Wrappers having Properties "blob" and "fileName"
         * @param zipFileName
         */
        async saveBlobsAsZip(blobsWrappers, zipFileName, vm) {
            const that = this;
            let zip = new jszip();

            blobsWrappers.forEach((blobWrapper) => {
                zip.file(blobWrapper.fileName, blobWrapper.blob);
            });
            return zip.generateAsync({type: 'blob'})
                .then(zipFile => {
                    that._fileSaver.saveFromBlob(zipFile, `${zipFileName}.zip`);
                    zip = undefined;
                }).catch(err => {
                        console.error("Fehler bei der Funktion saveBlobsAsZip: " + err);
                    }
                );
        }
    }
}
