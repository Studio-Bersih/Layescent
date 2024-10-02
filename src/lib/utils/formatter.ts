function currencySanitizer(input: string): number {
    const sanitizedAmount = Number(input.toString().replace(/\D/g, ''));
    return sanitizedAmount;
}

const rupiahFormatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
});
export { currencySanitizer, rupiahFormatter };