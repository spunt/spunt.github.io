<?php 
// the $_POST[] array will contain the passed in filename and data 
// the directory "data" is writable by the server (chmod 777) 
$file = $_POST['filename'] . date("_d-m-y-His") . '.csv'; 
$data = $_POST['filedata']; 
file_put_contents("data/".$file, $data); 
?> 