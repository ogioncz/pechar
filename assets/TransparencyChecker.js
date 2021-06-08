export default function TransparencyChecker() {
	this.width = 600;
	this.height = 600;
	this.itemId = null;
	this.canvas = document.createElement('canvas');
	this.canvas.setAttribute('width', this.width);
	this.canvas.setAttribute('height', this.height);
	this.context = this.canvas.getContext('2d');
	this.imageData = null;
}
TransparencyChecker.prototype.draw = function draw(itemId, img) {
	if(itemId !== this.itemId) {
		this.itemId = itemId;
		if(itemId === 0) {
			this.context.clearRect(0, 0, this.width, this.height);
			return;
		}
		this.context.drawImage(img, 0, 0);
		this.imageData = this.context.getImageData(0, 0, this.width, this.height);
	}
};
TransparencyChecker.prototype.getTransparency = function getTransparency(x, y) {
	var x = x << 0;
	var y = y << 0;
	var pixelPos = 4*(x + this.height*y);
	return 100 * this.imageData.data[pixelPos+3] / 255; 
};
TransparencyChecker.prototype.isEmpty = function isEmpty(x, y) {
	return this.itemId === 0 || this.imageData === null; 
};
