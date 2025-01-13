
const LoadingButtonFit = (props) => {
    return (
        <>
            <button
                className="
                             border bg-sky-500 text-white py-2 px-3  focus:outline-none
                            flex items-center justify-center gap-3 opacity-70 rounded-full
                            "
            >
                <div className="loader"></div>
                {props.text}

            </button>
        </>
    );
};

export default LoadingButtonFit;