'use client'

import { useSyncExternalStore } from 'react'

const utcFormat = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'UTC',
})

const subscribe = () => () => {}

export default function LocalTime({ value }) {
  // false while the server renders, true once the browser has taken over
  const isBrowser = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  )

  const date = new Date(value)
  const text = isBrowser
    ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(date)
    : `${utcFormat.format(date)} UTC`

  return <time dateTime={date.toISOString()}>{text}</time>
}