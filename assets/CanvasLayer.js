export default function CanvasLayer(width, height) {
	this.width = width;
	this.height = height;
	this.uri = null;
	this.canvas = document.createElement('canvas');
	this.canvas.setAttribute('width', this.width);
	this.canvas.setAttribute('height', this.height);
	this.context = this.canvas.getContext('2d');
	this.imageData = null;
	this.image = new Image();
	this.image.setAttribute('crossorigin', 'anonymous');

	this.image.addEventListener('load', () => {
		this.context.clearRect(0, 0, this.width, this.height);
		this.context.drawImage(this.image, 0, 0);
		this.imageData = this.context.getImageData(0, 0, this.width, this.height);
	});
}
CanvasLayer.prototype.draw = function draw(uri) {
	if(uri !== this.uri) {
		this.uri = uri;
		if(uri === null) {
			this.context.clearRect(0, 0, this.width, this.height);
			return;
		}
		this.image.src = uri;
	}
};
CanvasLayer.prototype.getTransparency = function getTransparency(x, y) {
	var x = x << 0;
	var y = y << 0;
	var pixelPos = 4*(x + this.height*y);
	return 100 * this.imageData.data[pixelPos+3] / 255;
};
CanvasLayer.prototype.isEmpty = function isEmpty(x, y) {
	return this.uri === null || this.imageData === null;
};
