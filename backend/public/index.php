<?php

use App\Kernel;

if (!is_file(dirname(__DIR__).'/vendor/autoload_runtime.php')) {
    http_response_code(503);
    header('Content-Type: application/json');

    echo json_encode([
        'status' => 'bootstrapping',
        'message' => 'Dependencies are missing. Run composer install inside the php container.',
    ], JSON_PRETTY_PRINT);

    return;
}

require_once dirname(__DIR__).'/vendor/autoload_runtime.php';

return function (array $context) {
    return new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
};

