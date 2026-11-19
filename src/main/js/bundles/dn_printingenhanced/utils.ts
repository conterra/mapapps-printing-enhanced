///
/// Copyright (C) 2025 con terra GmbH (info@conterra.de)
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///         http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///


export function createFormData(jsonData: Record<string, any>) {
    const formData = new FormData();
    for (const key in jsonData) {
        if (Object.prototype.hasOwnProperty.call(jsonData, key)) {
            formData.append(key, jsonData[key]);
        }
    }
    return formData;
}

/**
 * Resolves after the given number of milliseconds.
 */
export function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Maps the items with an async mapper, running at most `concurrency` mappers at the same time.
 * A new item is started as soon as a running one finishes (not in fixed batches).
 * The results keep the order of the input items. Rejects with the first error that occurs;
 * after that, no further items are started.
 */
export async function mapWithConcurrency<T, R>(
    items: Iterable<T>,
    mapper: (item: T, index: number) => Promise<R> | R,
    concurrency = Infinity
): Promise<R[]> {
    const input = Array.from(items);
    const results: R[] = new Array(input.length);
    const workerCount = Math.max(1, Math.min(concurrency || 1, input.length));
    let nextIndex = 0;
    let failed = false;

    async function worker(): Promise<void> {
        while (!failed && nextIndex < input.length) {
            const index = nextIndex++;
            try {
                results[index] = await mapper(input[index], index);
            } catch (e) {
                failed = true;
                throw e;
            }
        }
    }

    if (input.length === 0) {
        return results;
    }
    await Promise.all(Array.from({length: workerCount}, () => worker()));
    return results;
}
