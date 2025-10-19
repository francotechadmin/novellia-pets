// Date formatting utilities

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatShortDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function calculateAge(birthDateString: string): { years: number; months: number } {
  const birthDate = new Date(birthDateString)
  const today = new Date()

  let years = today.getFullYear() - birthDate.getFullYear()
  let months = today.getMonth() - birthDate.getMonth()

  if (months < 0) {
    years--
    months += 12
  }

  // Adjust if birth day hasn't occurred yet this month
  if (today.getDate() < birthDate.getDate()) {
    months--
    if (months < 0) {
      years--
      months += 12
    }
  }

  return { years, months }
}

export function formatAge(birthDateString: string): string {
  const { years, months } = calculateAge(birthDateString)

  if (years === 0 && months === 0) {
    return 'Less than 1 month'
  }

  if (years === 0) {
    return `${months} ${months === 1 ? 'month' : 'months'}`
  }

  if (months === 0) {
    return `${years} ${years === 1 ? 'year' : 'years'}`
  }

  return `${years} ${years === 1 ? 'year' : 'years'}, ${months} ${months === 1 ? 'month' : 'months'}`
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0]
}
