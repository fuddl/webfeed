const feeds = JSON.parse(decodeURIComponent(document.location.search.substring(1)))

const feedWrapper = document.getElementById('feed-list')

for (const feed in feeds) {
	const listItem = document.createElement('div')
	listItem.classList.add('panel-list-item')
	const itemText = document.createElement('div')
	itemText.classList.add('text')
	itemText.innerText = feeds[feed]?.title ?? feeds[feed].href
	
	listItem.appendChild(itemText)
	feedWrapper.appendChild(listItem)

	listItem.addEventListener('click', () => {
		console.debug('asdasdasd')
		window.open(feeds[feed].href)
	})
}
