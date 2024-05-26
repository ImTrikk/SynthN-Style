/** @format */

import { useState } from "react";
import { Toaster, toast } from "sonner";
import { resizeImage } from "../utils/resize";
import { LeftComponent } from "./components/leftComponent";
import { CenterPanel } from "./components/CenterPanel";
import { RightPanel } from "./components/RightPanel";

function App() {
 const [formData, setFormData] = useState(new FormData());
 const [artStyle, setArtStyle] = useState(null);
 const [newArt, setNewArt] = useState(null);
 const [downloadArt, setDownloadArt] = useState(null);

 //  api call for hanldling neural transfer
 const handleGenerateArtCont = async () => {
  toast.promise(
   fetch("http://localhost:5000/upload", {
    method: "POST",
    body: formData,
   })
    .then(async (res) => {
     if (res.ok) {
      const blob = await res.blob();
      const imageUrl = URL.createObjectURL(blob);
      setDownloadArt(blob);
      setNewArt(imageUrl);
      return "Art generated successfully";
     } else {
      const errorMessage = await res.text();
      throw new Error(errorMessage);
     }
    })
    .catch((error) => {
     throw new Error(`Internal server error: ${error}`);
    }),
   {
    loading: "Generating art...",
    success: (message) => toast.success(message),
    error: (error) => toast.error(error.message),
   }
  );
 };

 const contentChange = (e) => {
  formData.set("content", e);
 };

 const stepsChange = (e) => {
  formData.set("steps", e);
 };

 const styleWeightChange = (e) => {
  formData.set("weight", e);
 };

 //  selecting custom art style by file
 const handleArtStyleChange = (e) => {
  const file = e.target.files[0];
  resizeImage(file, 500, 500, function (resized) {
   const resizedStyle = new File([resized], file.name, {
    type: file.type,
   });
   formData.set("style", resizedStyle);
   setArtStyle(resizedStyle);
   handleStyleSelect(URL.createObjectURL(resizedStyle));
  });
 };

 //  selecting the art style
 const handleStyleSelect = async (styleUrl) => {
  try {
   const response = await fetch(styleUrl);
   const blobStyle = await response.blob();
   const fileStyle = new File([blobStyle], "style.png", {
    type: "image/png",
   });
   formData.set("style", fileStyle);
   // setSelectedStyle(fileStyle);
   setArtStyle(fileStyle);
  } catch (error) {
   console.error("Error fetching or appending style file:", error);
  }
 };

 //trigger generate art
 const generateArt = (e) => {
  if (e) {
   handleGenerateArtCont();
  }
 };

 return (
  <>
   <div className="flex flex-col items-center justify-center h-screen overflow-y-hidden bg-black">
   <Toaster position="top-center" />
    <div className="w-full relative lg:max-w-7xl 2xl:mx-auto">
     <div className="absolute">
      <img src="/images/bg.png" alt="" className="w-[2000px]" />
     </div>
     <div className="p-4 bg-white rounded-lg shadow-lg bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-15 h-auto mx-auto lg:max-w-7xl 2xl:mx-auto">
      <div className="my-2 flex items-center gap-3">
       <h1 className="font-black text-white text-2xl">SynthN'Style </h1>
       <span className="font-medium text-sm text-white">
        - Art Application Using Neural Transfer with VGG19
       </span>
      </div>
      <div className="my-2 mb-6">
       <hr />
      </div>
      <div className="flex justify-between px-6">
       {/* left */}
       <LeftComponent
        contentChange={(e) => contentChange(e)}
        stepsChange={(e) => stepsChange(e)}
        styleWeightChange={(e) => styleWeightChange(e)}
       />
       {/* center */}
       <CenterPanel
        newArt={newArt}
        handleArtStyleChange={(e) => handleArtStyleChange(e)}
       />
       {/* right */}
       <RightPanel
        artStyle={artStyle}
        selectedPreStyle={(e) => handleStyleSelect(e)}
        generateArt={(e) => generateArt(e)}
        downloadArt={downloadArt}
       />
      </div>
     </div>
    </div>
   </div>
  </>
 );
}

export default App;
