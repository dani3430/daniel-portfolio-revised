'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { getSql } from '@/lib/db'

const ALLOWED_STATUSES = ['unread', 'read', 'archived']

// Message ids are numbers only. Anything else is rejected.
function readId(formData) {
  const id = String(formData.get('id') ?? '')
  return /^\d{1,18}$/.test(id) ? id : null
}

export async function setMessageStatusAction(formData) {
  await requireAdmin()

  const id = readId(formData)
  const status = String(formData.get('status') ?? '')
  if (!id || !ALLOWED_STATUSES.includes(status)) return

  await getSql()`UPDATE messages SET status = ${status} WHERE id = ${id}`

  // Refreshes the unread number in the navigation bar
  revalidatePath('/admin', 'layout')

  // After archiving or marking unread, go back to the list
  if (status === 'archived' || status === 'unread') redirect('/admin/messages')
}

export async function deleteMessageAction(formData) {
  await requireAdmin()

  const id = readId(formData)
  if (!id) return

  await getSql()`DELETE FROM messages WHERE id = ${id}`

  revalidatePath('/admin', 'layout')
  redirect('/admin/messages')
}