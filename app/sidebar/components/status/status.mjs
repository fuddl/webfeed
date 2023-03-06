import { requreStylesheet } from './../style.mjs'


const status = (vars) => {
	requreStylesheet('./components/status/status.css')

	const wrapper = document.createElement('section')
	wrapper.classList.add('status')
	const date = document.createElement('time')
	date.classList.add('status__date')
	date.innerText = vars.date.toLocaleString(navigator.language)
	wrapper.appendChild(date)

	wrapper.appendChild(vars.description)


	if (vars.image) {
		const image = document.createElement('img')
		image.setAttribute('src', vars.image)
		wrapper.appendChild(image)

		let poll = setInterval(function () {
			if (image.naturalWidth) {
				clearInterval(poll);
				if ((image.naturalWidth / window.devicePixelRatio) >= window.innerWidth) {
					const imageWrapper = document.createElement('div')
					imageWrapper.classList.add('status__wide-image')
					wrapper.appendChild(imageWrapper)
					imageWrapper.appendChild(image)
				}
			}
		}, 10);
	}
	return wrapper
}

export { status }