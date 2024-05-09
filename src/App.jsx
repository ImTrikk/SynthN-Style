import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";
import { Slider } from "@mui/material";
import { resizeImage } from "../utils/resize";
import { GenerateArt } from "./components/GeneratedArt";

import { FaImage } from "react-icons/fa6";
import { Styles } from "./components/Styles";

function App() {
 const [formData, setFormData] = useState(new FormData());
 const [content, setContent] = useState(null);
 const [artStyle, setArtStyle] = useState(null);
 const [newArt, setNewArt] = useState(null);
 const [steps, setSteps] = useState(50);
 const [styleWeight, setStyleWeight] = useState(50);
 const [selectedStyle, setSelectedStyle] = useState(null);

 const [downloadArt, setDownloadArt] = useState(null);

 const handleGenerateArtCont = async () => {
  formData.set("steps", steps);
  formData.set("weight", styleWeight);
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

 const handleContentChange = (e) => {
  const file = e.target.files[0];
  resizeImage(file, 500, 500, function (resized) {
   const resizedContent = new File([resized], file.name, { type: file.type });
   setContent(URL.createObjectURL(resizedContent));
   formData.set("content", resizedContent);
  });
 };

 const handleArtStyleChange = (e) => {
  const file = e.target.files[0];
  resizeImage(file, 500, 500, function (resized) {
   const resizedStyle = new File([resized], file.name, { type: file.type });
   formData.set("style", resizedStyle); // Use set instead of append to replace the style
   handleStyleSelect(URL.createObjectURL(resizedStyle));
  });
 };

 const handleStyleSelect = async (styleUrl) => {
  try {
   const response = await fetch(styleUrl);
   const blobStyle = await response.blob();
   const fileStyle = new File([blobStyle], "style.png", { type: "image/png" });
   formData.set("style", fileStyle);
   setSelectedStyle(styleUrl);
   setArtStyle(styleUrl);
  } catch (error) {
   console.error("Error fetching or appending style file:", error);
  }
 };

 // handle the download functionality
 const handleDownload = () => {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(downloadArt);
  link.download = "output.png";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
 };

 return (
  <>
   <Toaster position="top-center" />
   <div className="flex flex-col items-center justify-center h-screen bg-black overflow-y-hidden p-40">
    <div className="w-full relative">
     <div className="absolute">
      <img src="/images/bg.png" alt="" className="w-[2000px]" />
     </div>
     <div className="my-2 flex items-center gap-3">
      <h1 className="font-black text-white text-2xl">
       SynthN'Style{" "}
      </h1>
       <span className="font-medium text-xs text-white">
        - A simple neural transfer desktop application
       </span>
     </div>
     <div className="p-10 bg-white rounded-lg shadow-lg bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-15 h-[600px]">
      <div className="flex gap-10">
       <div>
        <h1 className="text-xs text-white">Upload Photo</h1>
        <div className="flex flex-col">
         <label
          htmlFor="contentInput"
          className="w-[170px] h-[170px] mt-4 outline-dashed outline-white rounded-lg flex items-center justify-center cursor-pointer"
         >
          <div className="flex flex-col items-center text-center">
           <FaImage size={50} className="text-white" />
           <h1 className="text-xs text-white">
            Click here to select upload photo
           </h1>
          </div>
          <input
           type="file"
           id="contentInput"
           name="content"
           multiple
           onChange={handleContentChange}
           style={{ display: "none" }}
          />
         </label>
         {content && (
          <div className="mt-5">
           <h1 className="text-xs text-white">Selected photo: </h1>
           <img src={content} alt="" className="w-[170px] mt-2 rounded " />
          </div>
         )}
        </div>
        <div className="w-[170px] mt-5">
         <h1 className="text-xs text-white">Number of steps: </h1>
         <Slider
          defaultValue={50}
          max={500}
          aria-label="Default"
          valueLabelDisplay="auto"
          value={steps}
          onChange={(e, value) => setSteps(value)}
         />
         <h1 className="text-white text-xs">Style Weight</h1>
         <Slider
          defaultValue={1000}
          max={100000}
          aria-label="Default"
          valueLabelDisplay="auto"
          value={styleWeight}
          onChange={(e, value) => setStyleWeight(value)}
         />
        </div>
       </div>
       <div>
        <h1 className="text-xs text-white">Output:</h1>
        <div className="bg-[#16161d] w-[400px] h-[400px] mt-4 rounded-lg flex items-center justify-center">
         {newArt && <GenerateArt newArt={newArt} />}
        </div>
        <div className="mt-5">
         <h1 className="text-xs text-white">
          Upload your own style to match with content
         </h1>
         <label
          htmlFor="styleInput"
          className="h-10 mt-2 w-full rounded-2xl bg-white flex items-center justify-center text-xs cursor-pointer"
         >
          Upload style
          <input
           type="file"
           id="styleInput"
           name="style"
           multiple
           onChange={handleArtStyleChange}
           style={{ display: "none" }}
          />
         </label>
        </div>
       </div>
       <div>
        <h1 className="text-xs text-white">Styles:</h1>
        <div className="mt-4">
         <Styles selectedStyle={handleStyleSelect} />
        </div>
        <div className="flex items-center justify-between mb-4">
         <div className="mt-4">
          {artStyle && (
           <div>
            <h1 className="text-xs text-white">Selected style: </h1>
            <img src={artStyle} alt="" className="w-[120px] mt-2 rounded " />
           </div>
          )}
         </div>
         <div className="flex flex-col items-end w-[180px] justify-end mt-5 relative gap-4">
          <button
           onClick={handleDownload}
           className="px-5 w-full h-10 bg-white text-white text-xs rounded shadow-lg bg-clip-padding backdrop-filter backdrop-blur-lg bg-opacity-15"
          >
           Download
          </button>
          <button
           onClick={handleGenerateArtCont}
           className="px-5 text-xs w-full bg-blue-500 text-white font-bold h-10 flex items-center justify-center rounded"
          >
           Generate Artstyle✨
          </button>
         </div>
        </div>
       </div>
      </div>
     </div>
    </div>
   </div>
  </>
 );
}

export default App;
