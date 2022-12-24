<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

date_default_timezone_set('Asia/Vladivostok');

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: *');

session_start();