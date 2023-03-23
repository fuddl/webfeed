import { requreStylesheet } from './../style.mjs'


const podcastPlayer = (vars) => {
	requreStylesheet('sidebar/components/podcastPlayer/podcastPlayer.css')

	const wrapper = document.createElement('section')
	wrapper.classList.add('podcast-player')
	const textWrapper = document.createElement('div')
	wrapper.appendChild(textWrapper)

	if (vars?.itunesImages) {
		for (itunesImage of vars.itunesImages) {
			const image = document.createElement('img')
			image.setAttribute('src', itunesImage.href)
			image.setAttribute('loading', 'lazy')
			image.classList.add('podcast-player__cover')
			wrapper.classList.add('podcast-player--has-cover')
			wrapper.appendChild(image)
		}
	}

	const title = document.createElement('h2')
	const titleLink = document.createElement('a')
	titleLink.setAttribute('href', vars.link)
	titleLink.innerText = vars.title
	title.classList.add('podcast-player__title')
	title.appendChild(titleLink)
	textWrapper.appendChild(title)

	const date = document.createElement('div')
	date.classList.add('podcast__date')
	date.innerText = vars.date.toLocaleString(navigator.language)
	textWrapper.appendChild(date)


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

	if (vars?.iTunesSummary) {
		textWrapper.appendChild(vars.iTunesSummary)
	} else if (vars?.content) {
		textWrapper.appendChild(vars.content)
	} else if (vars?.description) {
		textWrapper.appendChild(vars.description)
	}
	
	return wrapper
}

export { podcastPlayer }