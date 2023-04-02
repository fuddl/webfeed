import { requreStylesheet } from './../style.mjs'
import { getTextColorsFromImage } from './../../image-colours.mjs'

const getFavicon = async () => {
	const answer = await browser.runtime.sendMessage({
		type: 'getFavicon'
	});
}


const header = (vars) => {
	requreStylesheet('sidebar/components/header/header.css')

	const wrapper = document.createElement('header')

	const colorise = (imageUrl) => {
		const image = document.createElement('img')
		image.setAttribute('src', imageUrl)
		getTextColorsFromImage(image, (bestContrast) => {
			wrapper.style.setProperty("--header-bg", `#${bestContrast.background.map(x => x.toString(16).padStart(2, '0')).join('')}`);
			wrapper.style.setProperty("--header-color", `#${bestContrast.color.map(x => x.toString(16).padStart(2, '0')).join('')}`);
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
		colorise(vars?.image?.url)
	} else {
		(async () => {
			const favicon = await getFavicon()
			browser.runtime.onMessage.addListener(message => {
				if (message.type === 'foundFavicon') {
					colorise(message.payload.url)
				}
			});
		})()
	}


	window.addEventListener('scroll', () => {
		wrapper.classList.toggle('header--compact', window.scrollY > 1)
	})
	return wrapper
}

export { header }