import { Button } from "@nextui-org/react";
import Image from "next/image";
import Authentication from "@/components/authentication/Authentication";

export default function Welcome() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between py-24 px-4 bg-green-300">
      <div className="container mx-auto flex justify-between items-center h-full md:flex-row flex-col-reverse gap-4">
        <div className="space-y-4">
          <h1 className="sm:text-5xl xs:text-3xl xs:text-start text-center text-2xl font-black text-black">Make Financing<br /><span className="sm:text-7xl xs:text-5xl text-4xl tracking-wide uppercase">accessible</span></h1>
          <Authentication/>
        </div>
        {/* <div className="w-[600px] overflow-hidden flex justify-center"> */}
        <Image src={'/a.png'} alt="home-hero" width={350} height={200} className="md:ms-0 ms-20 lg:w-[350px] w-[250px] object-cover scale-x-[-1] me-[50px]"></Image>
        {/* </div> */}
      </div>
    </main>
  );
}
