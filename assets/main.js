import 'lazyload';
import some from 'lodash/some';
import Tooltip from 'bootstrap/js/dist/tooltip';
import TransparencyChecker from './TransparencyChecker';

const mediaServer = process.env.MEDIA_SERVER_URI ?? 'mediacache';
const dataDir = 'data';

const ItemType = {
	COLOR: 1,
	HEAD: 2,
	FACE: 3,
	NECK: 4,
	BODY: 5,
	HAND: 6,
	FEET: 7,
	PIN: 8,
	BACKGROUND: 9,
};

const itemTypes = [
	ItemType.COLOR,
	ItemType.HEAD,
	ItemType.FACE,
	ItemType.NECK,
	ItemType.BODY,
	ItemType.HAND,
	ItemType.FEET,
	ItemType.PIN,
	ItemType.BACKGROUND,
];

const layerOrder = [
	ItemType.BACKGROUND,
	ItemType.COLOR,
	ItemType.FEET,
	ItemType.BODY,
	ItemType.NECK,
	ItemType.FACE,
	ItemType.HEAD,
	ItemType.HAND,
	ItemType.PIN,
];

const itemTypeNames = {
	[ItemType.COLOR]: 'Color',
	[ItemType.HEAD]: 'Head',
	[ItemType.FACE]: 'Face',
	[ItemType.NECK]: 'Neck',
	[ItemType.BODY]: 'Body',
	[ItemType.HAND]: 'Hand',
	[ItemType.FEET]: 'Feet',
	[ItemType.PIN]: 'Pin/Flag',
	[ItemType.BACKGROUND]: 'Background',
}

document.addEventListener('DOMContentLoaded', function main() {
	let itemTags = null;
	let itemData = null;
	let inventoryItems = null;

	document.querySelector('#app').innerHTML = '<p>Please wait a moment, while the data is loading.</p>';

	const itemsPromise = fetch(mediaServer + '/play/en/web_service/game_configs/paper_items.json').then((resp) => resp.json()).then((data) => itemData = data);

	const tagsPromise = fetch(dataDir + '/item_tags.json').then((resp) => resp.json()).then((data) => itemTags = data);

	Promise.all([itemsPromise, tagsPromise]).then(dataLoaded);

	let penguinItems = {
		[ItemType.COLOR]: 1,
		[ItemType.HEAD]: 0,
		[ItemType.FACE]: 0,
		[ItemType.NECK]: 0,
		[ItemType.BODY]: 0,
		[ItemType.HAND]: 0,
		[ItemType.FEET]: 0,
		[ItemType.PIN]: 0,
		[ItemType.BACKGROUND]: 0,
	};
	let transparencies = {
		[ItemType.COLOR]: new TransparencyChecker(0, null),
		[ItemType.HEAD]: new TransparencyChecker(0, null),
		[ItemType.FACE]: new TransparencyChecker(0, null),
		[ItemType.NECK]: new TransparencyChecker(0, null),
		[ItemType.BODY]: new TransparencyChecker(0, null),
		[ItemType.HAND]: new TransparencyChecker(0, null),
		[ItemType.FEET]: new TransparencyChecker(0, null),
		[ItemType.PIN]: new TransparencyChecker(0, null),
		[ItemType.BACKGROUND]: new TransparencyChecker(0, null),
	}

	let penguin;
	let itemList;
	let urlField;

	function renderPenguin() {
		penguin.innerHTML = null;
		for (let itemType of layerOrder) {
			const itemId = penguinItems[itemType];
			if (itemId !== 0) {
				const img = document.createElement('img');
				img.addEventListener('load', () => {
					transparencies[itemType].draw(itemId, img);
				});
				img.src = mediaServer + '/game/items/images/paper/image/600/' + itemId + '.png';
				img.setAttribute('width', 600);
				img.setAttribute('height', 600);
				img.setAttribute('crossorigin', 'anonymous');

				penguin.appendChild(img);
			}
		}

		let itemString = itemTypes.map((itemType) => penguinItems[itemType]).join('|');
		urlField.textContent = window.location.protocol + '//' + window.location.host + window.location.pathname + dataDir + '/composed/' + itemString + '.png';
	}

	function penguinClicked(e) {
		for (let layer of Array.from(layerOrder).reverse()) {
			if (transparencies[layer].isEmpty()) {
				continue;
			}

			const imgPos = e.target.getBoundingClientRect();
			const mousePos = {
				x: e.clientX - imgPos.left,
				y: e.clientY - imgPos.top,
			};

			const transparency = transparencies[layer].getTransparency(mousePos.x, mousePos.y);
			if (transparency !== 0) {
				console.log(layer, penguinItems, transparencies)
				if (layer === 1) {
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
		const terms = document.querySelector('.search').value.toLowerCase().split(' ');
		inventoryItems.forEach((item) => {
			const visible = some(terms, (term) => term !== '' && item.getAttribute('data-tags').includes(term));
			item.classList.toggle('d-none', !visible);
		});
		document.querySelector('.itemList').dispatchEvent(new Event('scroll'));
	}

	function loadHash() {
		if (/^#/.test(document.location.hash)) {
			try {
				const hash = document.location.hash.replace(/^#/, '');
				console.log(decodeURIComponent(hash));
				const data = JSON.parse(decodeURIComponent(hash));
				for (let i in penguinItems) {
					if (typeof data[i] !== 'undefined') {
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
		if (typeof itemTags[itemId] === 'undefined') {
			return [];
		}
		return itemTags[itemId];
	}

	function dataLoaded() {
		document.querySelector('#app').innerHTML = `
			<div class="row">
				<div class="col-md-6">
					<div class="penguin"></div>
				</div>
				<div class="col-md-6">
					<div class="inventory">
						<div class="card border-secondary">
							<div class="itemList card-body">
							</div>
							<div class="card-footer">
								<input type="search" placeholder="Type in to search…" id="search" class="form-control search">
							</div>
						</div>
					</div>
				</div>
			</div>
			<h2>URL</h2>
			<p><code id="url"></code></p>
		`;

		penguin = document.querySelector('.penguin');
		itemList = document.querySelector('.itemList');
		urlField = document.querySelector('#url');

		for (let item of itemData) {
			item.id = item.paper_item_id;
			if (item.type > ItemType.BACKGROUND || item.is_bait === '1') {
				continue;
			}

			const img = document.createElement('img');
			img.setAttribute('width', 120);
			img.setAttribute('height', 120);

			const tags = ';' + tagify(itemTypeNames[item.type] + ' ' + item.label + ' ' + getTags(item.id).join(' '));

			img.setAttribute('data-src', mediaServer + '/game/items/images/paper/icon/120/' + item.id + '.png');
			img.setAttribute('title', item.label);

			img.setAttribute('data-id', item.id);
			img.setAttribute('data-type', item.type);
			img.setAttribute('data-tags', tags);

			itemList.appendChild(img);
		}

		inventoryItems = document.querySelectorAll('.itemList img');
		lazyload(inventoryItems, {
			root: document.querySelector('.itemList')
		});

		const tooltipList = Array.from(inventoryItems).map((tooltipTriggerEl) => {
			return new Tooltip(tooltipTriggerEl)
		});

		document.querySelectorAll('img').forEach((img) => {
			img.addEventListener('click', () => {
				const itemId = img.getAttribute('data-id');
				const type = img.getAttribute('data-type');
				penguinItems[type] = itemId;
				updateHash();

				renderPenguin();
			});
		});

		document.querySelector('.search').addEventListener('keyup', search);
		document.querySelector('.search').addEventListener('change', search);

		loadHash();
		renderPenguin();

		window.addEventListener('hashchange', function hashChanged() {
			loadHash();
			renderPenguin();
		}, false);

		document.querySelector('.penguin').addEventListener('click', penguinClicked);
	}
});
