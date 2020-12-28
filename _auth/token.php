<?php

const USER_DATA_PATH = '/var/www/user.txt';

const ENCRYPT_METHOD = 'AES-256-CBC';
const SECRET_KEY = 'KJh hIUADSDSAIUk kDSJHISAUIDBL';
const SECRET_IV = 'dlf>OIA>AJN SDA>LKJDNSKJLNDSFHIDS';

/**
 * Helper function: Encrypt the given object.
 * @param object $data
 * @return string
 */
function encrypt(object $data) : string {
    $key = hash('sha256', SECRET_KEY);
    $iv = substr(hash('sha256', SECRET_IV), 0, 16);
    return base64_encode(openssl_encrypt(json_encode($data)."\n".time(), ENCRYPT_METHOD, $key, 0, $iv));
}

/**
 * Helper function: Decrypt the given string.
 * Returns an object with username and name properties.
 * @param string $string
 * @return object|null
 */
function decrypt(string $string) : ?object {
    $key = hash('sha256', SECRET_KEY);
    $iv = substr(hash('sha256', SECRET_IV), 0, 16);
    $string = base64_decode($string);
    if (!$string)
        return null;
    $s = explode("\n", openssl_decrypt($string, ENCRYPT_METHOD, $key, 0, $iv));
    if (count($s) !== 2)
        return null;
    return json_decode($s[0]);
}
