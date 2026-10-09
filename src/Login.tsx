import { useState, type FormEvent } from 'react'
import { call } from './api'
import { useStore } from './store'

export default function Login() {
  const login = useStore((s) => s.login)
  const [idInstance, setId] = useState('')
  const [apiTokenInstance, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const creds = { idInstance: idInstance.trim(), apiTokenInstance: apiTokenInstance.trim() }
    try {
      const { stateInstance } = await call<{ stateInstance: string }>(creds, 'getStateInstance')
      if (stateInstance !== 'authorized') throw new Error(`Instance state: ${stateInstance}`)
      await call(creds, 'setSettings', { body: { webhookUrl: '', incomingWebhook: 'yes', outgoingMessageWebhook: 'yes', outgoingWebhook: 'yes', stateWebhook: 'yes' } })
      login(creds)
    } catch (err) {
      setError((err as Error).message)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen grid place-items-center bg-base-200">
      <form onSubmit={submit} className="card w-96 bg-base-100 shadow-xl p-8 gap-4">
        <h1 className="text-2xl font-bold">MAX Chat</h1>
        <input className="input w-full" placeholder="idInstance" required value={idInstance} onChange={(e) => setId(e.target.value)} />
        <input className="input w-full" placeholder="apiTokenInstance" type="password" required value={apiTokenInstance} onChange={(e) => setToken(e.target.value)} />
        {error && <div role="alert" className="alert alert-error text-sm break-all">{error}</div>}
        <button className="btn btn-primary" disabled={loading}>
          {loading && <span className="loading loading-spinner" />}Войти
        </button>
      </form>
    </div>
  )
}
