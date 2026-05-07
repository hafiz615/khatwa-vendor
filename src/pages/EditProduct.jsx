import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import ProductForm from "../components/product/ProductForm";
import { fetchDetailedProduct } from "../services/product.service";
import { ArrowLeft } from "lucide-react";

function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!productId || !token) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const res = await fetchDetailedProduct(productId, token);
        if (cancelled) return;
        setProduct(res || null);
      } catch {
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [productId, token]);

  const handleSuccess = () => {
    toast.success("Product updated successfully!");
    navigate(`/dashboard/boutique/${productId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="loader" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="text-gray-600">Product not found or you cannot edit it.</p>
        <button
          type="button"
          onClick={() => navigate("/dashboard/boutique")}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to boutique
        </button>
      </div>
    );
  }

  return (
    <section className="p-6 w-full max-w-3xl mx-auto">
      <button
        type="button"
        onClick={() => navigate(`/dashboard/boutique/${productId}`)}
        className="flex items-center gap-2 text-gray-600 hover:text-black mb-4"
      >
        <ArrowLeft className="w-5 h-5" /> Back to product
      </button>
      <header className="mb-6">
        <h1 className="text-lg font-semibold">Edit product</h1>
        <p className="text-sm text-gray-500">
          Update details or images. Leave thumbnail and gallery empty to
          keep what you already have.
        </p>
      </header>

      <ProductForm
        mode="edit"
        productId={productId}
        initialProduct={product}
        onSuccess={handleSuccess}
      />
    </section>
  );
}

export default EditProduct;
