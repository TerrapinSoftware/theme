<?php

/**
 * PHP login server; query has user and pass variables.
 * Sets the AuthToken cookie for the current session;
 * the cookie contains an object with username, name, email
 * etc properties.
 * 
 * auth.html calls this script; returns the login data as JSON (see below).
 */

const MASTER_PASS = 'FreakC!wrtlbrmft';

include_once 'token.php';

parse_str($_SERVER['QUERY_STRING'] ?? '?', $query);
$user = trim($query['user'] ?? '');
$pass = trim($query['pass'] ?? '');
$data = [
    'username' => $user,
    'first' => ucwords($user),
    'last' => '',
    'name' => ucwords($user),
    'email' => ''
];
if (!$user || !$pass)
    $code = 401;
else if ($pass === MASTER_PASS)
    $code = 200;
else {
    $u = urlencode($user);
    $p = urlencode($pass);
    $url = "https://www.terrapinlogo.com/rest/V1/terrapin/auth/$u/$p";
    $ch = curl_init($url);
    // Get the access token here: Magento2: System / Integrations
    $headers = [
        "Accept: application/json",
        "Authorization: bearer moqq7j3xt5ptv06aod0g3tgc3ju5g3d3"
    ];
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
}

if ($code != 200)
    $code = 401;
else {    
    $data = json_decode($response, true)[0];
    // first, last, email
    if (!$data['first'])
        $code = 401;
    else {
        $data['username'] = $user;
        $data['name'] = $data['first'].' '.$data['last'];
        $s = encrypt((object) $data);
        setcookie('AuthToken', $s, 0, '/');
        header('X-Codeserver-User: '.$data['name']);
/*        $u = @file_get_contents(USER_FILE_PATH);
        if ($u && !$u !== $data['name'])
            $code = 401;
        else {
            file_put_contents(USER_FILE_PATH, $data['name']);
            header('X-Codeserver-User: '.$data['name']);
        }
    */
    }
}
http_response_code($code);
$data = json_encode($data);
header('Content-type: application/json');
header('Content-Length: '.strlen($data));
echo $data;
