<?php

/**
 * PHP auth server with the following endpoints:
 * do=auth - checks auth status; returns 200 or 401
 * do=login - logs in a user; query has user and pass variables
 * do=logout - logs out a user
 */

include_once 'token.php';

$s = decrypt($_COOKIE["AuthToken"] ?? '');
if ($s === false)
    http_response_code(401);
else
    http_response_code(200);
