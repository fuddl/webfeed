import { displayFeed } from './sidebar/feed.mjs'
import { requreStylesheet } from './sidebar/components/style.mjs'

const checkForFeeds = () => {
	const feeds = []
	for (const link of document.querySelectorAll('[href]:is([type="application/rss+xml"], [type="application/atom+xml"])')) {
		feeds.push({
			href: link.href,
			title: link.getAttribute('title'),
			type: link.getAttribute('type'),
			lang: link.getAttribute('hreflang'),
		})
	}
	if (Object.entries(feeds).length > 0) {
		(async () => {
			await browser.runtime.sendMessage({
				type: 'foundFeeds',
				feeds: feeds,
			})
		})()
	}
}

addEventListener('DOMContentLoaded', checkForFeeds)

chrome.runtime.sendMessage({
    message: 'QUERY_XML'
}, async (type) => {
    if (type !== 'XML') return;
	const pre = document.querySelector('pre');
    if (!pre) return;

    try {
        const dom = new window.DOMParser().parseFromString(pre.innerText, "text/xml")
        pre.parentNode.removeChild(pre)
        requreStylesheet('sidebar/base.css')
        displayFeed(dom)
    } catch (e) {
        console.error(e);
    }
});

addEventListener('popstate', checkForFeeds);

const observer = new MutationObserver(checkForFeeds)

observer.observe(document.head, {
	childList: true
})

