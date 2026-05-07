// Boutique.jsx
import { useState, useEffect } from "react";
import { Plus, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Button from "../components/common/Button";
import ProductCard from "../components/product/ProductCard";
import { useDispatch, useSelector } from "react-redux";
import { setProducts } from "../slices/product";
import { fetchDesignerProducts } from "../services/product.service";

function Boutique() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const { products } = useSelector((state) => state.product);
  const [loading, setLoading] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const result = await fetchDesignerProducts(token);
        if (result) {
          dispatch(setProducts(result));
        } else {
          toast.error("Failed to fetch products");
        }
      } catch (error) {
        console.error("Error fetching products", error);
        toast.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchProducts();
  }, [token, dispatch]);

  const handleDeleteStart = (productId) => {
    setDeletingProductId(productId);
  };

  const handleDelete = (id) => {
    // Immediately remove from UI
    dispatch(setProducts(products.filter((p) => p._id !== id)));
    setDeletingProductId(null);
  };

  if (!products?.length && !loading) {
    return (
      <div className="min-h-[calc(100vh-50px)] flex flex-col justify-center items-center text-gray-500 text-center space-y-2">
        <p className="text-sm sm:text-lg">There are no products yet.</p>
        <Button onClick={() => navigate("/dashboard/boutique/add-product")}>Create Product</Button>
      </div>
    );
  }

  return (
    <section className="w-full">
      {/* Header */}
      <header className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-md sm:text-xl md:text-2xl lg:text-3xl font-semibold flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" />
            Boutique Products
          </h1>
          <p className="text-xs md:text-sm text-gray-500">
            Manage and showcase your available products
          </p>
          {products?.length > 0 && (
            <p className="text-xs md:text-sm text-gray-500">
              {products.length} {products.length === 1 ? "Product" : "Products"}{" "}
              uploaded
            </p>
          )}
        </div>

        {loading === false && (
          <Button onClick={() => navigate("/dashboard/boutique/add-product")}>
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </span>
          </Button>
        )}
      </header>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="loader" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onDelete={handleDelete}
              onDeleteStart={handleDeleteStart}
              onView={() => navigate(`/dashboard/boutique/${product._id}`)}
              onEdit={() => navigate(`/dashboard/boutique/edit/${product._id}`)}
              isAnyDeleting={deletingProductId !== null}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Boutique;
