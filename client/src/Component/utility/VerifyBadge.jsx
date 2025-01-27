import { MdVerified } from "react-icons/md";

const VerifiedBadge = ({ isVerified }) => {


  return (
    <div className="relative inline-block">
      {isVerified && (

        <MdVerified
          className="text-blue-500 hover:red-500 text-xl cursor-pointer"
          title="Verified ID"
        />

      )}
    </div>
  );
};

export default VerifiedBadge;
