"use client";
import Events from "@/components/Dashboard/Events";
import Loader from "@/components/Loader";
import { useAllProducts } from "@/hooks/useAllProducts";
import { useEffect, useState } from "react";
import axios from "axios";

const Page = () => {
  const { data: allProducts, isLoading: isLoadingAllProducts } = useAllProducts();
  const [events, setEvents] = useState([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  const fetchEvents = async () => {
    try {
      setIsLoadingEvents(true);
      const res = await axios.get("/api/events");
      setEvents(res.data.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  if (isLoadingAllProducts || isLoadingEvents) {
    return <Loader />;
  }

  return (
    <Events
      allProducts={allProducts || []}
      events={events}
      refreshEvents={fetchEvents}
    />
  );
};

export default Page;
