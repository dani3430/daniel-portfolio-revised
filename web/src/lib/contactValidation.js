// A phone number must start with "+" and a country code, then 8 to 15 digits in total
export function isValidPhone(value) {
  const cleaned = value.replace(/[\s\-().]/g, '')
  return /^\+[1-9]\d{7,14}$/.test(cleaned)
}

// Cleans and checks the contact form data. Returns the cleaned values and any errors.
export function validateContact(input) {
  const clean = {
    name: String(input?.name ?? '').trim(),
    email: String(input?.email ?? '').trim(),
    subject: String(input?.subject ?? '').trim(),
    phone: String(input?.phone ?? '').trim(),
    company: String(input?.company ?? '').trim(),
    message: String(input?.message ?? '').trim(),
  }

  const errors = {}

  if (clean.name.length < 2 || clean.name.length > 100) {
    errors.name = 'Please enter your full name.'
  }
  if (clean.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean.email)) {
    errors.email = 'Please enter a valid email address.'
  }
  if (clean.subject.length < 3 || clean.subject.length > 150) {
    errors.subject = 'Please enter a short subject.'
  }
  if (clean.phone && (clean.phone.length > 25 || !isValidPhone(clean.phone))) {
    errors.phone = 'Please enter a valid number with your country code.'
  }
  if (clean.company.length > 100) {
    errors.company = 'Company name is too long.'
  }
  if (clean.message.length < 10 || clean.message.length > 2000) {
    errors.message = 'Your message must be between 10 and 2000 characters.'
  }

  return { clean, errors }
}