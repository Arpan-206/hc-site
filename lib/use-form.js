import { useState, useEffect } from 'react'

const useForm = (
  submitURL = '/',
  callback,
  options = { clearOnSubmit: 5000, method: 'POST', initData: {} }
) => {
  const [status, setStatus] = useState('default')
  const [data, setData] = useState({ ...options.initData })
  const [touched, setTouched] = useState({})

  const onFieldChange = (e, name, type) => {
    e.persist()
    const value = e.target[type === 'checkbox' ? 'checked' : 'value']
    setData(data => ({ ...options.initData, ...data, [name]: value }))
  }

  useEffect(() => {
    setTouched(Object.keys(data))
  }, [data])

  const useField = (name, type = 'text', ...props) => {
    const checkbox = type === 'checkbox'
    const empty = checkbox ? false : ''
    const onChange = e => onFieldChange(e, name, type)
    const value = data[name] || options.initData[name]
    return {
      name,
      type: name === 'email' ? 'email' : type,
      [checkbox ? 'checked' : 'value']: value || empty,
      onChange,
      ...props
    }
  }

  const { method = 'POST' } = options
  const action = submitURL

  const onSubmit = e => {
    e.preventDefault()
    setStatus('submitting')
    fetch(action, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
      .then(async r => {
        const response = await r.json()
        if (r.ok) {
          setStatus('success')
          if (callback) callback(r)
          if (options.clearOnSubmit) {
            setTimeout(() => {
              setData({});
              setStatus('default');
            }, options.clearOnSubmit);
          } else {
            setTimeout(() => {
              setData({});
              setStatus('default')
            }, 3500)
          }
        } else {
          setStatus('error')
          console.error(response)
        }
      })
      .catch(e => {
        console.error(e)
        setStatus('error')
      })
  }

  const formProps = { onSubmit }

  return { status, data, touched, useField, formProps }
}

export default useForm
