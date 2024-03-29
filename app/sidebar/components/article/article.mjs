import { requreStylesheet } from './../style.mjs'
import TurndownService from '../../../../node_modules/turndown/lib/turndown.es.js'


const article = (vars) => {
	requreStylesheet('sidebar/components/article/article.css')

	const wrapper = document.createElement('section')
	wrapper.classList.add('article')

	const title = document.createElement('h2')
	const titleLink = document.createElement('a')
	titleLink.setAttribute('href', vars.link)
	titleLink.innerText = vars.title
	title.classList.add('article__title')
	title.appendChild(titleLink)
	wrapper.appendChild(title)

	if (vars.creator) {
		const creator = document.createElement('p')
		creator.classList.add('article__creator')
		creator.innerText = vars.creator
		wrapper.appendChild(creator)
	}

	if (vars.contributors) {
		const contributors = document.createElement('p')
		contributors.classList.add('article__contributors')
		for (const contributor of vars.contributors) {
			if (contributor?.name && contributor?.url) {
				if (contributors.children.length > 0) {
					contributors.appendChild(document.createTextNode(', '))
				}
				const link = document.createElement('a')
				link.innerText = contributor.name 
				link.setAttribute('href', contributor.url)
				contributors.appendChild(link)
			}
		}
		if (contributors.children.length > 0) {
			wrapper.appendChild(contributors)
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
			tagElement.classList.add('article__tag')
			tagElement.innerText = tag
			tagWrapper.appendChild(tagElement)
			tagWrapper.appendChild(document.createTextNode(' '))
		}
		wrapper.appendChild(tagWrapper)
	}

	if (vars?.comments) {
		const commentLink = document.createElement('a')
		commentLink.classList.add('article__comments')
		commentLink.innerText = '💬 Comments'
		commentLink.setAttribute('href', vars.comments)
		wrapper.appendChild(commentLink)
	}

	const turndownService = new TurndownService({
		headingStyle: 'atx',
		linkStyle: 'referenced',
		linkReferenceStyle: 'shortcut',
	})
	if (vars?.description) {
		const shareLink = document.createElement('a')
		shareLink.classList.add('article__comments')
		shareLink.innerText = '💬 Share'
		shareLink.setAttribute('href', `mailto:?subject=${encodeURIComponent(vars.title)}&body=${encodeURIComponent(turndownService.turndown(wrapper.innerHTML))})`)
		wrapper.appendChild(shareLink)
	}

	return wrapper
}

export { article }