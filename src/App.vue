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
    <div id="editor">
        <p>Hello World!</p>
    </div>
</template>

<style scoped></style>
<script setup>
import { getLabel, getNote, updateNoteDelta } from '../src/api/notes'
import { isLocked, updateLock } from '../src/api/lock'
import { onMounted, nextTick, ref, watch } from 'vue';
const id = ref(0)
var lock = ref(false)
function handleUpdate(delta, label) {
    updateNoteDelta(id.value, label, delta).then(res => {
    }).catch(err => {
        console.log(err)
    })
}

function createLabel() {
    getLabel().then(res => {
        var label = res.data;
        window.location.replace("/" + label);
        return label
    }).catch(error => {
        console.log(error)
    })
}

function renderNote(editor, label) {
    getNote(label).then(res => {
        const data = res.data;
        if (data) {
            var content = JSON.parse(data['content'])
            editor.setContents(content)
            id.value = data['id']
            getLockStatus();
        }
    }).catch(function (error) {
        console.log(error)
    })
}


function init() {
    // 初始化
    var label;
    const pathname = window.location.pathname;
    if (pathname.length <= 1) {
        label = createLabel();
    } else {
        label = pathname.substring(1, pathname.length);
    }
    var editor = new Quill('#editor', {
        modules: { toolbar: '#toolbar' },
        theme: 'snow',
    });
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
function getLockStatus() {
    isLocked(id.value).then(res => {
        lock.value = res.data
    })
}

function locked() {
    updateLock(id.value, true).then(res => {
        lock.value = true
    })
}
function unLock() {
    updateLock(id.value, false).then(res => {
        lock.value = false
    })
}


</script>
