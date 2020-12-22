<?php

/**
 * PHP login server; query has user and pass variables
 */

include_once 'token.php';
$user = $pass = '';
parse_str($_SERVER['QUERY_STRING'] ?? '?', $query);
$u = urlencode($query['user']);
$p = urlencode($query['pass']);
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
if ($code != 200)
    http_response_code(401);
else {
    $s = encrypt($query['user'].':'.time());
    setcookie('AuthToken', $s, 0, '/');
    http_response_code(200);
}
