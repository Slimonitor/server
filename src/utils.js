module.exports = {
    /**
     * Filters Object keys
     * @param sourceObject object
     * @param limiter array|object
     * @returns object
     */
    filterObjectKeys: (sourceObject, limiter) => {
        const srcKeys = Object.keys(sourceObject);
        const limitKeys = Array.isArray(limiter) ? limiter : Object.keys(limiter);
        const intersection = srcKeys.filter(key => limitKeys.indexOf(key) !== -1);
        return Object.assign({}, ...intersection.map(key => {
            return {
                [key]: sourceObject[key]
            };
        }));
    }
};
