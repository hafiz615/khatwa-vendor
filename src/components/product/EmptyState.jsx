import Button from "../common/Button";

function EmptyState({ onAdd }) {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center text-gray-500 text-center space-y-3">
      <p className="text-base sm:text-lg">No products yet.</p>
      <Button children="Add Product" onClick={onAdd} />
    </div>
  );
}

export default EmptyState;