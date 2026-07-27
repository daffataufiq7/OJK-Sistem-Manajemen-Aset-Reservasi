<?php

/**
 * Vercel Serverless Entry Point for Laravel (Zero-Config SQLite Support)
 */

$projectRoot = dirname(__DIR__);

define('LARAVEL_START', microtime(true));

// Create temporary storage directories in /tmp (read-write location on Vercel)
$storageDirs = [
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/cache',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/logs'
];
foreach ($storageDirs as $dir) {
    if (!is_dir($dir)) {
        @mkdir($dir, 0755, true);
    }
}

// Auto-copy SQLite database to /tmp if it doesn't exist yet
$tmpDb = '/tmp/database.sqlite';
$sourceDb = $projectRoot . '/database/database.sqlite';

if (!file_exists($tmpDb) && file_exists($sourceDb)) {
    @copy($sourceDb, $tmpDb);
}

if (file_exists($tmpDb)) {
    putenv('DB_CONNECTION=sqlite');
    putenv("DB_DATABASE={$tmpDb}");
    $_ENV['DB_CONNECTION'] = 'sqlite';
    $_ENV['DB_DATABASE'] = $tmpDb;
    $_SERVER['DB_CONNECTION'] = 'sqlite';
    $_SERVER['DB_DATABASE'] = $tmpDb;
}

// Maintenance mode check
if (file_exists($maintenance = $projectRoot . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register Composer autoloader
require $projectRoot . '/vendor/autoload.php';

chdir($projectRoot);

$_SERVER['DOCUMENT_ROOT']   = $projectRoot . '/public';
$_SERVER['SCRIPT_FILENAME'] = $projectRoot . '/public/index.php';

$app = require_once $projectRoot . '/bootstrap/app.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

/** @var Application $app */
$app->handleRequest(Request::capture());
