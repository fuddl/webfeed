import { requreStylesheet } from './../style.mjs'
import { getTextColorsFromImage } from './../../image-colours.mjs'


const tube = (data) => {
  requreStylesheet('sidebar/components/tube/tube.css')
  
  const wrapper = document.createElement('div')
  wrapper.classList.add('tube')

  const poster = document.createElement('a')
  poster.setAttribute('href', data.link)
  poster.classList.add('tube__poster')

  const title = document.createElement('h2')
  title.innerText = data.title
  title.classList.add('tube__title')
  poster.appendChild(title)


  const posterMain = document.createElement('img')
  poster.appendChild(posterMain)
  posterMain.setAttribute('src', `https://img.youtube.com/vi/${data.id}/default.jpg`)
  posterMain.setAttribute('hidden', 'hidden')
  //posterMain.setAttribute('src', `https://img.youtube.com/vi/${data.id}/maxresdefault.jpg`)
  
  getTextColorsFromImage(posterMain, (bestContrast) => {
    poster.style.setProperty("--poster-bg", `#${bestContrast.background.map(x => x.toString(16).padStart(2, '0')).join('')}`);
    poster.style.setProperty("--poster-color", `#${bestContrast.color.map(x => x.toString(16).padStart(2, '0')).join('')}`);
  })
  wrapper.appendChild(poster)

  poster.addEventListener('click', (e) => {
    e.preventDefault()
    const embedd = document.createElement('iframe')
    embedd.setAttribute('src', `https://www.youtube-nocookie.com/embed/${data.id}?autoplay=1`)

    embedd.style.width = '100%'
    embedd.style.aspectRatio = '16/9'

    wrapper.replaceChild(embedd, poster)
  })

  return wrapper
}

export { tube }