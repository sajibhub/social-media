import { MdVerified } from "react-icons/md";
import { useState } from "react";

const VerifiedBadge = ({ isVerified }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleClick = () => {
    setShowTooltip(!showTooltip);
  };

  return (
    <div className="relative inline-block">
      {isVerified && (
        <>
          <MdVerified
            className="text-blue-500 hover:red-500 text-xl cursor-pointer"
            title="Verified ID"
            onClick={handleClick}
          />
        </>
      )}
    </div>
  );
};

export default VerifiedBadge;
