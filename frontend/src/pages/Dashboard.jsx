import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getContacts } from "@/services/contacts";

const cards = [
  {
    title: "Campaigns",
    value: "0",
  },
  {
    title: "Emails Sent",
    value: "0",
  },
  {
    title: "Backend",
    value: "Healthy",
  },
];

export default function Dashboard() {
  const [contactCount, setContactCount] = useState(0);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const data = await getContacts();

        setContactCount(data.length);
      } catch (error) {
        console.error("Failed to fetch contacts:", error);
      }
    };

    fetchContacts();
  }, []);

  return (
    <>
      <h1 className="mb-6 text-4xl font-bold">
        Welcome Back 👋
      </h1>

      <div className="grid grid-cols-4 gap-6">

        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
          </CardHeader>

          <CardContent>
            <h2 className="text-3xl font-bold">
              {contactCount}
            </h2>
          </CardContent>
        </Card>

        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>

            <CardContent>
              <h2 className="text-3xl font-bold">
                {card.value}
              </h2>
            </CardContent>
          </Card>
        ))}

      </div>
    </>
  );
}


