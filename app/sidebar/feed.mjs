import { generateHeader } from './header.mjs'
import { generateItem } from './item.mjs'

const cleanUpSteps = [
	// if the feed as no title and all items have the same title
	(dom) => {
		const feedTitle = dom.querySelector(':root > title')
		if (feedTitle?.textContent === '') {
			const itemTitles = dom.querySelectorAll('entry > title')
			let prevTitle = null
			let allTitlesAreTheSame = true
			for (const itemTitle of itemTitles) {
				if (prevTitle === null) {
					prevTitle = itemTitle.textContent
				} else if (prevTitle !== itemTitle?.textContent) {
					allTitlesAreTheSame = false
				}
			}
			if (allTitlesAreTheSame) {
				feedTitle.textContent = prevTitle
				for (const itemTitle of itemTitles) {
					itemTitle.parentNode.removeChild(itemTitle)
				}
			}
		}
		return dom
	},
]

const enrichSteps = [
	// split title into title and subtitle
	(dom) => {
		const feedTitle = dom.querySelector(':root > title, channel > title')
		const subtitle = dom.querySelector(':root > description, :root > subtitle')?.textContent
		if (!subtitle && feedTitle.textContent) {
			const dividerExpression = /^(.+\D)\s+[\|\--–—―‒⸺]\s+(\D.+)$$/
			if (dividerExpression.test(feedTitle.textContent)) {
				const parts = feedTitle.textContent.match(dividerExpression)
				feedTitle.textContent = parts[1]
				const subtitle = document.createElement('subtitle')
				subtitle.textContent = parts[2]
				feedTitle.parentNode.insertBefore(subtitle, feedTitle)
			}
		}
		return dom
	},
]


function cleanUpFeed(dom) {
	for (const step of cleanUpSteps) {
		dom = step(dom)
	}
	return dom
}

function enrichFeed(dom) {
	for (const step of enrichSteps) {
		dom = step(dom)
	}
	return dom
}


const displayFeed = (dom) => {
	dom = cleanUpFeed(dom)
	dom = enrichFeed(dom)
	const channels = dom.querySelectorAll('channel, feed')
	for (const channel of channels) {
		
		const section = document.createElement('section')
		document.body.appendChild(section)
		
		section.appendChild(generateHeader(channel))

		const items = dom.querySelectorAll('item, entry')
		for (const item of items) {
			section.appendChild(generateItem(item))
		}
	}
}


export { displayFeed }
