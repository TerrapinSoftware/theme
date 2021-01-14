<?php

/**
 * nginx calls this file. It uses the base64 encoded string in the AuthToken
 * cookie to extract the user name and to set backend HTTP headers.
 */

$data = decrypt($_COOKIE["AuthToken"] ?? '');
if (!$data)
    // nginx will launch auth.html
    $code = 401;
else {
    // we are logged in
    $code = 200;
    $arr = json_decode(base64_decode($data));
    if ($data) {
        header('X-Codeserver-User: '.$data->name);
        header('X-Codeserver-Email: '.$data->email);
    }
}
http_response_code($code);
