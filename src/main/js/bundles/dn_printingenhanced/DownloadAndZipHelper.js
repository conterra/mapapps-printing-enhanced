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
                        blob: await this.fetchBlobWithRetry(info.url),
                        fileName: info.fileName
                    }
                },
                {concurrency: files_per_group}
            );
        },

        /**
         * The print service's result file can occasionally be momentarily unavailable at the
         * returned URL right after the print job completes. Retries with a short exponential
         * backoff to absorb that, without making the user wait long on a properly functioning
         * print service (a slow/unreliable service, e.g. a shared public demo endpoint, is not
         * something this can compensate for).
         */
        async fetchBlobWithRetry(url, retries = 3, delayMs = 400, maxDelayMs = 2000) {
            for (let attempt = 0; attempt <= retries; attempt++) {
                try {
                    const response = await fetch(url);
                    if (response.ok) {
                        return await response.blob();
                    }
                    if (attempt === retries) {
                        console.error(`Fehler bei der Funktion downloadAsBlobs: request for '${url}' failed with status ${response.status}`);
                        return undefined;
                    }
                } catch (err) {
                    if (attempt === retries) {
                        console.error("Fehler bei der Funktion downloadAsBlobs: " + err);
                        return undefined;
                    }
                }
                await Promise.delay(Math.min(delayMs * Math.pow(2, attempt), maxDelayMs));
            }
        },

        /**
         * @param blobsWrappers: Array with Wrappers having Properties "blob" and "fileName"
         * @param zipFileName
         */
        async saveBlobsAsZip(blobsWrappers, zipFileName, vm) {
            const that = this;
            let zip = new jszip();

            blobsWrappers.forEach((blobWrapper) => {
                if (!blobWrapper.blob) {
                    console.error(`Fehler bei der Funktion saveBlobsAsZip: '${blobWrapper.fileName}' konnte nicht heruntergeladen werden und wird ausgelassen.`);
                    return;
                }
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
