import { MdVerified } from "react-icons/md";

const VerifiedBadge = ({ isVerified }) => {


  return (
    <div className="relative inline-block">
      {isVerified && (

        <MdVerified
          className="text-blue-500 duration-500 hover:text0 text-xl cursor-pointer"
          title="Verified ID"
        />

      )}
    </div>
  );
};

export default VerifiedBadge;
