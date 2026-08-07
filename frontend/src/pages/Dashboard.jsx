import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import MainLayout from "@/layouts/MainLayout";

const cards = [
  {
    title: "Contacts",
    value: "0",
  },
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
  return (
    <MainLayout>

      <h1 className="mb-6 text-4xl font-bold">
        Welcome Back 👋
      </h1>

      <div className="grid grid-cols-4 gap-6">

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

    </MainLayout>
  );
}