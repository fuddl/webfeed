import { status } from './components/status/status.mjs'
import { article } from './components/article/article.mjs'
import { definitionList } from './components/definitionList/definitionList.mjs'
import { podcastPlayer } from './components/podcastPlayer/podcastPlayer.mjs'
import { makeRichText } from './richText.mjs'

const nsAliases = {
	'http://www.w3.org/2005/Atom': 'atom',
	'http://www.sitemaps.org/schemas/sitemap/0.9': 'sitemap',
	'http://purl.org/atompub/rank/1.0': 'rank',
	'http://purl.org/rss/1.0/modules/content': 'content',
	'http://search.yahoo.com/mrss': 'media', 
	'http://purl.org/dc/elements/1.1': 'dc', 
}

function getShortNamesspace(node) {
	const uri = node?.namespaceURI?.replace(/\/$/, '')
	if (uri) {
		if (uri in nsAliases) {
			return nsAliases[uri]
		} else {
			return uri
		}
	} else {
		return node.ownerDocument.documentElement.localName
	}
}

const types = {
	'rss__title': {
		processer: 'plain',
		label: 'Title',
	},
	'rss__pubDate': {
		processer: 'date',
		label: 'Publication date',
	},
	'rss__description': {
		processer: 'rich',
		label: 'Description',
	},
	'rss__guid': {
		processer: 'plain',
		label: 'Universally unique identifier',
	},
	'atom__id': {
		processer: 'plain',
		label: 'Identifier',
	},
	'atom__published': {
		processer: 'date',
		label: 'Publication date',
	},
	'atom__updated': {
		processer: 'date',
		label: 'Last update date',
	},
	'atom__title': {
		processer: 'plain',
		label: 'Title',
	},
	'rss__category': {
		processer: 'plain',
		label: 'Category',
		multiple: true,
	},
	'atom__link': {
		processer: 'href',
		label: 'Link',
	},
	'rss__link': {
		processer: 'url',
		label: 'Link',
	},
	'rss__comments': {
		processer: 'url',
		label: 'Comments link',
	},
	'atom__summary': {
		processer: 'rich',
		label: 'Summary',
	},
	'atom__author': {
		label: 'Author',
		properties: {
			name: {
				processer: 'plain',
				label: 'Author name',
			},
			uri: {
				processer: 'url',
				label: 'Author URI',
			}
		}
	},
	'sitemap__priority': {
		processer: 'float',
		label: 'Priority',
	},
	'rank__rank': {
		processer: 'int',
		label: 'Rank',
	},
	'atom__content': {
		processer: 'rich', 
		label: 'Content',
	},
	'content__encoded': {
		processer: 'rich', 
		label: 'Content',
	},
	'media__content': {
		processer: 'url+type',
		label: 'Media',
		multiple: true,
		properties: {
			description: {
				processer: 'plain',
				label: 'Media Description',
			},
		}
	},
	'dc__creator': {
		processer: 'plain',
		label: 'Creator',
	}
}

const getData = (element, type, parent = null) => {
	let value
	let processer

	if (parent) {
		processer = type?.[parent]?.processer
	} else {
		processer = type?.processer
	}
	if (processer) {
		switch (processer) {
			case 'date':
				value = new Date(element.textContent) 

				if (isNaN(value)) {
					return false
				}
				return value
			case 'plain':
				return element.textContent
			case 'href':
				try {
					value = new URL(element.getAttribute('href'))
				} catch (e) {
					return false
				}
				return value
			case 'url':
				try {
					value = new URL(element.textContent)
				} catch (e) {
					return false
				}
				return value
			case 'rich':
				return makeRichText(element.textContent)
			case 'float':
				return parseFloat(element.textContent)
			case 'int':
				return parseInt(element.textContent)
			case 'url+type':
				return {
					url: element.getAttribute('url'),
					type: element.getAttribute('type'),
				}
		}
	} else {
		const output = {}
		for (const child of element.childNodes) {
			if (child?.tagName && type?.properties?.hasOwnProperty(child.tagName)) {
				output[child.tagName] = getData(child, type.properties[child.tagName], parent)
			}
		}
		return output
	}
}

const generateItem = (item) => {
	const data = {}
	for (const child of item.childNodes) {
		const ns = getShortNamesspace(child)
		if (child?.localName && ns) {
			const type = `${ns}__${child?.localName}`
			if (type in types) {
				if (types[type]?.multiple) {
					if (!data.hasOwnProperty(type)) {
						data[type] = []
					}
					data[type].push(getData(child, types[type]))
				} else {
					data[type] = getData(child, types[type])
				}
			} else {
				console.debug(type)
			}
		}
	}	


	//console.debug(data)

	// if (data?.audios?.length > 0) {
	// 	return podcastPlayer(data)
	// }

	if ((data?.rss__title || data?.atom__title) && (data?.rss__description || data?.atom__summary || data?.atom__content || data?.content__encoded)) {
		return article({
			title: data.rss__title || data?.atom__title,
			description: data?.content__encoded || data?.rss__description || data?.atom__summary || data?.atom__content,
			tags: data?.rss__category,
			creator: data?.dc__creator,
		})
	}


	if (data?.rss__description && data?.rss__pubDate) {
		return status({
			date: data.rss__pubDate,
			description: data.rss__description,
			images: data?.media__content,
		})
	}

	return definitionList(data, types)
}


export { generateItem }