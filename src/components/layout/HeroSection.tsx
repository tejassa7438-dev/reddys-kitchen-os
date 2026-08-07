function HeroSection() {
  return (
    <section className="text-center px-6">
      <p className="text-xl text-gray-200 font-medium">
    Fresh • Hygienic • Delicious
</p>

<p className="text-gray-400 mt-4 max-w-md mx-auto leading-7">
    Experience quick QR ordering, delicious vegetarian dishes,
    and seamless dining at REDDY'S KITCHEN.
</p>

      <button
  className="
    mt-10
    bg-gradient-to-r
    from-red-600
    to-red-700
    hover:from-red-700
    hover:to-red-800
    text-white
    px-10
    py-4
    rounded-2xl
    font-bold
    text-lg
    shadow-2xl
    transition-all
    duration-300
    hover:scale-105
  "
>
    🍽 Browse Menu
</button>
    </section>
  );
}

export default HeroSection;