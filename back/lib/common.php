<?php

function check_var($var)
{
    return isset($var) && (!empty($var) || $var === 0);
}

function get_time_string($hour, $minute)
{
    if (
        check_var($hour) &&
        check_var($minute)
    ) {
        return "'$hour:$minute:00'";
    } else {
        return 'NULL';
    }
}
