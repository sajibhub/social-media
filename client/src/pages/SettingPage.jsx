import Layout from "@/layout/Layout.jsx";
import PrivacySettings from "@/Component/setting/PrivacySettings.jsx";
import NotificationsSettings from "@/Component/setting/NotificationsSettings.jsx";


const SettingPage = () => {
    return (
        <Layout>
            <div className="w-full border-b-2 sticky top-0 bg-blur bg-white bg-opacity-20 z-[999999]">
                <h1 className=" text-center text-xl font-medium text-neutral-700 py-4">Setting </h1>
            </div>

            <PrivacySettings />
            <NotificationsSettings />
        </Layout>
    );
};

export default SettingPage;