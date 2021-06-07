(function main() {
	var dataDir = 'data/';

	function getByProperty(array, property, value) {
		for(var i = 0, len = array.length; i < len; i++) {
			if(array[i][property] === value) {
				return array[i];
			}
		}
		return null;
	}

	var itemTags = null;
	var itemData = null;
	var inventoryItems = null;

	$('#app').html('<p>Please wait a moment, while the data is loading.</p>');

	var itemsPromise = $.Deferred();
	$.getJSON(dataDir + 'paper_items.json', function(data) {
		itemData = data;
	}).done(itemsPromise.resolve);

	var tagsPromise = $.Deferred();
	$.getJSON(dataDir + 'item_tags.json', function(data) {
		itemTags = data;
	}).done(tagsPromise.resolve);

	$.when(itemsPromise, tagsPromise).done(dataLoaded);


	var penguinItems = {
		1: 1,
		2: 0,
		3: 0,
		4: 0,
		5: 0,
		6: 0,
		7: 0,
		8: 0,
		9: 0
	};
	var layerOrder = [9, 1, 7, 5, 4, 3, 2, 6, 8];
	var transparencies = {
		1: new TransparencyChecker(0, null),
		2: new TransparencyChecker(0, null),
		3: new TransparencyChecker(0, null),
		4: new TransparencyChecker(0, null),
		5: new TransparencyChecker(0, null),
		6: new TransparencyChecker(0, null),
		7: new TransparencyChecker(0, null),
		8: new TransparencyChecker(0, null),
		9: new TransparencyChecker(0, null)
	}
	
	var penguin;
	var itemList;
	var urlField;

	function renderPenguin() {
		penguin.innerHTML = null;
		for(var i in layerOrder) {
			var itemType = layerOrder[i];
			var itemId = penguinItems[itemType];
			if(itemId !== 0) {
				var img = document.createElement('img');
				$(img).load({itemType: itemType, itemId: itemId, img: img}, function drawTransparenceCanvas(e) {
					transparencies[e.data.itemType].draw(e.data.itemId, e.data.img);
				});
				img.src = dataDir + 'paper_items/' + itemId + '.png';
				img.setAttribute('width', 600);
				img.setAttribute('height', 600);
				img.setAttribute('crossorigin', 'anonymous');
				
				penguin.appendChild(img);
			}
		}

		var itemString = penguinItems[1];
		for(var i = 2; i <= 9; i++) {
			itemString += '|' + penguinItems[i];
		}
		urlField.textContent = window.location.protocol + '//' + window.location.host + window.location.pathname + dataDir + 'composed/' + itemString + '.png';
	}

	function penguinClicked(e) {
		for(var i = layerOrder.length - 1; i >= 0; i--) {
			var layer = layerOrder[i];
			if(transparencies[layer].isEmpty()) {
				continue;
			}

			var imgPos = $(this).offset();
			var mousePos = {x: e.pageX - imgPos.left, y: e.pageY - imgPos.top};

			var transparency = transparencies[layer].getTransparency(mousePos.x, mousePos.y);
			if(transparency !== 0) {
				console.log(layer, penguinItems, transparencies)
				if(layer === 1) {
					return;
				}
				penguinItems[layer] = 0;
				updateHash();
				renderPenguin();
				return;
			}
		}
	}

	function search() {
		var terms = $('.search').val().toLowerCase().split(' ');
		for(var i = 0, l = inventoryItems.length; i < l; i++) {
			item = inventoryItems[i];
			var hidden = true;
			for(var term of terms) {
				if(term !== '' && item.getAttribute('data-tags').indexOf(term) > -1) {
					hidden = false;
					break;
				}
			}
			if (hidden) {
				item.classList.add('hidden')
			} else {
				item.classList.remove('hidden')
			}
		}
		$('.itemList').trigger('scroll');
	}

	function loadHash() {
		if(/^#/.test(document.location.hash)) {
			try {
				var hash = document.location.hash.replace(/^#/, '');
				console.log(decodeURIComponent(hash));
				var data = JSON.parse(decodeURIComponent(hash));
				for(var i in penguinItems) {
					if(typeof data[i] !== 'undefined') {
						penguinItems[i] = data[i];
					}
				}
			} catch(exception) {
				console.error(exception);
			}
		}
	}

	function updateHash() {
		document.location.hash = encodeURIComponent(JSON.stringify(penguinItems));
	}

	function tagify(name) {
		return name.split(' ').join(';').toLowerCase();
	}

	function getTags(itemId) {
		if(typeof itemTags[itemId] === 'undefined') {
			return [];
		}
		return itemTags[itemId];
	}

	function dataLoaded() {
		$('#app').html(
			'<div class="row">\
				<div class="col-md-6"><div class="penguin"></div></div>\
				<div class="col-md-6"><div class="inventory"><input type="search" placeholder="Type in to search…" id="search" class="form-control search"><div class="itemList well"></div></div></div>\
			</div>\
			<h2>URL</h2>\
			<p><code id="url"></code></p>'
		);

		penguin = document.querySelector('.penguin');
		itemList = document.querySelector('.itemList');
		urlField = document.querySelector('#url');

		var types = {
			1: 'Color',
			2: 'Head',
			3: 'Face',
			4: 'Neck',
			5: 'Body',
			6: 'Hand',
			7: 'Feet',
			8: 'Pin/Flag',
			9: 'Background'
		}

		for(var i in itemData) {
			var item = itemData[i];
			item.id = item.paper_item_id;
			if(item.type > 9 || item.is_bait === '1') {
				continue;
			}

			var img = document.createElement('img');
			img.setAttribute('width', 120);
			img.setAttribute('height', 120);
			
			var tags = ';' + tagify(types[item.type] + ' ' + item.label + ' ' + getTags(item.id).join(' '));

			img.setAttribute('data-original', dataDir + 'icons/' + item.id + '.png');
			img.setAttribute('title', item.label);
			
			img.setAttribute('data-id', item.id);
			img.setAttribute('data-type', item.type);
			img.setAttribute('data-tags', tags);
			
			itemList.appendChild(img);
		}

		inventoryItems = $('.itemList img');
		inventoryItems.lazyload({
			threshold: 120,
			container: $(".itemList")
		});
		$('img').tooltip({
			'container': 'body'
		});
		$('img').click(function(e) {
			var itemId = $(this).attr('data-id');
			var type = $(this).attr('data-type');
			penguinItems[type] = itemId;
			updateHash();

			renderPenguin();
		});
		
		$('.search').keyup(search);
		$('.search').change(search);

		loadHash();
		renderPenguin();

		window.addEventListener('hashchange', function hashChanged() {
			loadHash();
			renderPenguin();
		}, false);

		$('.penguin').click(penguinClicked);
	}
}());
