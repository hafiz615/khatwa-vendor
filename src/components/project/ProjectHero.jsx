function ProjectHero({ imageUrl, title }) {
  if (!imageUrl) return null;

  return (
    <div className="relative w-full h-72 sm:h-96">
      <img
        src={imageUrl}
        alt={title}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
    </div>
  );
}

export default ProjectHero;