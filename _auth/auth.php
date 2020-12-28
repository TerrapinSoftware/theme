<?php

/**
 * PHP auth checker; see if a cookie "AuthToken" contains the saved data.
 * Set the HTTP header "X-Codeserver-User" to the user name.
 */

include_once 'token.php';

$data = decrypt($_COOKIE["AuthToken"] ?? '');
if (!$data)
    $code = 401;
else {
    $code = 200;
    header('X-Codeserver-User: '.$data->username);
}
http_response_code($code);
