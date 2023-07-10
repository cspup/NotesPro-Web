<template>
    <div id="toolbar">
        <select class="ql-size">
            <option value="small"></option>
            <!-- Note a missing, thus falsy value, is used to reset to default -->
            <option selected></option>
            <option value="large"></option>
            <option value="huge"></option>
        </select>
        <button class="ql-bold" title="Blod">Bold</button>
        <button class="ql-italic" title="Italic">Italic</button>
        <button class="ql-link" title="link">Link</button>
        <button class="ql-underline" title="underline">Underline</button>
        <button class="ql-code" title="code">Code</button>
        <button class="unlock" title="unLock" type="button" v-on:click="unLock()"><svg viewBox="0 0 48 48" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <rect x="7" y="22.0476" width="34" height="22" rx="2" fill="none" stroke="#333" stroke-width="4"
                    stroke-linejoin="round" />
                <path
                    d="M14 22V14.0047C13.9948 8.87022 17.9227 4.56718 23.0859 4.05117C28.249 3.53516 32.9673 6.97408 34 12.0059"
                    stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M24 30V36" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            </svg></button>
        <button class="lock" title="Lock" type="button" v-on:click="locked()"><svg viewBox="0 0 48 48" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="22" width="36" height="22" rx="2" fill="none" stroke="#333" stroke-width="4"
                    stroke-linejoin="round" />
                <path d="M14 22V14C14 8.47715 18.4772 4 24 4C29.5228 4 34 8.47715 34 14V22" stroke="#333" stroke-width="4"
                    stroke-linecap="round" stroke-linejoin="round" />
                <path d="M24 30V36" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        </button>
        <modal v-if="showModal" @close="showModal = false">
            <div>hello</div>
        </modal>
        <button class="delete" title="delete" type="button">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 10V44H39V10H9Z" fill="none" stroke="#333" stroke-width="4" stroke-linejoin="round" />
                <path d="M20 20V33" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M28 20V33" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 10H44" stroke="#333" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M16 10L19.289 4H28.7771L32 10H16Z" fill="none" stroke="#333" stroke-width="4"
                    stroke-linejoin="round" />
            </svg>
        </button>

    </div>
    <div id="editor" ref="editor_ref">
        <p>Hello World!</p>
    </div>
</template>

<script setup>
import { getLabel, getNote, wsGetId } from '../src/api/notes'
import { isLocked as getLockStatus, unlock as doUnlock, locked as doLocked } from '../src/api/lock'
import { onMounted, nextTick, ref, watch } from 'vue';
import Quill from 'quill'
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import { websocketURL } from './utils/request'

const id = ref(0)
var lock = ref(false)
var showModal = false
var logicTime=0
const note = {
    id:0,
    label:'',
    content:'',
    logicTime:0
}
var wsId = 0
var editor = null
const editor_ref = ref(null)
var label
let websocket
function handleUpdate(delta, label) {
    note.id = id.value;
    note.label = label;
    note.content = JSON.stringify(delta);
    note.logicTime = logicTime+1;
    websocket.send(JSON.stringify(note));
    // updateNoteDelta(id.value, label, delta).then(res => {
    // }).catch(err => {
    //     console.log(err)
    // })
}

function createLabel() {
    getLabel().then(res => {
        label = res.data;
        window.location.replace("/" + label);
        return label
    }).catch(error => {
        console.log(error)
    })
}

function renderNote(editor, label) {
    getNote(label).then(res => {
        let data = res.data;
        if (data) {
            let content = JSON.parse(data['content'])
            editor.setContents(content)
            id.value = data['id']
            logicTime = data['logicTime']
            isLocked();
        }
    }).catch(function (error) {
        console.log(error)
    })
}


function init() {
    editor = new Quill('#editor', {
        modules: { toolbar: '#toolbar' },
        theme: 'snow',
    });
    // 初始化
    let pathname = window.location.pathname;
    if (pathname.length <= 1) {
        label = createLabel();
    } else {
        label = pathname.substring(1, pathname.length);
    }
    wsGetId().then(res => {
        wsId = res.data;
        initWebSocket(wsId,label);
    }).catch(error => {
        console.log(error)
    })

    renderNote(editor, label);
    editor.on('text-change', function (delta, oldDelta, source) {
        if (source === 'api') {
            console.log("An API call triggered this change.");
        } else if (source === 'user') {
            handleUpdate(editor.getContents(), label)
        }
    });
    editor.focus();
    // 监听lock变化
    watch(lock, async () => {
        if (lock.value == true) {
            editor.enable(false);
        } else {
            editor.enable();
        }
    });
    
}
onMounted(() => {
    nextTick(() => {
        // 初始化
        init();
    })
});
function isLocked() {
    getLockStatus(id.value).then(res => {
        lock.value = res.data
    })
}

function locked() {
    doLocked(id.value).then(res => {
        lock.value = true
    })
}
function unLock() {
    doUnlock(id.value).then(res => {
        lock.value = false
    })
}

/**
 * 初始化websocket连接
 */
function initWebSocket(wsId,label) {
    let uId = wsId;
    websocket = null;
    if ('WebSocket' in window) {
        websocket = new WebSocket(websocketURL + '/noteWs/' + uId+"?label="+label);
    } else {
        alert("该浏览器不支持websocket！");
    }
    websocket.onopen = function (event) {
        console.log("建立连接");
        // websocket.send('Hello WebSockets!');
    }
    websocket.onclose = function (event) {
        console.log('连接关闭')
        reconnect(label); //尝试重连websocket
    }
    //建立通信后，监听到后端的数据传递
    websocket.onmessage = function (event) {
        let data = JSON.parse(event.data);
        // 记录光标位置
        let index = editor.selection.savedRange.index
        let content = JSON.parse(data.content)
        logicTime = data.logicTime;
        editor.setContents(content)
        editor.setSelection(index)
    }
    websocket.onerror = function () {
        notify.warn("websocket通信发生错误！");
        initWebSocket()
    }
    window.onbeforeunload = function () {
        websocket.close();
    }
    return websocket
}
    // 重连
function reconnect(label) {
    console.log("正在重连");
    // 进行重连
    setTimeout(function () {
        wsGetId().then(res => {
            wsId = res.data;
            initWebSocket(wsId,label);
        }).catch(error => {
            console.log(error)
        })
    }, 1000);
}



</script>
<style scoped>
#editor{
    caret-color:red;
}
</style>
