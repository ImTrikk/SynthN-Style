import { useState } from "react";

export const Styles = ({ selectedStyle }) => {
 const initialStyles = [
  {
   img_1: "/images/popart 1.png",
   img_2: "/images/romanticism_paint 1.png",
   img_3: "/images/soft_ghilbi 1.png",
   img_4: "/images/Van_Gogh_-_Starry_Night_-_Google_Art_Project 1.png",
   img_5: "/images/0bf00683-4597-40c8-8f11-0282ccda186d_570.png",
   img_6: "/images/abrir-Mona-Lisa.png",
   img_7: "/images/Abstract-Art.png",
   img_8: "/images/Bedroom-oil-canvas-Vincent-van-Gogh-Art-1889.png",
   img_9: "/images/change-inspire-pass-it-on-jennifer-main.png",
  },
 ];

 const [pressedIndex, setPressedIndex] = useState(null);
 const [style, setStyle] = useState(null);

 const handleImageClick = (index, img) => {
  if (pressedIndex === index) {
   setPressedIndex(null);
   setStyle(null);
   selectedStyle(null); // Reset selected style
  } else {
   setPressedIndex(index);
   setStyle(img);
   selectedStyle(img); // Pass the selected image URL directly
  }
 };

 return (
  <>
   <div>
    {initialStyles.map((styleObj, styleIndex) => (
     <div key={styleIndex} className="flex flex-wrap gap-2">
      {Object.entries(styleObj).map(([key, img], imgIndex) => (
       <img
        key={key}
        src={img}
        alt={`Style ${styleIndex + 1} Image ${imgIndex + 1}`}
        className={`w-[100px] ${
         pressedIndex === styleIndex * 4 + imgIndex
          ? "border-blue-500 bg-blur border-2"
          : ""
        }`}
        onClick={() => handleImageClick(styleIndex * 4 + imgIndex, img)}
       />
      ))}
     </div>
    ))}
   </div>
  </>
 );
};
