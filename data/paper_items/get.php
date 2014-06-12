<?php
function getContents($url) {
	$content = @file_get_contents($url);
	$status = $http_response_header[0];
	if(strPos($status, '200 OK') === false) {
		throw new Exception('Not found', 404);
	}
	return $content;
}

function saveItem($id) {
	$url = 'http://media8.clubpenguin.com/game/items/images/paper/image/600/' . $id . '.png';
	$content = getContents($url);
	file_put_contents(__DIR__ . '/' . $id . '.png', $content);
}

if(count(debug_backtrace()) === 0) {
	$id = intVal($_GET['id']);
	try {
		saveItem($id);
		header('Location: ' . $id . '.png');
	} catch(Exception $e) {
		http_response_code(404);
		echo 'Not Found';
	}
}
