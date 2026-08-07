import logo from "../../assets/images/logo.png";

function Logo() {
  return (
    <div className="flex justify-center">
      <img
        src={logo}
        alt="REDDY'S KITCHEN"
        className="w-44 md:w-48 lg:w-52 drop-shadow-2xl"
      />
    </div>
  );
}

export default Logo;