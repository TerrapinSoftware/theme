<?php

/**
 * PHP logout server; remove any "AuthToken" cookie and
 * redirect to the base URL.
 */
setcookie("AuthToken", time() - 3600);
header('Location: /');
