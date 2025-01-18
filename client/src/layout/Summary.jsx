import SummaryProfileComponent from "../Component/summary/SummaryProfileComponent.jsx";
import SummarySuggested from "../Component/summary/SummarySuggested.jsx";


const Summary = () => {
    const pathname = window.location.pathname;
    return (
        <>
            {
                pathname !== "/profile/me" && <SummaryProfileComponent />
            }

            <SummarySuggested />
        </>
    );
};

export default Summary;