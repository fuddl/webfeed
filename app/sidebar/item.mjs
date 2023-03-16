import { status } from './components/status/status.mjs'
import { article } from './components/article/article.mjs'
import { makeRichText } from './richText.mjs'

const generateItem = (item) => {

	const guid = item.querySelector('guid')?.textContent

	const itemImage = item.querySelector('[url]:is([type="image/jpeg"], [type="image/png"])')?.getAttribute('url')

	let pubDate = item.querySelector('pubDate')?.textContent

	let date = pubDate ? new Date(pubDate) : null

	const contributors = []
	const atomContributors = item.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'contributor')
	if (atomContributors.length > 0) {
		for (let atomContributor of atomContributors) {
			contributors.push({
				name: atomContributor.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'name')?.[0]?.textContent,
				url: atomContributor.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'uri')?.[0]?.textContent,
			})
		}
	} else {
		if (item.querySelector('author')) {
			contributors.push({
				name: item.querySelector('author > name')?.textContent,
			})
		}
	}

	const content = document.createDocumentFragment()

	if (item.querySelector('content')?.textContent) {
		content.append(makeRichText(querySelector('content').textContent))
	} else if(item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded').length > 0) {
		content.append(makeRichText(item.getElementsByTagNameNS('http://purl.org/rss/1.0/modules/content/', 'encoded')?.[0]?.textContent))
	}



	const categories = item.querySelectorAll('category')
	const tags = []
	categories.forEach((item) => { tags.push(item.textContent) })

	const data = {
		id: item.querySelector('guid, id')?.textContent,
		image: itemImage,
		date: date,
		title: item.querySelector('title')?.textContent,
		link: item.querySelector('link')?.textContent,
		contributors: contributors,
		tags: tags,
		description:
			item.querySelector('description, summary')?.textContent ?
			makeRichText(item.querySelector('description, summary').textContent) : null,
		content: content,
	}

	if ((data?.description || data?.content) && data?.title) {
		return article(data)
	}

	if (data?.description) {
		return status(data)
	}

	return new DocumentFragment
}


export { generateItem }
