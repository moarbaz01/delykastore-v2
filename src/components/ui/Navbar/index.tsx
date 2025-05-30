"use client";
import { Leaderboard, Search } from "@mui/icons-material";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import axios from "axios";
import GameComponent from "@/components/GameComponent";

const Navbar = () => {
  const pathname = usePathname();
  const [products, setProducts] = useState([]);
  const [show, setShow] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProducts, setFilterProducts] = useState(products);

  useEffect(() => {
    const temp = products;
    const filteredProducts = temp?.filter((product: any) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilterProducts(filteredProducts);
  }, [searchQuery, products]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/api/product");
        if (res.status === 200) {
          setProducts(res.data);
          setFilterProducts(res.data);
        }
      } catch (error) {
        console.log("Error");
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  const closeSearch = () => {
    setSearchQuery("");
    setShow(false);
  };

  useEffect(() => {
    setSearchQuery("");
    setShow(false);
  }, [pathname]);

  useEffect(() => {
    if (show) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [show]);

  if (pathname.includes("dashboard")) {
    return null;
  }
  return (
    <>
      <div className="py-4 border-b bg-black border-white/20 relative z-[999] h-[90px] flex items-center px-4 justify-center">
        <div className="max-w-screen-xl w-full  flex items-center gap-4 justify-between ">
          <Link href="/" className="flex items-center aspect-square  ">
            <Image
              src="/images/logo.gif"
              alt="Win Win Topup"
              width={200}
              height={80}
              className=" h-[60px] w-full"
              priority
            />
            {/* {!show && (
              <Image
                src="/images/logo.gif"
                alt="Win Win Topup"
                width={70}
                height={70}
                className=" h-full w-full md:hidden rounded-full"
                priority
              />
            )} */}
          </Link>

          {/* <div className="flex items-center gap-4 w-full md:w-1/2">
            <div className="flex items-center w-full  gap-2 py-2 px-2 bg-white rounded-lg">
              <Search className="text-[#545454]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShow(true)}
                placeholder="Search"
                className="  outline-none transition w-full  text-[#545454]"
              />
            </div>
            {show && (
              <div className="flex items-center gap-2">
                <button
                  onClick={closeSearch}
                  className=" text-3xl p-2"
                  aria-label="Close search"
                >
                  ×
                </button>
              </div>
            )}
          </div> */}
          {/* <div
            className={`items-center ${show ? "hidden md:flex" : "flex"} gap-2`}
          >
            <div className="text-lg text-[#545454] py-1 px-2 bg-white rounded-lg">
              <Leaderboard />
            </div>
            <div className="text-lg text-[#545454] font-semibold px-4 py-1 bg-white rounded-lg">
              Login
            </div>
          </div> */}
        </div>
      </div>

      {/* {show && (
        <div className="bg-[#1c1c1c] overflow-auto  backdrop-blur-sm fixed z-[100] px-4 top-0 left-0 w-full h-full pt-28">
          <div className="grid grid-cols-3 max-w-screen-xl mx-auto md:grid-cols-3 lg:grid-cols-4 md:gap-6 gap-4 mt-4">
            {filterProducts?.length > 0 ? (
              filterProducts?.map((item) => (
                <GameComponent
                  key={item._id.toString()}
                  _id={item._id.toString()}
                  name={item.name}
                  image={item.image}
                  stock={item.stock}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-[#545454] text-lg">
                  {searchQuery && `No games found for "${searchQuery}"`}
                </p>
              </div>
            )}
          </div>
        </div>
      )} */}
    </>
  );
};

export default Navbar;
