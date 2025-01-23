import { create } from 'zustand'

const uiManage = create((set) => ({
    author: "signIn",
    setAuthor : (e) => set({author : e}),

    profile_tab: "my-post",
    set_profile_tab : (e) => set({profile_tab : e}),

    edit_profile_Ui_Control: null,
    set_edit_profile_Ui_Control : (e) => set({edit_profile_Ui_Control : e}),


}))

export default uiManage ;