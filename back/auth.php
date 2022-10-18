<?php

require_once('./lib/init.php');
require_once('./lib/common.php');
require_once('./lib/db.php');

$data = file_get_contents('php://input');
$data = json_decode($data);

$username = $data->username;
$password = md5($data->password);

$output = [];

$result = $mysqli->query("SELECT id FROM users 
WHERE username = '$username' 
AND password = '$password'");

$row = $result->fetch_row();

$user_id = $row[0] ?? 0;

if ($user_id > 0) {
    $auth_key = md5(time());

    $result = $mysqli->query("INSERT INTO auth 
    (user_id, auth_key)
    VALUES
    ($user_id, '$auth_key')");

    $_SESSION['auth_key'] = $auth_key;
    
    $output['success'] = true;
    $output['data'] = $auth_key;

} else {
    $output['success'] = false;
}

echo json_encode($output);