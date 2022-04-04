<?php
    require_once('config.php');

    if (isset($_POST['c']) && isset($_POST['x']) && isset($_POST['y'])) {
        $color = $_POST['c'];
        $x = intval($_POST['x']);
        $y = intval($_POST['y']);

        $a = 'someone';
        if (isset($_POST['a'])) $a = $_POST['a'];

        if ($x >= 0 && $x < $width && $y >= 0 && $y < $height) {
            $c = pack("i", $color);

            // Save new tile color to canvas file
            $handle = fopen($path, "cb");
            fseek($handle, $y * $width + $x);
            fwrite($handle, $c, 1);
            fclose($handle);

            echo ":)";
        } else echo "Out of bounds!";

    } else echo ":(";
?>