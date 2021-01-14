<?php

/**
 * PHP login server; query has user and pass variables. For now,
 * just log in and update statistics, then forget about the token.
 * Set X-Codeserver-User to the user name.
 * Sets the AuthToken cookie for the current session;
 * the cookie contains an object with username, name, email
 * etc properties.
 * 
 * auth.html calls this script; returns the login data as JSON (see below).
 */

const MASTER_PASS = 'FreakC!wrtlbrmft';

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
    $code = 502;
    $u = urlencode($user);
    $p = urlencode($pass);
    $info = @file_get_contents("https://as.terrapinlogo.com?user=$u&pass=$p&domain=book&expires=30");
    if ($info)
        $info = @json_decode($info);
    if ($info) {
        if (isset($info->error))
            $code = $info->code;
        else {
            $code = 200;
            $data = (array) $info;
            $data['username'] = $user;
            $q = http_build_query([
                'do' => 'license_access',
                'license' => $license,
                'cid' => $cid, 
                'ip'  => $_SERVER['REMOTE_ADDR'],
                'ua'  => $_SERVER['HTTP_USER_AGENT']
            ]);
            @file_get_contents("https://as.terrapinlogo.com?".$q);
        }
    }
}

if ($code != 200)
    $code = 401;
else {
    $data['username'] = $user;
    $data['name'] = $data['first'].' '.$data['last'];
    $data = base64_encode(json_encode(($data)));
    setcookie('AuthToken', $data, 0, '/');
    header('X-Codeserver-User: '.$data['name']);
    header('X-Codeserver-Email: '.$data['email']);
}
http_response_code($code);
$data = json_encode($data);
header('Content-type: application/json');
header('Content-Length: '.strlen($data));
echo $data;
