export const useApi = () => {
  const { public: { apiBase } } = useRuntimeConfig()
  const token = useCookie('token')

  const req = (method: string, url: string, body?: any) =>
    $fetch(`${apiBase}${url}`, {
      method,
      body,
      headers: token.value
        ? { Authorization: `Bearer ${token.value}` }
        : {}
    })

  return {
    get:  (url: string) => req('GET', url),
    post: (url: string, body: any) => req('POST', url, body),
    put:  (url: string, body: any) => req('PUT', url, body),
    del:  (url: string) => req('DELETE', url)
  }
}
