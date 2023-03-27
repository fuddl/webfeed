import { requreStylesheet } from './../style.mjs'
import { gallery } from './../gallery/gallery.mjs'

const status = (vars) => {
	requreStylesheet('sidebar/components/status/status.css')

	const wrapper = document.createElement('section')
	wrapper.classList.add('status')
	if (vars?.date) {
		const date = document.createElement('time')
		date.classList.add('status__date')
		date.innerText = vars.date.toLocaleString(navigator.language)
		wrapper.appendChild(date)
	}

	if (vars?.description) {
		wrapper.appendChild(vars.description)
	}

	if (vars?.images?.length === 1) {
		const imageWrapper = document.createElement('div')
		const image = document.createElement('img')
		image.setAttribute('src', vars.images[0].url)
		image.setAttribute('alt', vars.images[0].media__description)
		imageWrapper.appendChild(image)
		wrapper.appendChild(imageWrapper)
	} else if(vars?.images?.length > 1) {
		wrapper.appendChild(gallery({ images: vars.images }))
	}
	return wrapper
}

export { status }