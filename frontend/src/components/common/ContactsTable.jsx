export default function ContactsTable({ contacts }) {
  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b p-6">
        <h2 className="text-xl font-semibold">Contacts</h2>
        <p className="text-sm text-gray-500">
          {contacts.length} contacts in your database
        </p>
      </div>

      {contacts.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No contacts imported yet.
        </div>
      ) : (
        <div className="divide-y">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="px-6 py-4"
            >
              {contact.email}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}