export type Role = 'founder' | 'manager' | 'am' | 'creator'

export interface User {
  id: string
  email: string
  name: string
  role: Role
}

export const DEMO_USERS: User[] = [
  { id: '1', email: 'viren@thenewthing.in', name: 'Viren Noronha', role: 'founder' },
  { id: '2', email: 'am@thenewthing.in', name: 'Rohan Mehta', role: 'am' },
  { id: '3', email: 'creative@thenewthing.in', name: 'Ananya Sharma', role: 'creator' },
]

const STORAGE_KEY = 'tnt_os_user'

export function checkEmail(email: string): 'found' | 'not_found' | 'invalid' {
  const trimmed = email.trim()
  if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'invalid'
  const exists = DEMO_USERS.some((u) => u.email.toLowerCase() === trimmed.toLowerCase())
  return exists ? 'found' : 'not_found'
}

export function login(email: string, password: string): User | null {
  if (password !== 'demo') return null
  const normalized = email.trim().toLowerCase()
  const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === normalized)
  const user: User =
    matched ?? {
      id: 'guest',
      email: normalized || 'guest@thenewthing.in',
      name: 'Guest User',
      role: 'founder',
    }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  return user
}

export function loginAsRole(role: Role): User {
  const matched =
    DEMO_USERS.find((u) => u.role === role) ??
    ({
      id: 'guest',
      email: 'guest@thenewthing.in',
      name: 'Guest User',
      role,
    } as User)
  const user: User = { ...matched, role }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  return user
}

export function logout(): void {
  localStorage.removeItem(STORAGE_KEY)
}

export function getCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as User
  } catch {
    return null
  }
}

export function switchRole(role: Role): void {
  const current = getCurrentUser()
  if (!current) return
  const updated: User = { ...current, role }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
}

export const ROLE_LABELS: Record<Role, string> = {
  founder: 'Founder',
  manager: 'Manager',
  am: 'Account Manager',
  creator: 'Creator',
}
