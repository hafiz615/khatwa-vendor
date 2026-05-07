import DesignForm from "../components/studio/DesignForm";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function AddDesign() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    toast.success("Design added successfully!");
    navigate("/dashboard/studio");
  };

  return (
    <section className="p-6 w-full max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-lg font-semibold">Add New Design</h1>
        <p className="text-sm text-gray-500">
          Fill in the details below to add your design.
        </p>
      </header>

      <DesignForm onSuccess={handleSuccess} />
    </section>
  );
}

export default AddDesign;