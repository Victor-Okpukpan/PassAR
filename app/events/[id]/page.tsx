/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata, ResolvingMetadata } from "next"
import { dryrun } from "@permaweb/aoconnect"
import EventDetailsClient from "./event-details-client"

type Props = {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: Props, parent: ResolvingMetadata): Promise<Metadata> {
  const id = params.id

  const result = await dryrun({
    process: "yr6ytHmqw_WSOnDZSNjyin6D0SSt2LvlKEB4dYqOabg",
    tags: [{ name: "Action", value: "GetEvents" }],
  })

  const allEvents = result.Messages[0].Tags[4].value.map((event: any) => ({
    ...event,
    active: event.active === "true",
  }))

  const event = allEvents.find((e: any) => e.id.toString() === id)

  if (!event) {
    return {
      title: "Event Not Found",
    }
  }

  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: [
        {
          url: event.image,
          width: 1200,
          height: 630,
          alt: event.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: event.description,
      images: [event.image],
    },
  }
}

export default function EventDetailsPage({ params }: { params: { id: number } }) {
  return <EventDetailsClient params={params} />
}

export async function generateStaticParams() {
  try {
    const result = await dryrun({
      process: "yr6ytHmqw_WSOnDZSNjyin6D0SSt2LvlKEB4dYqOabg",
      tags: [{ name: "Action", value: "GetEvents" }],
    })

    const allEvents = result.Messages[0].Tags[4].value.map((event: any) => ({
      ...event,
      active: event.active === "true",
    }))

    return allEvents.map((event: any) => ({
      id: event.id.toString(),
    }))
  } catch (error) {
    console.error("Error fetching events for static params:", error)
    return []
  }
}

