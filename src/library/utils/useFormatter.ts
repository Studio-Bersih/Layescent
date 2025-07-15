const rupiahFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    // maximumSignificantDigits: 5,
    minimumFractionDigits: 0
});

function currencySanitizer(input: string | null): number {
    if (!input) return 0;
    const sanitizedAmount = Number(input.toString().replace(/\D/g, ''));
    return sanitizedAmount;
}


function roundToNearest(value: number): number {
    return Math.round(value);
}

function removeNonString(input: string): string {
    const filteredString = input.toString().replace(/[^a-z0-9]/gi, '');
    return filteredString;
}

function capitalizeEachWord(str?: string): string {
    if (!str) return '-';
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function appendZero(input: string | number): string {
    const strInput = input.toString();

    if (strInput.charAt(0) === '0') {
        return strInput;
    }

    return '0' + strInput;
}

function noteDecoder(encodedText: string | null | undefined): string {
    if (!encodedText || encodedText.trim() === "") {
        return "-";
    }

    const byteArray = new Uint8Array(encodedText.split('').map(char => char.charCodeAt(0)));

    const decoder = new TextDecoder('utf-8');
    let decodedText = decoder.decode(byteArray);

    decodedText = decodedText
    .replace(/Â/g, '')
    .replace(/â€‘/g, '-')
    .replace(/�/g, '')
    .replace(/[\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ');

    return decodedText.trim();
}

export { rupiahFormatter, currencySanitizer, roundToNearest, removeNonString, capitalizeEachWord, appendZero, noteDecoder };