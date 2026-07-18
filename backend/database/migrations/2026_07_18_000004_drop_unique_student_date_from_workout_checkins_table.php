<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
	public function up(): void
	{
		Schema::table('workout_checkins', function (Blueprint $table) {
			// A unique original também servia de índice para a foreign key de student_profile_id,
			// então precisa de um índice substituto antes de poder ser removida no MySQL.
			$table->index('student_profile_id');
			$table->dropUnique(['student_profile_id', 'performed_at']);
		});
	}

	public function down(): void
	{
		Schema::table('workout_checkins', function (Blueprint $table) {
			$table->dropIndex(['student_profile_id']);
			$table->unique(['student_profile_id', 'performed_at']);
		});
	}
};
