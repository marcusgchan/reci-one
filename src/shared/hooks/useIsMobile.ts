import { useState, useLayoutEffect } from "react";

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(true);

  useLayoutEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return isMobile;
};

export default useIsMobile;
