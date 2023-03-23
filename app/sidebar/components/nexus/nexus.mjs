import { requreStylesheet } from './../style.mjs'


const nexus = (vars) => {
	requreStylesheet('sidebar/components/nexus/nexus.css')

	const wrapper = document.createElement('section')
	wrapper.classList.add('nexus')

	if (vars?.title) {
		wrapper.innerText = vars.title
	}

	return wrapper
}

export { nexus }