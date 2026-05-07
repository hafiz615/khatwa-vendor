import { Trash2, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
function ProductInfo({ product, setConfirmationModal, handleDeleteContent, isAnyDeleting }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-3">
          {product.title}
        </h1>

        <p className="text-gray-600 text-sm mb-4">
          Category:{" "}
          <span className="font-medium text-gray-800">
            {product.category?.name || product.category}
          </span>
        </p>

        <p className="text-gray-700 leading-relaxed mb-6">
          {product.description}
        </p>

        <div className="flex items-center gap-4 mb-4">
          <p className="text-2xl font-semibold text-gray-900">
            KWD {product.price}
          </p>
          {/* <div className="flex items-center gap-2 text-sm">
            {product.availability ? (
              <span className="flex items-center text-green-600">
                <CheckCircle className="w-4 h-4 mr-1" /> In Stock
              </span>
            ) : (
              <span className="flex items-center text-red-600">
                <XCircle className="w-4 h-4 mr-1" /> Out of Stock
              </span>
            )}
          </div> */}
        </div>

        <p className="text-sm text-gray-500 mb-6">
          <span className="font-medium">{product.amountSold}</span> units sold
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => navigate(`/dashboard/boutique/edit/${product._id}`)}
          disabled={isAnyDeleting}
          className={`inline-flex w-fit items-center gap-2 px-4 py-2 rounded-lg font-medium
            border border-blue-400 text-blue-700 bg-blue-50
            transition-all duration-200
            ${
              isAnyDeleting
                ? "cursor-not-allowed opacity-50"
                : "hover:bg-blue-100 hover:border-blue-500"
            }`}
        >
          <Pencil className="w-4 h-4" />
          Edit product
        </button>
      <button
  onClick={(e) => {
    e.preventDefault();
    setConfirmationModal({
      text1: `Delete this product?`,
      text2: `Are you sure you want to delete this product.`,
      btn1Text: "Delete",
      btn2Text: "Cancel",
      btn1Handler: () => handleDeleteContent(),
      btn2Handler: () => setConfirmationModal(null),
    });
  }}
  disabled={isAnyDeleting}
  className={`inline-flex w-fit items-center gap-2 px-4 py-2 rounded-lg font-medium
    border border-red-400 text-red-600 bg-red-50
    transition-all duration-200
    ${isAnyDeleting
      ? "cursor-not-allowed opacity-50"
      : "hover:bg-red-100 hover:border-red-500 hover:text-red-700"}`}
>
  <Trash2 className="w-4 h-4" />
  Delete
</button>
      </div>

    </div>
  );
}

export default ProductInfo;
// ProductInfo.propTypes = {
//   product: PropTypes.object.isRequired,
// };
