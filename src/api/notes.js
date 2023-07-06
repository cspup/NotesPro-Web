import request from "../utils/request";

export function getLabel() {
    return request({
        method: 'GET',
        url: '/getLabel',
    })
}

export function getNote(label) {
    return request({
        method: 'GET',
        url: '/note/' + label,
    })
}

export function updateNoteDelta(id,label,delta){
    const note = {
        id,
        label,
        content:JSON.stringify(delta)
    }
    return request({
        method: 'POST',
        url: '/note',
        data: note
    })
}

export function wsGetId(label) {
    return request({
        method: 'GET',
        url: '/ws/getId'
    })
}


