import { requreStylesheet } from './../style.mjs'

const header = (vars) => {
	requreStylesheet('sidebar/components/header/header.css')

	const wrapper = document.createElement('div')
	wrapper.classList.add('header')
	if (vars?.title) {
		const title = document.createElement('h1')
		title.classList.add('header__title')
		title.innerText = vars.title
		wrapper.appendChild(title)
	}
	if (vars?.subtitle) {
		const subtitle = document.createElement('p')
		subtitle.classList.add('header__subtitle')
		subtitle.innerText = vars.subtitle
		wrapper.appendChild(subtitle)
	}
	if (vars?.image?.url) {
		const image = document.createElement('img')
		image.setAttribute('src', vars.image.url)
		image.classList.add('header__avatar')
		let poll = setInterval(function () {
			if (typeof image?.naturalWidth == 'number') {
				clearInterval(poll);
				if (image.naturalWidth == image.naturalHeight) {
					const probablyASVG = (image.naturalWidth == 0 && image.naturalHeight == 0)
					if (probablyASVG || (image.naturalWidth / window.devicePixelRatio) >= 45) {
						image.setAttribute('width', '45')
						wrapper.appendChild(image)
						wrapper.classList.add('header--has-image')
					}
					if (probablyASVG || (image.naturalWidth / window.devicePixelRatio) >= 32) {
						const faviconLink = document.createElement('link')
						faviconLink.setAttribute('rel', 'shortcut icon')
						faviconLink.setAttribute('href', image.src)
						document.head.appendChild(faviconLink)
					}
				}
			}
		}, 10);
	}
	return wrapper
}

export { header }