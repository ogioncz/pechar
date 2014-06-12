<?php
function get_contents($url) {
	$content = @file_get_contents($url);
	return [
		'content' => $content,
		'status' => $http_response_header[0]
	];
}

$id = intval($_GET['id']);
$url = 'http://media8.clubpenguin.com/game/items/images/paper/image/600/' . $id . '.png';
$data = get_contents($url);

if(strpos($data['status'], '200 OK') === false) {
	http_response_code(404);
	echo "Not Found";
} else {
	file_put_contents($id . '.png', $data['content']);
	header('Location: ' . $id . '.png');
}
