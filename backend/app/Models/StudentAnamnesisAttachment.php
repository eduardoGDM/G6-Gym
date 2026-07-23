<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class StudentAnamnesisAttachment extends Model
{
	use HasFactory;

	protected $table = 'student_anamnesis_attachments';

	protected $fillable = [
		'student_anamnesis_id',
		'type',
		'path',
		'original_name',
		'size',
	];

	protected $casts = [
		'size' => 'integer',
	];

	protected $appends = [
		'url',
	];

	/**
	 * Se o envio de novas mídias está habilitado neste ambiente.
	 *
	 * Fica aqui, e não espalhado pelos controllers, porque três pontos precisam
	 * da mesma resposta: os dois endpoints de upload e a leitura da anamnese,
	 * que informa a tela para ela avisar o personal antes de ele tentar enviar.
	 *
	 * Ver config/uploads.php.
	 */
	public static function uploadsEnabled(): bool
	{
		return (bool) config('uploads.anamnesis_media');
	}

	/** Mensagem única exibida quando o envio está desabilitado. */
	public static function uploadsDisabledMessage(): string
	{
		return 'O envio de fotos e vídeos ainda não está disponível nesta versão. '
			. 'Os demais dados da anamnese são salvos normalmente.';
	}

	public function studentAnamnesis(): BelongsTo
	{
		return $this->belongsTo(StudentAnamnesis::class);
	}

	public function getUrlAttribute(): string
	{
		return Storage::disk('public')->url($this->path);
	}
}
