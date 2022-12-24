<?php

declare(strict_types=1);

require_once('/opt/lampp/htdocs/wmid/back/lib/common.php');

use PHPUnit\Framework\TestCase;

final class CommonTest extends TestCase
{
    /**
     * @dataProvider providerGetTimeString
     */
    public function testGetTimeString($hour, $minute, $time): void
    {
        $this->assertEquals(
            $time,
            get_time_string($hour, $minute)
        );
    }

    public function providerGetTimeString()
    {
        return array(
            array(10, 38, "'10:38:00'"),
            array(8, 0, "'8:0:00'"),
            array(null, null, "NULL")
        );
    }

    /**
     * @dataProvider providerCheckVar
     */
    public function testCheckVar($var, $result): void
    {
        $this->assertEquals(
            $result,
            check_var($var)
        );
    }

    public function providerCheckVar()
    {
        return array(
            array(10, true),
            array(0, true),
            array(null, false),
            array('a', true),
            array('', false)
        );
    }
}
