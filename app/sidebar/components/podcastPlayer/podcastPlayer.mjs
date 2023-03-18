import { requreStylesheet } from './../style.mjs'


const podcastPlayer = (vars) => {
	requreStylesheet('sidebar/components/podcastPlayer/podcastPlayer.css')

	const wrapper = document.createElement('section')
	wrapper.classList.add('podcast-player')

	const title = document.createElement('h2')
	const titleLink = document.createElement('a')
	titleLink.setAttribute('href', vars.link)
	titleLink.innerText = vars.title
	title.classList.add('podcast-player__title')
	title.appendChild(titleLink)
	wrapper.appendChild(title)

	for (const audio of vars.audios) {
		if (audio?.type && audio?.url) {
			const player = document.createElement('audio')
			player.setAttribute('src', audio.url)
			player.setAttribute('type', audio.type)
			player.setAttribute('controls', true)
			player.classList.add('podcast-player__player')
			wrapper.appendChild(player)
		}
	}

	if (vars.image) {
		const image = document.createElement('img')
		image.setAttribute('src', vars.image)
		wrapper.appendChild(image)
	}

	if (vars?.content) {
		wrapper.appendChild(vars.content)
	} else if (vars?.description) {
		wrapper.appendChild(vars.description)
	}
	
	if (vars?.tags?.length > 0) {
		const tagWrapper = document.createElement('p')
		for (tag of vars.tags) {
			const tagElement = document.createElement('span')
			tagElement.classList.add('podcast-player__tag')
			tagElement.innerText = tag
			tagWrapper.appendChild(tagElement)
			tagWrapper.appendChild(document.createTextNode(' '))
		}
		wrapper.appendChild(tagWrapper)
	}

	return wrapper
}

export { podcastPlayer }