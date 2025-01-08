import { create } from 'zustand'

const uiManage = create((set) => ({
    author: "signIn",
    setAuthor : (e) => set({author : e}),
    
    comment:false,
    setComment:(c) => set({comment : c}),

}))

export default uiManage ;