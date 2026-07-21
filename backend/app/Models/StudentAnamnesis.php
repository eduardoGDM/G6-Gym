<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StudentAnamnesis extends Model
{
	use HasFactory;

	protected $table = 'student_anamneses';

	protected $fillable = [
		'student_profile_id',
		'observations',
	];

	public function studentProfile(): BelongsTo
	{
		return $this->belongsTo(StudentProfile::class);
	}

	public function attachments(): HasMany
	{
		return $this->hasMany(StudentAnamnesisAttachment::class);
	}

	public function photos(): HasMany
	{
		return $this->attachments()->where('type', 'image');
	}

	public function videos(): HasMany
	{
		return $this->attachments()->where('type', 'video');
	}
}
