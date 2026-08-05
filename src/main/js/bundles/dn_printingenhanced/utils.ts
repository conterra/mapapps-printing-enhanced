
export function createFormData(jsonData: Record<string, any>) {
    const formData = new FormData();
    for (const key in jsonData) {
        if (jsonData.hasOwnProperty(key)) {
            formData.append(key, jsonData[key]);
        }
    }
    return formData;
}
