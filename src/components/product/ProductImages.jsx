// import PropTypes from "prop-types";
import { useState } from "react";

function ProductImages({ title, images = [], thumbnail }) {
  const [activeImage, setActiveImage] = useState(thumbnail || images[0]);

  const allImages = [thumbnail, ...images].filter(
    (v, i, a) => v && a.indexOf(v) === i
  );

  return (
    <div>
      {/* Main Image */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden border">
        <img
          src={activeImage}
          alt={title}
          className="w-full h-full object-cover transition-all duration-300 ease-in-out"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 mt-4 overflow-x-auto">
        {allImages.map((img, index) => (
          <button
            key={index}
            onClick={() => setActiveImage(img)}
            className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
              activeImage === img
                ? "border-gray-900"
                : "border-transparent hover:border-gray-300"
            }`}
          >
            <img
              src={img}
              alt={`Product ${index}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProductImages;
// ProductImages.propTypes = {
//   title: PropTypes.string.isRequired,
//   images: PropTypes.array,
//   thumbnail: PropTypes.string,
// };
