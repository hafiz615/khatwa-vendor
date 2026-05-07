import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchDetailedProduct } from "../services/product.service";
import ProductImages from "../components/product/ProductImages";
import ProductInfo from "../components/product/ProductInfo";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Modal from "../components/common/Modal";
import toast from "react-hot-toast";
import { deleteProduct } from "../services/product.service";
import { setProducts } from "../slices/product";

function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { products } = useSelector((state) => state.product);
  const [confirmationModal, setConfirmationModal] = useState(null);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetchDetailedProduct(productId, token);
        if (res) setProduct(res);
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId, token]);

  // const handleDeleteStart = (productId) => {
  //     setDeletingProductId(productId);
  //   };

  // const handleDelete = (id) => {
  //   // Immediately remove from UI
  //   dispatch(setProducts(products.filter((p) => p._id !== id)));
  //   setDeletingProductId(null);
  // };

  const handleDeleteContent = async () => {
    setConfirmationModal(null);
    setDeletingProductId(productId); // Notify parent that delete started
    const toastId = toast.loading("Deleting...");

    try {
      const result = await deleteProduct(product._id, token);
      if (result) {
        toast.success("Deleted successfully", { id: toastId });
        dispatch(setProducts(products.filter((p) => p._id !== productId)));
        setDeletingProductId(null); // Remove from UI
        navigate("/dashboard/boutique");
      } else {
        toast.error("Could not delete. try again", { id: toastId });
        setDeletingProductId(null); // Reset deleting state on failure
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Could not delete, try again", { id: toastId });
      setDeletingProductId(null); // Reset deleting state on error
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="loader"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center text-gray-600 mt-10">
        <p>Product not found.</p>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-black"
      >
        <ArrowLeft className="w-5 h-5" /> Back to Boutique
      </button>
      <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        <ProductImages
          title={product.title}
          images={product.images}
          thumbnail={product.thumbnail}
        />
        <ProductInfo
          product={product}
          setConfirmationModal={setConfirmationModal}
          handleDeleteContent={handleDeleteContent}
          isAnyDeleting={deletingProductId !== null}
        />
      </div>
      {confirmationModal && <Modal data={confirmationModal} />}
    </>
  );
}

export default ProductDetails;