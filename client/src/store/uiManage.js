import { create } from 'zustand'

const uiManage = create((set) => ({
    author: "signIn",
    setAuthor : (e) => set({author : e}),
}))

export default uiManage ;