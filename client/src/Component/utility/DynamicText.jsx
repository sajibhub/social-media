import  { useState } from "react";

const DynamicText = ({ text , Length , Align,TestStyle }) => {
    const [isExpanded, setIsExpanded] = useState(false);


    const displayedText = isExpanded ? text : text.slice(0, Length);

    return (
        <div className={Align} >
            <p className={TestStyle}>
                {displayedText}
                {text.length > Length && !isExpanded && " ..."}
            </p>
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`mt-1 text-sky-500 underline hover:text-sky-700  `}
            >
                {text.length > Length && (
                    <>
                        {
                            isExpanded ? "See Less" : "See More"
                        }
                    </>
                )}
            </button>
        </div>
    );
};

export default DynamicText;