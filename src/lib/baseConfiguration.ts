const isProduction: boolean = false;

export const baseConfiguration = {
    url : isProduction ? 'https://fae.deabakery.co.id/api/' : 'http://localhost:8000/api/POS/',
    rawURL : isProduction ? 'https://fae.deabakery.co.id/' : 'http://localhost:8000/',
}