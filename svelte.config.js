import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// Naming the runtime explicitly rather than letting the adapter infer it
		// from the build machine's Node version. This must stay in step with the
		// Node.js Version in the Vercel project settings (and "engines" in
		// package.json); Vercel refuses to build once a version is discontinued.
		adapter: adapter({ runtime: 'nodejs24.x' })
	}
};

export default config;
