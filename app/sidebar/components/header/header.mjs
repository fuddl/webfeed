import { requreStylesheet } from './../style.mjs'
import colorThief from '../../../../node_modules/colorthief/dist/color-thief.mjs'
import { rgb } from '../../../../node_modules/wcag-contrast/dist/index.m.js'

const thief = new colorThief()

const header = (vars) => {
	requreStylesheet('sidebar/components/header/header.css')

	const wrapper = document.createElement('header')
	wrapper.classList.add('header')
	if (vars?.title) {
		const title = document.createElement('h1')
		title.classList.add('header__title')
		title.innerText = vars.title
		wrapper.appendChild(title)

		const docTitle = document.createElement('title')
		docTitle.innerText = vars.title
		document.head.appendChild(docTitle)
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
		image.addEventListener('load', async () => {
			const bgOptions = await thief.getPalette(image)
			const fgOptions = [[0,0,0], [255,255,255]]
			if (bgOptions) {
				let bestContrast = null
				for (let color of bgOptions) {
					for (let fcolor of fgOptions) {
						if (bestContrast) {
							bestContrast = {
								background: color,
								color: fcolor,
							}
						} else {
							if (rgb(fcolor, color) > bestContrast) {
								bestContrast = {
									background: color,
									color: fcolor,
								}
							}
						}
					}
				}
				wrapper.style.setProperty("--header-bg", `#${bestContrast.background.map(x => x.toString(16).padStart(2, '0')).join('')}`);
				wrapper.style.setProperty("--header-color", `#${bestContrast.color.map(x => x.toString(16).padStart(2, '0')).join('')}`);
				
			}
		})
		let poll = setInterval(function () {
			if (typeof image?.naturalWidth == 'number') {
				clearInterval(poll);
				if (image.naturalWidth == image.naturalHeight) {
					const probablyASVG = (image.naturalWidth == 0 && image.naturalHeight == 0)
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