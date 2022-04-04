<?php
    require_once("config.php");

    $handle = fopen($path, "rb");
    $canvas = fread($handle, $width*$height);
    fclose($handle);

    echo $canvas;
?>