type RestaurantHeaderProps = {
  name: string;
  tagline: string;
};

function RestaurantHeader({
  name,
  tagline,
}: RestaurantHeaderProps) {
  return (
    <header className="text-center pt-4 pb-2">
      <h1 className="text-5xl md:text-6xl font-extrabold tracking-wide text-red-600">
        {name}
      </h1>

      <p className="mt-3 text-2xl font-semibold text-yellow-400">
        {tagline}
      </p>
    </header>
  );
}

export default RestaurantHeader;