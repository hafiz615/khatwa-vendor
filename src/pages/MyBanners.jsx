import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import Button from "../components/common/Button";
import BannerCard from "../components/banner/BannerCard";
import { getVendorBanners } from "../services/banner.service";
import { hasBannerAccess } from "../utils/subscriptionAccess";

function MyBanners() {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const subscriptionState = useSelector((state) => state.subscription);
  const allowed = hasBannerAccess(subscriptionState);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingBannerId, setDeletingBannerId] = useState(null);

  useEffect(() => {
    const fetchBanners = async () => {
      setLoading(true);
      const data = await getVendorBanners(token);
      if (data) {
        setBanners(data);
      } else {
        toast.error("Failed to fetch banners");
      }
      setLoading(false);
    };
    if (token) fetchBanners();
  }, [token]);

  const handleDeleteStart = (bannerId) => setDeletingBannerId(bannerId);
  const handleDelete = (deletedBannerId) => {
    setBanners((prev) => prev.filter((b) => b._id !== deletedBannerId));
    setDeletingBannerId(null);
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-50px)] flex justify-center items-center">
        <div className="loader" />
      </div>
    );
  }

  if (!allowed) {
    return (
      <div className="min-h-[calc(100vh-50px)] flex flex-col justify-center items-center text-gray-600 space-y-3 text-center">
        <p className="text-sm sm:text-lg md:text-xl">
          Your subscription does not include banner access.
        </p>
        <Button onClick={() => navigate("/dashboard/my-subscription")}>
          Upgrade Subscription
        </Button>
      </div>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <div className="min-h-[calc(100vh-50px)] flex flex-col justify-center items-center text-gray-500 space-y-2 text-center">
        <p className="text-sm sm:text-lg md:text-xl">
          You haven&apos;t submitted any banners yet.
        </p>
        <Button onClick={() => navigate("/dashboard/banners/add-banner")}>
          Create Banner
        </Button>
      </div>
    );
  }

  return (
    <section className="w-full">
      <header className="mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-md sm:text-xl md:text-2xl lg:text-3xl font-semibold">
            My Banners
          </h1>
          <p className="text-sm text-gray-500">
            {banners.length} {banners.length === 1 ? "banner" : "banners"} submitted
            {banners.some((b) => b.approvalStatus === "rejected") && (
              <span className="block text-gray-600 mt-1">
                Rejected banners can stay for your records. Use{" "}
                <span className="font-medium">Add Banner</span> or{" "}
                <span className="font-medium">Submit a new banner for review</span> on a
                rejected card to send a fresh creative for approval.
              </span>
            )}
          </p>
        </div>
        <Button onClick={() => navigate("/dashboard/banners/add-banner")}>
          Add Banner
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {banners.map((banner) => (
          <BannerCard
            key={banner._id}
            banner={banner}
            onDelete={handleDelete}
            onDeleteStart={handleDeleteStart}
            isAnyDeleting={deletingBannerId !== null}
          />
        ))}
      </div>
    </section>
  );
}

export default MyBanners;
