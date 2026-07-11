<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->foreignId('category_id')->constrained('asset_categories')->onDelete('cascade');
            $table->string('location');
            $table->string('status')->default('available'); // available, reserved, in_use, maintenance, inactive
            $table->string('condition')->default('good'); // good, fair, poor
            $table->string('photo')->nullable();
            $table->text('qr_code')->nullable();
            $table->date('maintenance_schedule')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
