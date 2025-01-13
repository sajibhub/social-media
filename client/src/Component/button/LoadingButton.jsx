

const LoadingButton = (props) => {
    return (
        <>
            <button
                className="
                            w-full bg-sky-500 text-white py-2 rounded-lg hover:bg-sky-600 focus:outline-none
                            focus:ring-2 focus:ring-sky-500 focus:ring-offset-2
                            flex items-center justify-center gap-3 opacity-70
                            "
            >
                <div className="loader"></div>
                {props.text}

            </button>
        </>
    );
};

export default LoadingButton;