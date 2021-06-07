<?php
require __DIR__ . '/../paper_items/get.php';

function saveIcon($id) {
	$url = 'https://icer.ink/media8.clubpenguin.com/game/items/images/paper/icon/120/' . $id . '.png';
	$content = getContents($url);
	file_put_contents(__DIR__ . '/' . $id . '.png', $content);
}

if(count(debug_backtrace()) === 0) {
	$id = intVal($_GET['id']);
	try {
		saveIcon($id);
		header('Location: ' . $id . '.png');
	} catch(Exception $e) {
		http_response_code(404);
		echo 'Not Found';
	}
}