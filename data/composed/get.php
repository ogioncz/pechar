<?php

$layerOrder = [9, 1, 7, 5, 4, 3, 2, 6, 8];

$dataString = pathinfo(parse_url($_SERVER['REQUEST_URI'],  PHP_URL_PATH), PATHINFO_FILENAME);

$useMediaCache = !isset($_ENV['MEDIA_SERVER_LOCAL_DIRECTORY']);

if ($useMediaCache) {
	require __DIR__ . '/../../mediacache/get.php';

	$mediaServerLocal = __DIR__ . '/../../mediacache';
} else {
	$mediaServerLocal = $_ENV['MEDIA_SERVER_LOCAL_DIRECTORY'];
}

if (isset($_ENV['CACHE_DIRECTORY'])) {
	$cacheDirectory = $_ENV['CACHE_DIRECTORY'];
} else {
	$cacheDirectory = __DIR__;
}

if(!preg_match('/^\d+\|\d+\|\d+\|\d+\|\d+\|\d+\|\d+\|\d+\|\d+$/', $dataString)) {
	http_response_code(400);
	echo 'Bad Request';
	die;
}

$data = explode('|', $dataString);

$filename = $cacheDirectory . '/' . $dataString . '.png';

if(file_exists($filename)) {
	header('Location: ' . $dataString . '.png');
	die;
}

$image = imageCreateTrueColor(600, 600);
imageSaveAlpha($image, true);
$trans_color = imageColorAllocateAlpha($image, 0, 0, 0, 127);
imageFill($image, 0, 0, $trans_color);

foreach($layerOrder as $layer) {
	$id = $data[$layer-1] = intVal($data[$layer-1]);
	if($id === 0) {
		continue;
	}
	$itemServerPath = '/game/items/images/paper/image/600/' . $id . '.png';
	$item_filename = $mediaServerLocal . $itemServerPath;
	if(!file_exists($item_filename)) {
		if ($useMediaCache) {
			try {
				saveItem($itemServerPath);
			} catch(Exception $e) {
				$data[$layer-1] = 0;
			}
		} else {
			$data[$layer-1] = 0;
		}
	}
	$newData = implode('|', $data);
	if($newData !== $dataString) {
		header('Location: ' . $newData . '.png');
		die;
	}

	$item_image = imageCreateFromPng($item_filename);
	imageAlphaBlending($item_image, false);
	imageSaveAlpha($item_image, true);
	imageCopy($image, $item_image, 0, 0, 0, 0, 600, 600);
}

imagePng($image, $filename);
header('Location: ' . $dataString . '.png');
