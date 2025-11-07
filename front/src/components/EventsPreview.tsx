"use client";

import { useEffect, useState } from "react";
import HorizontalScroller from "./HorizontalScroller";
import EventPreviewCard from "./eventPreviewCard";
import Link from "next/link";
import axios from "axios";

export default function EventsPreview() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/vacancy`);
        const raw = res.data?.data ?? res.data ?? [];

        if (Array.isArray(raw) && raw.length > 0) {
          const mapped = raw.map((e: any) => ({
            id: String(e.id ?? e._id ?? `event-${Math.random()}`),
            name: e.name ?? e.organizer ?? "Organizador",
            event: e.event ?? e.title ?? e.name ?? "Evento",
            image: e.image ?? e.eventImage ?? e.urlImage ?? "/default-event.jpg",
            date: e.date ? new Date(e.date) : e.eventDate ? new Date(e.eventDate) : new Date(),
          }));
          setEvents(mapped);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error("Error fetching events:", err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div>
      <h1 className="text-txt1 font-bold text-center text-3xl text-shadow-md mb-4 mt-16">
        ¡Participa en eventos creados por las mismas bandas!
      </h1>

      <div className="mx-auto max-w-[83%] rounded-4xl py-1.5 px-2">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-b-4 border-tur1" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-md text-txt2">No se encontraron eventos.</div>
        ) : (
          <HorizontalScroller>
            {events.map((ev) => (
              <Link
                href={`/event/${ev.id}`}
                key={ev.id}
                className="shrink-0 w-64 flex justify-center snap-start"
              >
                <EventPreviewCard
                  name={ev.name}
                  event={ev.event}
                  image={ev.image}
                  date={ev.date}
                />
              </Link>
            ))}
          </HorizontalScroller>
        )}
      </div>
    </div>
  );
}