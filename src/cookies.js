'use server'

import { cookies } from "next/headers"

export const setCookies = async (email, id, name, photo) => {
    try {
        // const { id, name, username, email, image, type, phone_number } = await checkUserLogin(emailz, namez, imagez, uid)
        cookies().set('email', email)
        cookies().set('id', id)
        cookies().set('name', name)
        cookies().set('photo', photo)
        return
    } catch (e) {
        return { msg: e.message, error: e.errorCode }
    }
}

export const getCookies = () => {
    const email = cookies().get('email') ? cookies().get('email').value : ''
    const id = cookies().get('id') ? cookies().get('id').value : ''
    const name = cookies().get('name') ? cookies().get('name').value : ''
    const photo = cookies().get('photo') ? cookies().get('photo').value : ''
    return { email, id, name, photo }
}

export const removeCookies = () => {
    cookies().delete('email')
    cookies().delete('id')
    cookies().delete('name')
    cookies().delete('photo')
    return
}