<?php
    require_once("config.php");
    
    $canvas;
    $handle = fopen($path, "rb");

    if (isset($_POST['x'], $_POST['y'], $_POST['w'], $_POST['h'])) {
        $x = intval($_POST['x']);
        $y = intval($_POST['y']);
        $w = intval($_POST['w']);
        $h = intval($_POST['h']);

        if ($x < 0) $x = 0;
        if ($y < 0) $y = 0;
        if ($w > $width) $w = $width;
        if ($h > $height) $h = $width;

        $buffer;
        for ($i = 0; $i < $h; $i++) {
            fseek($handle, ($y + $i) * $width + $x);
            $buffer = fread($handle, $w);
            $canvas = $canvas . $buffer;
        }

    } else $canvas = fread($handle, $width*$height);

    fclose($handle);

    echo $canvas;
?>