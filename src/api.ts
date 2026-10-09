export type Creds = { idInstance: string; apiTokenInstance: string }

export async function call<T>(c: Creds, path: string, init?: { body?: object; method?: string }): Promise<T> {
  const [name, query] = path.split('?')
  const [method, ...rest] = name.split('/')
  const url = [`https://${c.idInstance.slice(0, 4)}.api.green-api.com/waInstance${c.idInstance}/${method}/${c.apiTokenInstance}`, ...rest].join('/')
  const res = await fetch(query ? `${url}?${query}` : url, {
    method: init?.method ?? (init?.body ? 'POST' : 'GET'),
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
    body: init?.body && JSON.stringify(init.body),
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
  const text = await res.text()
  return text ? JSON.parse(text) : (null as T)
}

export const toChatId = (phone: string) => `${phone.replace(/\D/g, '')}@c.us`
