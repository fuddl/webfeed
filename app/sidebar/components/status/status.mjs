import { requreStylesheet } from './../style.mjs'
import { gallery } from './../gallery/gallery.mjs'

const status = (vars) => {
	requreStylesheet('sidebar/components/status/status.css')

	const wrapper = document.createElement('section')
	wrapper.classList.add('status')

	if (vars?.author) {
		const target = vars?.author?.email
		const author = document.createElement(target ? 'a' : 'span')
		author.classList.add('status__author')
		if (target) {
			author.setAttribute('href', target)
		}
		author.innerText = vars.author.name
		wrapper.appendChild(author)
		wrapper.appendChild(document.createTextNode(' '))
	}

	if (vars?.date) {
		const date = document.createElement('time')
		date.classList.add('status__date')
		date.innerText = vars.date.toLocaleString(navigator.language)
		wrapper.appendChild(date)
	}

	if (vars?.text) {
		const singleParagraph = vars.text.querySelectorAll('p').length == 1
		const textWrap = document.createElement('div')
		textWrap.appendChild(vars.text)
		textWrap.classList.add('status__text')
		if (singleParagraph) {
			const length = textWrap.innerText.length
			if (length < 60 && length > 30) {
				textWrap.classList.add('status__text--short')
			} else if (length <= 30) {
				textWrap.classList.add('status__text--very-short')
			}
		}
		wrapper.appendChild(textWrap)
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