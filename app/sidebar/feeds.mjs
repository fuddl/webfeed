import { displayFeed } from './feed.mjs'

const feeds = JSON.parse(decodeURIComponent(document.location.search.substring(1)))

const feedsKeys = Object.keys(feeds)

for (const key of feedsKeys) {
	(async () => {
		const response = await fetch(feeds[key].href, {
			headers: {
				'Content-Type': feeds[key].type,
			}
		})
		const xml = await response.text()
		const dom = new window.DOMParser().parseFromString(xml, "text/xml")
		
		displayFeed(dom)
	})()
}