<?php

/**
 * Vercel Serverless Entry Point for Laravel
 * 
 * This file acts as the PHP runtime entry point for Vercel.
 * It bootstraps the Laravel application from the project root.
 */

// Set the working directory to the project root (one level up from /api)
$projectRoot = dirname(__DIR__);

// Define Laravel start time
define('LARAVEL_START', microtime(true));

// Maintenance mode check
if (file_exists($maintenance = $projectRoot . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register Composer autoloader
require $projectRoot . '/vendor/autoload.php';

// Change working directory so Laravel can find all relative paths
chdir($projectRoot);

// Override DOCUMENT_ROOT and SCRIPT_FILENAME for proper path resolution
$_SERVER['DOCUMENT_ROOT']   = $projectRoot . '/public';
$_SERVER['SCRIPT_FILENAME'] = $projectRoot . '/public/index.php';

// Bootstrap Laravel and handle the incoming request
$app = require_once $projectRoot . '/bootstrap/app.php';

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

/** @var Application $app */
$app->handleRequest(Request::capture());
