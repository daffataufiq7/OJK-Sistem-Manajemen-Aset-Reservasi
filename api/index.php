<?php

/**
 * Vercel Serverless Entry Point for Laravel (Zero-Config SQLite Support)
 */

$projectRoot = dirname(__DIR__);

define('LARAVEL_START', microtime(true));

// Ensure APP_KEY is always present so Laravel Encrypter never throws 500 error
if (!getenv('APP_KEY')) {
    $appKey = 'base64:2ThksQrzsJvLyvWYuQBlarVzfHGoZ+hWbNkW2OLBKow=';
    putenv("APP_KEY={$appKey}");
    $_ENV['APP_KEY'] = $appKey;
    $_SERVER['APP_KEY'] = $appKey;
}

// Redirect all framework cache & compiled view paths to /tmp (writable on Vercel)
putenv('VIEW_COMPILED_PATH=/tmp/storage/framework/views');
putenv('APP_CONFIG_CACHE=/tmp/config.php');
putenv('APP_SERVICES_CACHE=/tmp/services.php');
putenv('APP_PACKAGES_CACHE=/tmp/packages.php');
putenv('APP_ROUTES_CACHE=/tmp/routes.php');

// Create temporary storage directories in /tmp
$storageDirs = [
    '/tmp/storage/framework/views',
    '/tmp/storage/framework/cache/data',
    '/tmp/storage/framework/sessions',
    '/tmp/storage/logs',
    '/tmp/storage/app/public',
    '/tmp/storage/app/private'
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
    @chmod($tmpDb, 0666);
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

// Ensure HTTP Authorization Header is forwarded to PHP & Sanctum on Vercel
if (!isset($_SERVER['HTTP_AUTHORIZATION'])) {
    if (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $_SERVER['HTTP_AUTHORIZATION'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (function_exists('getallheaders')) {
        $headers = getallheaders();
        if (isset($headers['Authorization'])) {
            $_SERVER['HTTP_AUTHORIZATION'] = $headers['Authorization'];
        } elseif (isset($headers['authorization'])) {
            $_SERVER['HTTP_AUTHORIZATION'] = $headers['authorization'];
        }
    }
}

$_SERVER['DOCUMENT_ROOT']   = $projectRoot . '/public';
$_SERVER['SCRIPT_FILENAME'] = $projectRoot . '/public/index.php';
$_SERVER['SCRIPT_NAME']     = '/index.php';
$_SERVER['PHP_SELF']        = '/index.php';

/** @var \Illuminate\Foundation\Application $app */
$app = require_once $projectRoot . '/bootstrap/app.php';

// Override storage path to /tmp/storage so file operations succeed
$app->useStoragePath('/tmp/storage');

$app->handleRequest(\Illuminate\Http\Request::capture());
