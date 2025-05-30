"use client";

import { useEffect, useState } from "react";
import CustomerEditForm from "@/components/Dashboard/Customers/CustomerEditForm";
import Loader from "@/components/Loader";

const Page = ({ params }: { params: { customerId: string } }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/user?id=${params.customerId}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!res.ok) {
          setError("Failed to fetch customer data.");
          return;
        }

        const data = await res.json();
        setCustomer(data);
      } catch (error) {
        setError("An error occurred while fetching customer data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [params.customerId]);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!customer) {
    return <div>Customer not found</div>;
  }

  return <CustomerEditForm customer={customer} />;
};

export default Page;
