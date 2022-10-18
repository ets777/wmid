<?php

require_once('./lib/init.php');

if (isset($_SESSION['auth_key'])) {
    $output['success'] = true;
    $output['data'] = $_SESSION['auth_key'];
} else {
    $output['success'] = false;
}

echo json_encode($output);