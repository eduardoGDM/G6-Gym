<?php

return [

	/*
	|--------------------------------------------------------------------------
	| Uploads de mídia da anamnese
	|--------------------------------------------------------------------------
	|
	| Controla o envio de fotos e vídeos da anamnese. Desligado em produção por
	| padrão porque ainda não há storage persistente configurado lá: o arquivo
	| subiria, apareceria na tela e sumiria no próximo deploy — o que é pior do
	| que não permitir, porque o personal só descobriria a perda depois.
	|
	| Em desenvolvimento (e nos testes) fica ligado, gravando no disco `public`.
	|
	| Para liberar em produção assim que houver S3/R2, basta definir
	| ANAMNESIS_UPLOADS_ENABLED=true no ambiente — não precisa alterar código.
	|
	*/

	'anamnesis_media' => (bool) env(
		'ANAMNESIS_UPLOADS_ENABLED',
		env('APP_ENV') !== 'production',
	),

];
