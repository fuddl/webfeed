const feeds = JSON.parse(decodeURIComponent(document.location.search.substring(1)))


const feedsByLang = {}
for (const feed of feeds) {
	let lang = feed?.lang ?? 'und'
	if (!feedsByLang?.[lang]) {
		feedsByLang[lang] = []
	}
	feedsByLang[lang].push(feed)
}

for (const lang of Object.keys(feedsByLang)) {
	for (const feed of feedsByLang[lang]) {
		let targetSelector = 'feed-list-other-lang'
		if (navigator.languages.includes(lang)) {
			targetSelector = 'feed-list-preferred-lang'
		} else if (lang === 'und') {
			targetSelector = 'feed-list-unknown-lang'
		}
		const target = document.getElementById(targetSelector)
		
		const listItem = document.createElement('div')
		listItem.classList.add('panel-list-item')
		const itemText = document.createElement('div')
		itemText.classList.add('text')
		let title = (feed?.title ?? feed.href).trim()
		itemText.innerText = title.length > 62 ? `${title.substring(0, 62).trim()}…` : title
		
		listItem.appendChild(itemText)
		target.appendChild(listItem)
		target.removeAttribute('hidden')

		listItem.addEventListener('click', () => {
			window.open(feed.href)
		})

	}
}