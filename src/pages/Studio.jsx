import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import Button from "../components/common/Button";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setDesigns } from "../slices/studio";
import { getDesigenerFeturedDesigns } from "../services/studio.service";
import DesignCard from "../components/studio/DesignCard";

const Studio = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const { designs } = useSelector((state) => state.studio);
  const [loading, setLoading] = useState(false);
  const [deletingDesignId, setDeletingDesignId] = useState(null);

  useEffect(() => {
    const fetchDesigns = async () => {
      setLoading(true);
      try {
        const result = await getDesigenerFeturedDesigns(token);
        if (result) {
          dispatch(setDesigns(result));
        } else {
          toast.error("Failed to fetch designs");
        }
      } catch (error) {
        console.error("Error fetching designs", error);
        toast.error("Failed to fetch designs");
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchDesigns();
  }, [token, dispatch]);

  const handleDeleteStart = (designId) => {
    setDeletingDesignId(designId);
  };

  const handleDelete = (id) => {
    // Immediately remove from UI
    dispatch(setDesigns(designs.filter((d) => d._id !== id)));
    setDeletingDesignId(null);
  };

  if (!designs?.length && !loading) {
    return (
      <div className="min-h-[calc(100vh-50px)] flex flex-col justify-center items-center text-gray-500 text-center space-y-2">
        <p className="text-sm sm:text-lg">There are no designs yet.</p>
        <Button onClick={() => navigate("/dashboard/studio/add-design")}>Create Design</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10 px-5 lg:px-16">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-md sm:text-xl md:text-2xl font-bold text-gray-800">
          Studio
        </h1>
        <div className="flex justify-between">
          <p className="text-gray-500 mt-2">Explore Your designs</p>

          {
            loading === false && <Button onClick={() => navigate("/dashboard/studio/add-design")}>
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Create Design
            </span>
          </Button>
          }
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="loader" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
          {designs.map((item) => (
            <DesignCard
              key={item._id}
              item={item}
              onDelete={handleDelete}
              onDeleteStart={handleDeleteStart}
              onView={() => navigate(`/dashboard/studio/${item._id}`)}
              isAnyDeleting={deletingDesignId !== null}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Studio;