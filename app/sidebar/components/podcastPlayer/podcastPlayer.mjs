import { requreStylesheet } from './../style.mjs'


const podcastPlayer = (vars) => {
	requreStylesheet('sidebar/components/podcastPlayer/podcastPlayer.css')

	const wrapper = document.createElement('section')
	wrapper.classList.add('podcast-player')
	const textWrapper = document.createElement('div')
	textWrapper.classList.add('podcast-player__text')
	wrapper.appendChild(textWrapper)

	if (vars?.cover?.href) {
		const image = document.createElement('img')
		image.setAttribute('src', vars.cover.href)
		image.setAttribute('loading', 'lazy')
		image.classList.add('podcast-player__cover')
		wrapper.classList.add('podcast-player--has-cover')
		wrapper.appendChild(image)
	}

	const title = document.createElement('h2')
	if (vars?.no) {
		const number = document.createElement('span')
		number.textContent = `№${vars.no}:`
		title.appendChild(number)
		title.appendChild(document.createTextNode(' '))
	}
	const titleLink = document.createElement('a')
	titleLink.setAttribute('href', vars.link)
	titleLink.innerText = vars.title
	title.classList.add('podcast-player__title')
	title.appendChild(titleLink)
	textWrapper.appendChild(title)


	if (vars?.explicit) {
		const explicitTag = document.createElement('span')
		explicitTag.innerText = 'Explicit'
		explicitTag.classList.add('podcast-player__explicit-tag')
		title.appendChild(explicitTag)
	}

	const date = document.createElement('div')
	date.classList.add('podcast-player__date')
	date.innerText = vars.date.toLocaleString(navigator.language)
	textWrapper.appendChild(date)

	if (vars?.tags?.length > 0) {
		const tagWrapper = document.createElement('p')
		for (tag of vars.tags) {
			const tagElement = document.createElement('span')
			tagElement.classList.add('podcast-player__tag')
			tagElement.innerText = tag
			tagWrapper.appendChild(tagElement)
			tagWrapper.appendChild(document.createTextNode(' '))
		}
		textWrapper.appendChild(tagWrapper)
	}

	if (vars?.audio?.type && vars?.audio?.url) {
		const player = document.createElement('audio')
		player.setAttribute('src', vars.audio.url)
		player.setAttribute('type', vars.audio.type)
		player.setAttribute('controls', true)
		player.classList.add('podcast-player__player')
		wrapper.appendChild(player)
	}

	textWrapper.appendChild(vars.content)
	
	return wrapper
}

export { podcastPlayer }