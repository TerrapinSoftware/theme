<?php

const ENCRYPT_METHOD = 'AES-256-CBC';
const SECRET_KEY = 'KJh hIUADSDSAIUk kDSJHISAUIDBL';
const SECRET_IV = 'dlf>OIA>AJN SDA>LKJDNSKJLNDSFHIDS';

/**
 * Helper function: Encrypt the given string.
 * @param string $string
 * @return string
 */
function encrypt(string $string) : string {
    $key = hash('sha256', SECRET_KEY);
    $iv = substr(hash('sha256', SECRET_IV), 0, 16);
    return base64_encode(openssl_encrypt($string."\n".time(), ENCRYPT_METHOD, $key, 0, $iv));
}

/**
 * Helper function: Decrypt the given string.
 * @param string $string
 * @return string|false
 */
function decrypt(string $string) {
    $key = hash('sha256', SECRET_KEY);
    $iv = substr(hash('sha256', SECRET_IV), 0, 16);
    $string = base64_decode($string);
    if (!$string)
        return false;
    $s = explode("\n", openssl_decrypt($string, ENCRYPT_METHOD, $key, 0, $iv));
    if (count($s) !== 2)
        return false;
    return $s[0];
}
