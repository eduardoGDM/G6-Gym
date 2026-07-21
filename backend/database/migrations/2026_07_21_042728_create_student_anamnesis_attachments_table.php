<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::create('student_anamnesis_attachments', function (Blueprint $table) {
			$table->id();

			$table->foreignId('student_anamnesis_id')
				->constrained('student_anamneses')
				->cascadeOnDelete();

			$table->enum('type', ['image', 'video']);

			$table->string('path');

			$table->string('original_name')->nullable();

			$table->unsignedBigInteger('size')->nullable();

			$table->timestamps();
		});

		if (Schema::hasTable('student_anamnesis_photos')) {
			$photos = DB::table('student_anamnesis_photos')->get();

			foreach ($photos as $photo) {
				DB::table('student_anamnesis_attachments')->insert([
					'student_anamnesis_id' => $photo->student_anamnesis_id,
					'type' => 'image',
					'path' => $photo->path,
					'original_name' => null,
					'size' => null,
					'created_at' => $photo->created_at,
					'updated_at' => $photo->updated_at,
				]);
			}
		}

		Schema::dropIfExists('student_anamnesis_photos');
		Schema::dropIfExists('student_anamnesis_videos');
	}

	public function down(): void
	{
		Schema::create('student_anamnesis_photos', function (Blueprint $table) {
			$table->id();
			$table->foreignId('student_anamnesis_id')->constrained('student_anamneses')->cascadeOnDelete();
			$table->string('path');
			$table->timestamps();
		});

		Schema::create('student_anamnesis_videos', function (Blueprint $table) {
			$table->id();
			$table->foreignId('student_anamnesis_id')->constrained('student_anamneses')->cascadeOnDelete();
			$table->string('title')->nullable();
			$table->string('url');
			$table->timestamps();
		});

		if (Schema::hasTable('student_anamnesis_attachments')) {
			$images = DB::table('student_anamnesis_attachments')->where('type', 'image')->get();

			foreach ($images as $image) {
				DB::table('student_anamnesis_photos')->insert([
					'student_anamnesis_id' => $image->student_anamnesis_id,
					'path' => $image->path,
					'created_at' => $image->created_at,
					'updated_at' => $image->updated_at,
				]);
			}
		}

		Schema::dropIfExists('student_anamnesis_attachments');
	}
};
