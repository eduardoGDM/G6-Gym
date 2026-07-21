<?php

namespace App\Http\Requests\Trainer;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentAnamnesisVideoRequest extends FormRequest
{
	public function authorize(): bool
	{
		return in_array($this->user()?->role, ['trainer', 'admin'], true);
	}

	public function rules(): array
	{
		return [
			'video' => 'required|file|mimes:mp4,mov,webm|max:102400',
		];
	}

	public function messages(): array
	{
		return [
			'video.required' => 'O vídeo é obrigatório',
			'video.mimes' => 'O vídeo deve ser um arquivo do tipo: mp4, mov ou webm',
			'video.max' => 'O vídeo deve ter no máximo 100MB',
		];
	}
}
