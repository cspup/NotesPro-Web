import request from "../utils/request";

export function isLocked(noteId) {
    return request({
        method: 'GET',
        url: '/lock',
        params: {noteId}
    })
}

export function updateLock(noteId,locked){
    const lock = {
        noteId:noteId,
        locked,
        password:'1234'
    }
    return request({
        method: 'POST',
        url: '/lock',
        data: lock
    })
}

export function locked(noteId,password){
    const lock = {
        noteId:noteId,
        password:password
    }
    return request({
        method: 'POST',
        url: '/locked',
        data: lock
    })
}

export function unlock(noteId,password){
    const lock = {
        noteId:noteId,
        password:password
    }
    return request({
        method: 'POST',
        url: '/unlock',
        data: lock
    })
}