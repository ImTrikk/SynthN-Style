import { useEffect, useState } from "react";
import { Styles } from "./Styles";
import { Toaster, toast } from "sonner";

export const RightPanel = ({
 artStyle,
 selectedPreStyle,
 generateArt,
 downloadArt,
}) => {
 const [selectedStyle, setSelectedStyle] = useState(null);

 const handleDownload = () => {
  if (downloadArt) {
   const link = document.createElement("a");
   link.href = URL.createObjectURL(downloadArt);
   link.download = "output.png";
   document.body.appendChild(link);
   link.click();
   document.body.removeChild(link);
  } else {
   toast.error("Generate Art Style First!");
  }
 };

 const handleStyleSelect = (e) => {
  selectedPreStyle(e);
 };

 const triggerGenerate = () => {
  generateArt(true);
 };

 useEffect(() => {
  setSelectedStyle(artStyle);
 }, [artStyle]);

 return (
  <>
   <div className="flex flex-col max-w-[430px]">
    <h1 className="text-xs text-white">Styles:</h1>
    <div className="mt-4">
     <Styles selectedStyle={handleStyleSelect} />
    </div>
    <div className="flex items-end justify-between mb-4">
     <div className="mt-4">
      {selectedStyle && (
       <div>
        <h1 className="text-xs text-white">Selected style: </h1>
        <img
         src={URL.createObjectURL(selectedStyle)}
         alt=""
         className="w-[120px] mt-2 rounded"
        />
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
       onClick={triggerGenerate}
       className="px-5 text-xs w-full bg-blue-500 text-white font-bold h-10 flex items-center justify-center rounded"
      >
       Generate Artstyle✨
      </button>
     </div>
    </div>
   </div>
  </>
 );
};
