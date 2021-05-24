<?php

spl_autoload_register(function($strClass){
	require_once sprintf(__DIR__.'/Penguin/Penguin/%s.php', $strClass);
});

class TimeoutException extends RuntimeException {}

$penguin = getPenguin('mikro54321', 'mikroskop');
// setItems($penguin, [1=>15,1801,0,3032,34043,5404,0,7194,9106]);
function debug($text, $col='red') {
	echo Col::{$col}(var_export($text));
}
// $penguin = getPenguin('Lisured', 'kelowna');
echo json_encode(getItems($penguin));


/**
 * @throws ConnectionException
*/
function getPenguin($username, $password) {
	$penguin = new Penguin();
	$penguin->removeListener('e');

	$penguin->login($username, $password);
	$penguin->joinServer('Permafrost');

	$penguin->joinRoom(805);

	return $penguin;
}

/**
 * @throws ConnectionException
 * @throws TimeoutException
*/
function getItems($penguin) {
	$items = [];

	$penguin->addListener('gi', function($packet) use(&$items) {
		$items['inventory'] = array_slice($packet, 3);
	});

	$penguin->addListener('gp', function($packet) use(&$items) {
		$items['penguin'] = array_slice($packet, 3);
	});
	
	$penguin->sendXt('s', 'i#gi', -1);
	$penguin->getPlayer($penguin->intPlayerId);

	$start_time = microtime(true);

	while(!isset($items['inventory']) || !isset($items['penguin'])){
		if((microtime(true) - $start_time) > 10) {
			throw new TimeoutException('Getting list of items took too long.');
		}
		debug([$penguin->recv(), $penguin->intPlayerId]);
	}

	return $items;
}

/**
 * @throws ConnectionException
 * @throws TimeoutException
*/
function setItems($penguin, $items) {
	$types = [1 => 'Color', 2 => 'Head', 3 => 'Face', 4 => 'Neck', 5 => 'Body', 6 => 'Hand', 7 => 'Feet', 8 => 'Flag', 9 => 'Photo'];
	$start_time = microtime(true);
			echo Bart\EscapeColors::blue(var_export($items));
	foreach($types as $num => $type) {
		if($items[$num]) {
			$penguin->{'update'.$type}($items[$num]);
		}
	}

	while(true){
		if((microtime(true) - $start_time) > 10) {
			throw new TimeoutException('Dressing penguin took too long.');
		}
		echo Bart\EscapeColors::red($penguin->recv());
	}
}

if(isset($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest') {
	if(isset($_POST['action'])) {
		if(isset($_POST['username']) && isset($_POST['password'])) {
			if($_POST['action'] === 'logIn') {
				try {
					$penguin = getPenguin($_POST['username'], $_POST['password']);
				} catch(Exception $e) {
					if($e->getCode() === 101) {
						http_response_code(403);
						echo 'Incorrect credentials';
					} else {
						http_response_code(500);
						echo 'Couldn’t log in, try it again.';
					}
				}
				echo 'ok';
			} else if($_POST['action'] === 'loadPenguin') {
				header('Content-Type: text/json');
				try {
					$penguin = getPenguin($_POST['username'], $_POST['password']);
				} catch(Exception $e) {
					if($e->getCode() === 101) {
						http_response_code(403);
						echo 'Incorrect credentials';
					} else {
						http_response_code(500);
						echo 'Couldn’t log in, try it again.';
					}
				}
				echo json_encode(getItems($penguin));
			} else if($_POST['action'] === 'savePenguin') {
				try {
					if(!isset($_POST['items'])) {
						throw new Exception('Items missing');
					}
					$penguin = getPenguin($_POST['username'], $_POST['password']);
				} catch(Exception $e) {
					if($e->getCode() === 101) {
						http_response_code(403);
						echo 'Incorrect credentials';
					} else {
						http_response_code(500);
						echo 'Couldn’t log in, try it again.';
					}
				}
				setItems($penguin, $_POST['items']);
				echo 'ok';
			}
		} else {
			http_response_code(400);
			echo 'Missing credentials';
		}
	} else {
		http_response_code(400);
		echo 'Bad Request';
	}
} else {
	http_response_code(400);
	echo 'Bad Request';
}
