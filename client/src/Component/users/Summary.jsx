import ProfileSummaryComponent from "./ProfileSummaryComponent.jsx";
import SuggestUserComponent from "./SuggestUserComponent.jsx";


const Summary = () => {
    const pathname = window.location.pathname;
    return (
        <>
            {
                pathname !== "/profile/me" && <ProfileSummaryComponent />
            }

            <SuggestUserComponent />
        </>
    );
};

export default Summary;