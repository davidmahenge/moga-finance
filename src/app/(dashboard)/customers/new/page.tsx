import { Header } from "@/components/layout/Header";
import { CustomerForm } from "@/components/customers/CustomerForm";

export default function NewCustomerPage() {
  return (
    <div>
      <Header title="Register Customer" subtitle="Add a new customer to the system" />
      <div className="p-6 max-w-3xl">
        <CustomerForm />
      </div>
    </div>
  );
}
