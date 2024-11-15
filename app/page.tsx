import Hero from "@/components/hero";
import Image from "next/image";
import { relative } from "path";


export default function Home() {
  return (
    //sm:px-10 means for mobile devices with the width of 640px, the padding on the left and right side is 10px :3 
    <main className="relative bg-black-100 flex justify-center items-center flex-col overflow-hidden mx-auto sm:px-10 px-5">
      <div className="max-w-7xl w-full">
        <Hero />
      </div>
    </main>
  );
}
