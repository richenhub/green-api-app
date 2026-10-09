import { useEffect, useRef, useState, type FormEvent } from 'react'
import { call, toChatId } from './api'
import { useStore } from './store'

type Notification = {
  receiptId: number
  body: {
    typeWebhook: string
    idMessage: string
    timestamp: number
    senderData?: { chatId: string; senderName?: string; senderPhoneNumber?: number }
    messageData?: { textMessageData?: { textMessage: string } }
  }
} | null

export default function Chat() {
  const { creds, chats, titles, active, open, add, logout } = useStore()
  const label = (id: string) => titles[id] ?? `+${id.split('@')[0]}`
  const [phone, setPhone] = useState('')
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const bottom = useRef<HTMLDivElement>(null)
  const messages = active ? chats[active] ?? [] : []

  useEffect(() => {
    let stop = false
    const poll = async () => {
      while (!stop) {
        try {
          const n = await call<Notification>(creds!, 'receiveNotification?receiveTimeout=5')
          if (!n) continue
          const { body } = n
          const t = body.messageData?.textMessageData?.textMessage
          const out = body.typeWebhook === 'outgoingMessageReceived'
          if ((out || body.typeWebhook === 'incomingMessageReceived') && t && body.senderData) {
            const { chatId, senderPhoneNumber } = body.senderData
            const byPhone = `${senderPhoneNumber}@c.us`
            add(!out && useStore.getState().chats[byPhone] ? byPhone : chatId, { id: body.idMessage, text: t, out, time: body.timestamp * 1000 }, out ? undefined : body.senderData.senderName)
          }
          await call(creds!, `deleteNotification/${n.receiptId}`, { method: 'DELETE' })
        } catch {
          await new Promise((r) => setTimeout(r, 3000))
        }
      }
    }
    poll()
    return () => {
      stop = true
    }
  }, [creds, add])

  useEffect(() => {
    bottom.current?.scrollIntoView()
  }, [messages.length, active])

  const newChat = async (e: FormEvent) => {
    e.preventDefault()
    const digits = phone.replace(/\D/g, '')
    if (!digits) return
    setPhone('')
    const found = await call<{ chatId?: string }>(creds!, 'checkAccount', { body: { phoneNumber: Number(digits) } }).catch(() => null)
    open(found?.chatId ?? toChatId(digits), `+${digits}`)
  }

  const send = async (e: FormEvent) => {
    e.preventDefault()
    if (!active || !text.trim()) return
    try {
      const { idMessage } = await call<{ idMessage: string }>(creds!, 'sendMessage', { body: { chatId: active, message: text } })
      add(active, { id: idMessage, text, out: true, time: Date.now() })
      setText('')
      setError('')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <div className="h-screen flex">
      <aside className="w-80 border-r border-base-300 flex flex-col">
        <form onSubmit={newChat} className="p-3 flex gap-2">
          <input className="input input-sm flex-1" placeholder="Номер: 79991234567" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button className="btn btn-sm btn-primary">+</button>
        </form>
        <ul className="menu flex-1 overflow-y-auto w-full">
          {Object.keys(chats).map((id) => (
            <li key={id}>
              <a className={id === active ? 'menu-active' : ''} onClick={() => open(id)}>{label(id)}</a>
            </li>
          ))}
        </ul>
        <button className="btn btn-ghost btn-sm m-3" onClick={logout}>Выйти</button>
      </aside>
      <main className="flex-1 flex flex-col bg-base-200">
        {active ? (
          <>
            <header className="p-4 bg-base-100 font-semibold">{label(active)}</header>
            <div className="flex-1 overflow-y-auto p-4">
              {messages.map((m) => (
                <div key={m.id} className={`chat ${m.out ? 'chat-end' : 'chat-start'}`}>
                  <div className={`chat-bubble ${m.out ? 'chat-bubble-primary' : ''}`}>{m.text}</div>
                  <time className="chat-footer opacity-50 text-xs">{new Date(m.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time>
                </div>
              ))}
              <div ref={bottom} />
            </div>
            {error && <div role="alert" className="alert alert-error text-sm mx-4 break-all">{error}</div>}
            <form onSubmit={send} className="p-3 bg-base-100 flex gap-2">
              <input className="input flex-1" placeholder="Сообщение" value={text} onChange={(e) => setText(e.target.value)} />
              <button className="btn btn-primary">Отправить</button>
            </form>
          </>
        ) : (
          <div className="m-auto opacity-50">Введите номер и создайте чат</div>
        )}
      </main>
    </div>
  )
}
