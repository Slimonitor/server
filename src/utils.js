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
    },

    /**
     * @returns integer[]
     */
    generateRandomColor: function() {
        return [1,2,3].map(() => {
            return Math.floor(Math.random() * (200 - 50 + 1)) + 50;
        });
    },

    fillGapsInArray: function(data) {
        let gaps = [];
        const openGap = index => gaps.push({
            begin: index,
            end: null
        });
        const isGapOpened = () => gaps.length === 0 ? false : gaps[gaps.length - 1].end === null;
        const closeGap = index => gaps[gaps.length - 1].end = index;
        data.forEach((value, index) => {
            if (value === null) {
                if (!isGapOpened()) {
                    openGap(index); // of null
                }
            } else {
                if (isGapOpened()) {
                    closeGap(index); // of value
                }
            }
        });
        gaps.forEach(gap => {
            if ((gap.begin !== 0) && (gap.end !== null)) {
                data = data.fill(data[gap.begin - 1], gap.begin, gap.end); // end index of value is not included
            }
        });
        return data;
    }
};
