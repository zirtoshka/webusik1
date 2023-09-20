<?php
$start_time = microtime(true);
header("Content-Type: application/json; charset=utf-8");

function interrupt(int $code, string $msg)
{
    http_response_code($code);
    echo "{\"message\":\"$msg\"}";
    exit;
}

function data_from_json(array $coordinates)
{
    if ($_SERVER["CONTENT_TYPE"] !== "application/json") {
        interrupt(400, "Are you sure that it's a normal json?? I'm not");
    }
    $request = file_get_contents("php://input");
    $json = json_decode($request, true);
    if ($json === null) {
        interrupt(400, "Are you sure that it's a normal json?? I'm not");
    }
    foreach ($coordinates as $key => $type) {
        if (!array_key_exists($key, $json)) {
            interrupt(400, "$key is necessary");
        }
        if (!$type($json[$key])) {
            interrupt(400, "$key must be" . str_replace("is_", "", $type));
        }
    }
    return $json;
}

$method = $_SERVER["REQUEST_METHOD"];

if ($method !== "POST") {
    interrupt(405, "$method not allowed");
}

$data = data_from_json([
    "x" => "is_numeric",
    "y" => "is_numeric",
    "r" => "is_numeric"
]);

$x =  $data["x"];
$y =  $data["y"];
$r =  $data["r"];

function isCorrect(float $n): void
{
    $nStr=strval($n);
    $nDots= strpos($nStr, '.');
    if ($nDots !== false) {
        if(strlen($nStr) - $nDots - 1 >= 10 ){
            interrupt(400,"to many numbers");
        }}
}

isCorrect($x);
isCorrect($y);
isCorrect($r);




$xArray = array(-5,-4,-3,-2,-1,0,1,2,3);
$rArray=array(1,1.5,2,2.5,3);



if (!(in_array($x,$xArray))) {
    interrupt(400, "X is not in available((");
}

if ($y < -5 || $y > 5) {
    interrupt(400, "Y is not in range((");
}
if (!(in_array($r,$rArray))) {
    interrupt(400, "R is not in available((");
}

$check = ( (0 <= $x) && ($x <= $r) && (((-0.5)* $r) <= $y) && ($y <= 0)) ||
    (($y <= -$x / 2 + $r / 2) && ($x >= 0) && ($y >= 0))||
    (($x <= 0) && ($y <= 0) && (($x * $x + $y * $y) <= ($r * $r / 4)));


$end_time = microtime(true);
$res_time = number_format(($end_time - $start_time) * 1000, 3, '.', '');
// date_default_timezone_set('Europe/Moscow');
$timezone = isset($_SESSION['timezone']) ? $_SESSION['timezone'] : 'Europe/Moscow';
date_default_timezone_set($timezone);
$end_datetime = date("d/m/Y H:i:s", (int) $end_time);


?>
{
	"x": <?=$x?>,
	"y": <?=$y?>,
	"r": <?=$r?>,
	"result": <?=$check ? '"kill"' : '"miss"' ?>,
	"now": "<?=$end_datetime?>",
	"script_time": <?=$res_time?>
}
