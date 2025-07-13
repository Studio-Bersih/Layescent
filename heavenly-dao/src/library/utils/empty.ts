function empty(value: any): boolean {
    if (
        value === undefined ||
        value === null ||
        value === false ||
        value === 0 ||
        value === '' ||
        Number.isNaN(value)
    ) {
        return true;
    }

    if (Array.isArray(value) && value.length === 0) {
        return true;
    }

    if (typeof value === 'object' && value !== null && Object.keys(value).length === 0) {
        return true;
    }

    return false;
}