import { requreStylesheet } from './../style.mjs'


const nexus = (vars) => {
	requreStylesheet('sidebar/components/nexus/nexus.css')

	const wrapper = document.createElement('a')
	wrapper.classList.add('nexus')
	wrapper.setAttribute('href', vars.link)

	wrapper.innerText = vars.title

	return wrapper
}

export { nexus }