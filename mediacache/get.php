<?php

const MEDIA_SERVERS = [
	// ADJUST MEDIA SERVERS TO TRY TO FETCH FROM:
	'http://media8.clubpenguin.com/',
	'http://media1.clubpenguin.com/',
	'http://mobcdn.clubpenguin.com/',
];

function getContents($url) {
	$content = @file_get_contents($url);
	$status = $http_response_header[0];
	if(strPos($status, '200 OK') === false) {
		throw new Exception('Not found', 404);
	}
	return $content;
}

function saveItem($path) {
	foreach (MEDIA_SERVERS as $server) {
		$e = null;
		try {
			$content = getContents($server . $path);
			break;
		} catch (Exception $e) {
			// We will handle it after we run out of options.
		}
	}

	if (isset($e)) {
		throw $e;
	}

	@mkdir(__DIR__ . '/' . dirname($path), 0777, true);
	file_put_contents(__DIR__ . '/' . $path, $content);
}

if(count(debug_backtrace()) === 0) {
	$path = $_GET['path'];
	$sanpath = preg_replace('([^\.a-zA-Z0-9/_-]|/\.\./)', '', $path);
	if ($path !== $sanpath) {
		http_response_code(400);
		echo 'Insane path' . PHP_EOL . htmlSpecialChars($path) . PHP_EOL . htmlSpecialChars($sanpath);
		die;
	}

	if (preg_match('(\.(png|jpg|json)$)', $path) !== 1) {
		http_response_code(400);
		echo 'Unsafe file type';
		die;
	}

	if (preg_match('(^(game|play)/)', $path) !== 1) {
		http_response_code(400);
		echo 'Unsafe directory prefix';
		die;
	}

	try {
		saveItem($path);
		header('Location: ' . $_SERVER['REQUEST_URI']);
	} catch(Exception $e) {
		http_response_code(404);
		echo 'Not Found';
	}
}
