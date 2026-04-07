// app/admin/tests/create/page.js
import CreateTestForm from "../../../../components/admin/CreateTestForm";

export default function CreateTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <CreateTestForm />
    </div>
  );
}