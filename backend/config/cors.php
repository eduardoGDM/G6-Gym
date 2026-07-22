<?php

return [

	/*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

	'paths' => ['api/*', 'sanctum/csrf-cookie'],

	'allowed_methods' => ['*'],

	/*
	 * Origens permitidas vêm do ambiente — NUNCA hardcode.
	 *
	 * Use CORS_ALLOWED_ORIGINS para uma lista separada por vírgula (ex.: domínio
	 * com e sem www). Se não definida, cai para FRONTEND_URL. O fallback local
	 * só vale em desenvolvimento.
	 *
	 * Como supports_credentials é true, o wildcard '*' é proibido pelo navegador:
	 * cada origem precisa ser explícita.
	 */
	'allowed_origins' => array_values(array_filter(array_map(
		'trim',
		explode(',', (string) env('CORS_ALLOWED_ORIGINS', env('FRONTEND_URL', 'http://localhost:5173')))
	))),

	'allowed_origins_patterns' => [],

	'allowed_headers' => ['*'],

	'exposed_headers' => [],

	'max_age' => 0,

	'supports_credentials' => true,

];
