export function generateQueryString(params: Record<string, any>) {
    let queryString = '';
    for (const key in params) {
        if (params.hasOwnProperty(key)) {
            const value = params[key];
            if (queryString !== '') {
                queryString += '&';
            }
            queryString += `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }
    }
    return queryString;
}