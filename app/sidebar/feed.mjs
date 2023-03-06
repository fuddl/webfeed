import { generateHeader } from './header.mjs'
import { generateItem } from './item.mjs'

const displayFeed = (dom) => {
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
