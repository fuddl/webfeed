import { requreStylesheet } from './../style.mjs'


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

	wrapper.appendChild(vars.description)
	

	if (vars.image) {
		const image = document.createElement('img')
		image.setAttribute('src', vars.image)
		wrapper.appendChild(image)
	}
	return wrapper
}

export { article }