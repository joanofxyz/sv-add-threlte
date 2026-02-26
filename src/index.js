import { js, parse, svelte } from '@sveltejs/sv-utils';
import { defineAddon, defineAddonOptions } from 'sv';

const options = defineAddonOptions()
	.add('who', {
		question: 'To whom should the addon say hello?',
		type: 'string',
		default: ''
	})
	.build();

export default defineAddon({
	id: 'tmp',
	options,

	setup: ({ kit, unsupported }) => {
		if (!kit) unsupported('Requires SvelteKit');
	},

	run: ({ kit, sv, options, language, cancel }) => {
		if (!kit) return cancel('SvelteKit is required');

		sv.file(`src/lib/tmp/content.txt`, () => {
			return `This is a text file made by the Community Addon Template demo for the add-on: 'tmp'!`;
		});

		sv.file(`src/lib/tmp/HelloComponent.svelte`, (content) => {
			const { ast, generateCode } = parse.svelte(content);
			svelte.ensureScript(ast, { language });

			js.imports.addDefault(ast.instance.content, { as: 'content', from: './content.txt?raw' });

			svelte.addFragment(ast, '<p>{content}</p>');
			svelte.addFragment(ast, `<h2>Hello ${options.who}!</h2>`);

			return generateCode();
		});

		sv.file(kit.routesDirectory + '/+page.svelte', (content) => {
			const { ast, generateCode } = parse.svelte(content);
			svelte.ensureScript(ast, { language });

			js.imports.addDefault(ast.instance.content, {
				as: 'HelloComponent',
				from: `$lib/tmp/HelloComponent.svelte`
			});

			svelte.addFragment(ast, '<HelloComponent />');

			return generateCode();
		});
	}
});
