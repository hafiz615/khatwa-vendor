import ProductForm from "../components/product/ProductForm";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function AddProduct() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    toast.success("Product added successfully!");
    navigate("/dashboard/boutique");
  };

  return (
    <section className="p-6 w-full max-w-3xl mx-auto">
      <header className="mb-6">
        <h1 className="text-lg font-semibold">Add New Product</h1>
        <p className="text-sm text-gray-500">
          Fill in the details below to add your boutique product.
        </p>
      </header>

      <ProductForm onSuccess={handleSuccess} />
    </section>
  );
}

export default AddProduct;