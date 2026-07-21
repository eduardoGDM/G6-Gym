<?php

namespace App\Http\Requests\Trainer;

use Illuminate\Foundation\Http\FormRequest;

class StoreStudentAnamnesisPhotoRequest extends FormRequest
{
	public function authorize(): bool
	{
		return in_array($this->user()?->role, ['trainer', 'admin'], true);
	}

	public function rules(): array
	{
		return [
			'photo' => 'required|file|mimes:jpg,jpeg,png,webp|max:5120',
		];
	}

	public function messages(): array
	{
		return [
			'photo.required' => 'A foto é obrigatória',
			'photo.mimes' => 'A foto deve ser um arquivo do tipo: jpg, jpeg, png ou webp',
			'photo.max' => 'A foto deve ter no máximo 5MB',
		];
	}
}
