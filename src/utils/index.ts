import { format, parseISO } from 'date-fns'

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'MMM dd, yyyy')
}

export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, 'MMM dd, yyyy HH:mm')
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'confirmed':
    case 'paid':
    case 'in_stock':
      return 'bg-green-100 text-green-800'
    case 'inactive':
    case 'cancelled':
    case 'discharged':
    case 'out_of_stock':
    case 'expired':
      return 'bg-red-100 text-red-800'
    case 'pending':
    case 'scheduled':
      return 'bg-yellow-100 text-yellow-800'
    case 'completed':
      return 'bg-blue-100 text-blue-800'
    case 'low_stock':
      return 'bg-orange-100 text-orange-800'
    case 'on_leave':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export const getStatusBadge = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
    case 'confirmed':
    case 'paid':
    case 'in_stock':
      return 'bg-green-500'
    case 'inactive':
    case 'cancelled':
    case 'discharged':
    case 'out_of_stock':
    case 'expired':
      return 'bg-red-500'
    case 'pending':
    case 'scheduled':
      return 'bg-yellow-500'
    case 'completed':
      return 'bg-blue-500'
    case 'low_stock':
      return 'bg-orange-500'
    case 'on_leave':
      return 'bg-purple-500'
    default:
      return 'bg-gray-500'
  }
}

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

export const calculateAge = (dateOfBirth: string): number => {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substr(0, maxLength) + '...'
}

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{1})(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `+${match[1]}-${match[2]}-${match[3]}-${match[4]}`
  }
  return phone
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}