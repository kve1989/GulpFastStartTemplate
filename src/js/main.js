'use strict';

function ibg() {
	let ibg = document.querySelectorAll(".ibg");
	for (var i = 0; i < ibg.length; i++) {
		if (ibg[i].querySelector('img')) {
			ibg[i].style.backgroundImage = 'url(' + ibg[i].querySelector('img').getAttribute('src') + ')';
		}
	}
}

[].forEach.call(document.querySelectorAll('img[data-src]'), function (img) {
	img.setAttribute('src', img.getAttribute('data-src'));
	img.onload = function () {
		img.removeAttribute('data-src');
	};
});

function bindModal(triggerSelector, modalSelector, closeSelector) {
	const trigger = document.querySelectorAll(triggerSelector),
		modal = document.querySelector(modalSelector),
		close = document.querySelector(closeSelector);

	trigger.forEach(item => {
		item.addEventListener('click', (e) => {
			if (e.target) {
				e.preventDefault();
			}
			modal.style.display = 'block';
			document.body.style.overflow = 'hidden';
		});
	});

	close.addEventListener('click', (e) => {
		modal.style.display = 'none';
		document.body.style.overflow = '';
	});
}

document.addEventListener('DOMContentLoaded', () => {
	ibg();
});
