import MainLayout from "@/layouts/MainLayout";

export default function Dashboard() {
  return (
    <MainLayout>
      <div className="rounded-xl bg-white p-8 shadow">
        <h1 className="text-3xl font-bold">
          Welcome to MailFlow 🚀
        </h1>

        <p className="mt-4 text-slate-600">
          Your email campaign platform is ready.
        </p>
      </div>
    </MainLayout>
  );
}