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

	public function studentAnamnesis(): BelongsTo
	{
		return $this->belongsTo(StudentAnamnesis::class);
	}

	public function getUrlAttribute(): string
	{
		return Storage::disk('public')->url($this->path);
	}
}
