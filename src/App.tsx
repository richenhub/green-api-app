import Chat from './Chat'
import Login from './Login'
import { useStore } from './store'

export default function App() {
  const creds = useStore((s) => s.creds)
  return creds ? <Chat /> : <Login />
}
