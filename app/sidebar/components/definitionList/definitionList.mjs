const definitionList = (data, types) => {
  const wrapper = document.createElement('dl')
  
  const keyValue = (key, value, subtypes) => {
    const output = new DocumentFragment
    const dt = document.createElement('dt')
    dt.innerText = subtypes?.[key]?.label ?? key
    output.appendChild(dt)
    const dd = document.createElement('dd')

    switch (typeof value) {
      case 'string':
        dd.innerText = value
        break
      case 'object':
        if (value instanceof Date) {
          dd.innerText = data[key].toLocaleDateString()
          break
        } else if (value instanceof URL) {
          let link = document.createElement('a')
          link.innerText = value.href
          link.setAttribute('href', value.href)
          dd.appendChild(link)
          break
        } else if (value instanceof DocumentFragment) {
          dd.appendChild(value)
          break
        } else {
          for (const subkey in value) {
            dd.appendChild(keyValue(subkey, value[subkey], types[key].properties))
          }
        }
      break
    }

    output.appendChild(dd)

    return output

  }

  for (const key in data) {
    if (types?.[key]?.label) {
      const pair = keyValue(key, data[key], types)

      wrapper.appendChild(pair)

    }
  }
  return wrapper
}

export { definitionList }