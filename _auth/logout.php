<?php

/**
 * PHP logout server
 */
setcookie("AuthToken", time() - 3600);
header('Location: /');
