import React, { useState, useEffect } from "react";

export const GenerateArt = ({ newArt }) => {
 const [art, setArt] = useState(newArt);

 useEffect(() => {
  // Update the art state whenever newArt changes
  setArt(newArt);
 }, [newArt]);

 return (
  <>
   <img src={art} alt="" className="w-[480px] h-[480px] rounded" />
  </>
 );
};
