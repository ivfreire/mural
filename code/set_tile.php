<?php
    require_once('config.php');

    if (isset($_POST['c']) && isset($_POST['x']) && isset($_POST['y'])) {
        $color = inval($_POST['c']);
        $x = intval($_POST['x']);
        $y = intval($_POST['y']);

        $c = pack("i", $color);

        $handle = fopen($path, "cb");
        fseek($handle, $y * $width + $x);
        fwrite($handle, $c, 1);
        fclose($handle);

        echo ":)";
    } else echo ":(";
?>