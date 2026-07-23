<?php

namespace Tests\Feature\Trainer;

use App\Models\StudentProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class StudentAnamnesisTest extends TestCase
{
	use RefreshDatabase;

	private function createStudent(?User $trainer = null): StudentProfile
	{
		$studentUser = User::factory()->create(['role' => 'student']);

		return StudentProfile::create([
			'user_id' => $studentUser->id,
			'trainer_id' => $trainer?->id,
			'cpf' => fake()->unique()->numerify('###########'),
			'phone' => '11999999999',
		]);
	}

	public function test_trainer_can_view_empty_anamnesis_for_a_student(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$response = $this->actingAs($trainer)->getJson(
			"/api/trainer/students/{$student->id}/anamnesis",
		);

		$response->assertOk();
		$response->assertJsonPath('observations', null);
		$response->assertJsonCount(0, 'photos');
		$response->assertJsonCount(0, 'videos');
	}

	public function test_trainer_can_update_anamnesis_observations(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$response = $this->actingAs($trainer)->putJson(
			"/api/trainer/students/{$student->id}/anamnesis",
			['observations' => 'Histórico de lesão no joelho direito.'],
		);

		$response->assertOk();
		$this->assertDatabaseHas('student_anamneses', [
			'student_profile_id' => $student->id,
			'observations' => 'Histórico de lesão no joelho direito.',
		]);
	}

	public function test_trainer_can_upload_and_delete_a_photo(): void
	{
		Storage::fake('public');

		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$file = UploadedFile::fake()->image('evolucao.jpg');

		$storeResponse = $this->actingAs($trainer)->postJson(
			"/api/trainer/students/{$student->id}/anamnesis/photos",
			['photo' => $file],
		);

		$storeResponse->assertCreated();
		$path = $storeResponse->json('photo.path');
		Storage::disk('public')->assertExists($path);

		$photoId = $storeResponse->json('photo.id');

		$destroyResponse = $this->actingAs($trainer)->deleteJson(
			"/api/trainer/students/{$student->id}/anamnesis/photos/{$photoId}",
		);

		$destroyResponse->assertOk();
		Storage::disk('public')->assertMissing($path);
		$this->assertDatabaseMissing('student_anamnesis_attachments', ['id' => $photoId]);
	}

	public function test_photo_upload_rejects_invalid_file_type(): void
	{
		Storage::fake('public');

		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$file = UploadedFile::fake()->create('documento.pdf', 100);

		$response = $this->actingAs($trainer)->postJson(
			"/api/trainer/students/{$student->id}/anamnesis/photos",
			['photo' => $file],
		);

		$response->assertStatus(422);
	}

	public function test_trainer_can_upload_and_delete_a_video(): void
	{
		Storage::fake('public');

		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$file = UploadedFile::fake()->create('evolucao.mp4', 10_240, 'video/mp4');

		$storeResponse = $this->actingAs($trainer)->postJson(
			"/api/trainer/students/{$student->id}/anamnesis/videos",
			['video' => $file],
		);

		$storeResponse->assertCreated();
		$path = $storeResponse->json('video.path');
		Storage::disk('public')->assertExists($path);

		$videoId = $storeResponse->json('video.id');

		$this->assertDatabaseHas('student_anamnesis_attachments', [
			'id' => $videoId,
			'type' => 'video',
			'original_name' => 'evolucao.mp4',
		]);

		$destroyResponse = $this->actingAs($trainer)->deleteJson(
			"/api/trainer/students/{$student->id}/anamnesis/videos/{$videoId}",
		);

		$destroyResponse->assertOk();
		Storage::disk('public')->assertMissing($path);
		$this->assertDatabaseMissing('student_anamnesis_attachments', ['id' => $videoId]);
	}

	public function test_video_upload_rejects_invalid_file_type(): void
	{
		Storage::fake('public');

		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$file = UploadedFile::fake()->create('documento.pdf', 100);

		$response = $this->actingAs($trainer)->postJson(
			"/api/trainer/students/{$student->id}/anamnesis/videos",
			['video' => $file],
		);

		$response->assertStatus(422);
	}

	public function test_video_upload_rejects_file_larger_than_the_limit(): void
	{
		Storage::fake('public');

		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$file = UploadedFile::fake()->create('grande.mp4', 102_401, 'video/mp4');

		$response = $this->actingAs($trainer)->postJson(
			"/api/trainer/students/{$student->id}/anamnesis/videos",
			['video' => $file],
		);

		$response->assertStatus(422);
	}

	public function test_photos_and_videos_cannot_be_deleted_through_the_wrong_endpoint(): void
	{
		Storage::fake('public');

		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$photoResponse = $this->actingAs($trainer)->postJson(
			"/api/trainer/students/{$student->id}/anamnesis/photos",
			['photo' => UploadedFile::fake()->image('foto.jpg')],
		);
		$photoId = $photoResponse->json('photo.id');

		$response = $this->actingAs($trainer)->deleteJson(
			"/api/trainer/students/{$student->id}/anamnesis/videos/{$photoId}",
		);

		$response->assertStatus(404);
		$this->assertDatabaseHas('student_anamnesis_attachments', ['id' => $photoId]);
	}

	/**
	 * Em produção ainda não há storage persistente: o arquivo seria aceito e
	 * perdido no deploy seguinte. O bloqueio precisa estar no servidor, não só
	 * na tela — ver config/uploads.php.
	 */
	public function test_uploads_are_refused_when_disabled(): void
	{
		Storage::fake('public');
		config(['uploads.anamnesis_media' => false]);

		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$this->actingAs($trainer)->postJson(
			"/api/trainer/students/{$student->id}/anamnesis/photos",
			['photo' => UploadedFile::fake()->image('evolucao.jpg')],
		)->assertStatus(503);

		$this->actingAs($trainer)->postJson(
			"/api/trainer/students/{$student->id}/anamnesis/videos",
			['video' => UploadedFile::fake()->create('evolucao.mp4', 1_024, 'video/mp4')],
		)->assertStatus(503);

		$this->assertDatabaseCount('student_anamnesis_attachments', 0);
	}

	public function test_anamnesis_reports_whether_uploads_are_enabled(): void
	{
		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$this->actingAs($trainer)
			->getJson("/api/trainer/students/{$student->id}/anamnesis")
			->assertOk()
			->assertJsonPath('uploads_enabled', true);

		config(['uploads.anamnesis_media' => false]);

		$this->actingAs($trainer)
			->getJson("/api/trainer/students/{$student->id}/anamnesis")
			->assertOk()
			->assertJsonPath('uploads_enabled', false);
	}

	/**
	 * Desabilitar o envio não pode esconder nem apagar o que já foi enviado.
	 */
	public function test_existing_media_stays_visible_when_uploads_are_disabled(): void
	{
		Storage::fake('public');

		$trainer = User::factory()->create(['role' => 'trainer']);
		$student = $this->createStudent($trainer);

		$this->actingAs($trainer)->postJson(
			"/api/trainer/students/{$student->id}/anamnesis/photos",
			['photo' => UploadedFile::fake()->image('foto.jpg')],
		)->assertCreated();

		config(['uploads.anamnesis_media' => false]);

		$this->actingAs($trainer)
			->getJson("/api/trainer/students/{$student->id}/anamnesis")
			->assertOk()
			->assertJsonCount(1, 'photos')
			->assertJsonPath('uploads_enabled', false);
	}

	public function test_student_cannot_access_anamnesis(): void
	{
		$studentUser = User::factory()->create(['role' => 'student']);
		$student = $this->createStudent();

		$response = $this->actingAs($studentUser)->getJson(
			"/api/trainer/students/{$student->id}/anamnesis",
		);

		$response->assertStatus(403);
	}

	public function test_admin_can_access_anamnesis(): void
	{
		$admin = User::factory()->create(['role' => 'admin']);
		$student = $this->createStudent();

		$response = $this->actingAs($admin)->getJson(
			"/api/trainer/students/{$student->id}/anamnesis",
		);

		$response->assertOk();
	}
}
