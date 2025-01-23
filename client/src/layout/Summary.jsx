import ProfileSummaryComponent from "../Component/users/ProfileSummaryComponent.jsx";
import SuggestUserComponent from "../Component/users/SuggestUserComponent.jsx";


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