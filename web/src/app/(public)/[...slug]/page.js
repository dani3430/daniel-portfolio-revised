import { notFound } from 'next/navigation'

// Catches every address that no other page handles and shows the 404 page
export default function CatchAllPage() {
  notFound()
}